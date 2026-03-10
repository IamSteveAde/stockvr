import { EventEmitter } from "events"

import { redis } from "../helpers/db/redis";
import { prisma } from "../helpers/db/client";
// import { TProductEntry } from "../controllers/shifts/end/util";

export type TProductEntry = {
    inventoryUid: string,
    count: number,
    businessUid: string,
    shiftUid: string,
    initialCount: number,
    baseShiftUid: string
}

export namespace Variance {
    /*
    * @key: the Scopekey created from endShiftEntry
    */
    export async function process(key: string) {
        const value = await redis.rpop(key)

        if (value) {
            const endEntry = JSON.parse(value) as TProductEntry
            const entryAggregate = await getStockEntryAggregate(endEntry.inventoryUid, endEntry.shiftUid)


            const expectedCount = endEntry.initialCount + (entryAggregate._sum.quantity || 0)
            const variance_ = expectedCount - endEntry.count

            const variance = {
                shiftUid: endEntry.shiftUid,
                inventoryUid: endEntry.inventoryUid,
                businessUid: endEntry.businessUid,
                actualCount: endEntry.initialCount,
                expectedCount,
                variance: variance_,
                baseShiftUid: endEntry.baseShiftUid
            }

            console.log("variance ===> ", variance)
            return variance
        }
    }

    export async function getStockEntryAggregate(inventoryUid: string, shiftUid: string) {
        const entry = await prisma.stockEntry.aggregate(
            {
                where: {
                    inventoryUid,
                    shiftUid
                },
                _sum: {
                    quantity: true
                }
            }
        )

        console.log("entry ===> ", entry)

        return entry
    }

    export async function logVariance(variance: Awaited<ReturnType<typeof process>>) {
        if (variance) {
            await prisma.$transaction(async t => {
                await t.variance.create({
                    data: {
                        expectedCount: variance.expectedCount,
                        shiftUid: variance.shiftUid,
                        inventoryUid: variance.inventoryUid,
                        businessUid: variance.businessUid,
                        actualCount: variance.actualCount,
                        variance: variance.variance,
                        baseShiftUid: variance.baseShiftUid
                    }
                })

                const v_exists = await t.inventoryTotalVariance.findFirst(
                    {
                        where: {
                            inventoryUid: variance.inventoryUid
                        }
                    }
                )

                if (v_exists) {
                    await t.inventoryTotalVariance.update(
                        {
                            where: {
                                inventoryUid: variance.inventoryUid
                            },
                            data: {
                                actualCount: {
                                    increment: variance.actualCount
                                },
                                expectedCount: {
                                    increment: variance.expectedCount
                                },
                                variance: {
                                    increment: variance.variance
                                },
                            }
                        }
                    )
                } else {
                    await t.inventoryTotalVariance.create({
                        data: {
                            expectedCount: variance.expectedCount,
                            inventoryUid: variance.inventoryUid,
                            businessUid: variance.businessUid,
                            actualCount: variance.actualCount,
                            variance: variance.variance,

                        }
                    })
                }
            })

        }
    }

    export async function run(key: string) {
        let proceedRun = true
        // set the status to running when the process starts
        await setStatus(key, "stopped")

        const status = await getStatus(key)

        if (!status || status !== "running") {
            await setStatus(key, "running")

            while (proceedRun) {
                const variance = await process(key)
                if (variance) {
                    await logVariance(variance)
                } else {
                    await setStatus(key, "stopped") // set the status to stopped when there are no more entries to process
                    proceedRun = false
                    await redis.del(key) // clean up the key after processing all entries
                }
            }
        }
    }

    export async function setStatus(key: string, status: "running" | "stopped") {
        await redis.hset("statuses", { [key]: status })
    }

    export async function getStatus(key: string) {
        const status = await redis.hget("statuses", key)
        console.log("key==> ", key, " ", status)
        return status
    }

}
