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

export type TInventoryCount = {
    uid: string,
    productUid: string,
    quantity: number
}

export namespace Variance {
    /*
    * @key: the Scopekey created from endShiftEntry
    */
    export async function process(key: string, startEntryKey: string) {
        const valueEndEntry = await redis.get(key)
        const valueStartEntry = (await redis.get(startEntryKey))
        let valueStartEntry_: TInventoryCount[] = []


        if (valueStartEntry) {
            valueStartEntry_ = JSON.parse(valueStartEntry) //as TInventoryCount[]
        }

        const variances = []


        if (valueEndEntry) {
            const endShiftEntry = JSON.parse(valueEndEntry) as TProductEntry[]

            for (const endEntry of endShiftEntry) {
                const entryAggregate = await getStockEntryAggregate(endEntry.inventoryUid, endEntry.shiftUid)

                const allEntryAggregate = await getStockInOutAggregrate(endEntry.inventoryUid, endEntry.shiftUid)


                // const endEntry = JSON.parse(value) as 
                const specificInventory = valueStartEntry_.find(item => item.uid === endEntry.inventoryUid)
                const stockInAggregate = allEntryAggregate.stockIn
                const stockOutAggregate = allEntryAggregate.stockOut
                // console.log(
                //     "xxx=> ", specificInventory?.quantity!, " ", stockOutAggregate?._sum.quantity! || 0, " ", stockInAggregate?._sum.quantity! || 0
                // )
                const expectedCount = specificInventory?.quantity! + (stockOutAggregate?._sum.quantity! || 0) + (stockInAggregate?._sum.quantity! || 0)
                // const expectedCount = specificInventory?.quantity! - (entryAggregate._sum.quantity || 0 >= 0 ? entryAggregate._sum.quantity || 0 : entryAggregate._sum.quantity || 0 * -1)
                const variance_ = endEntry.count - expectedCount

                const variance = {
                    shiftUid: endEntry.shiftUid,
                    inventoryUid: endEntry.inventoryUid,
                    businessUid: endEntry.businessUid,
                    openingCount: specificInventory?.quantity!,
                    actualCount: endEntry.count,
                    addedCount: stockInAggregate?._sum.quantity ?? 0,
                    usedCount: (stockOutAggregate?._sum.quantity ?? 0),
                    expectedCount,
                    entryAggregateQty: entryAggregate._sum.quantity,
                    variance: variance_,
                    baseShiftUid: endEntry.baseShiftUid
                }

                // console.log("variance ===> ", variance)
                // console.log("spec Inventory ===> ", specificInventory)
                variances.push(variance)
            }
        }

        return variances
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

        // console.log("entry ===> ", entry)

        return entry
    }

    export async function getStockInOutAggregrate(inventoryUid: string, shiftUid: string) {
        const inOutAgg = await prisma.stockEntry.groupBy(
            {
                by: ["action", "shiftUid", "inventoryUid"],
                where: {
                    inventoryUid,
                    shiftUid
                },
                _sum: {
                    quantity: true
                }
            }
        )

        // console.log("In-Out", inOutAgg)

        return {
            stockIn: inOutAgg.find(i => i.action == "Stock In"),
            stockOut: inOutAgg.find(i => i.action == "Stock Out")
        }
    }



    export async function logVariance(variances: Awaited<ReturnType<typeof process>>) {
        // const shiftContext = {
        //     businessUid: variances[0]?.businessUid,
        //     shiftUid: variances[0]?.shiftUid,
        //     itemAffectedCount: 0,
        //     items: [] //,
        // }

        // 
        if (variances.length > 0) {
            for (const variance of variances) {
                await prisma.$transaction(async t => {
                    await t.variance.create({
                        data: {
                            expectedCount: variance.expectedCount,
                            shiftUid: variance.shiftUid,
                            inventoryUid: variance.inventoryUid,
                            businessUid: variance.businessUid,
                            actualCount: variance.actualCount,
                            variance: variance.variance,
                            baseShiftUid: variance.baseShiftUid,
                            openingCount: variance.openingCount,
                            addedCount: variance.addedCount,
                            usedCount: variance.usedCount
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
    }

    export async function run(endEntryKey: string, startEntryKey: string) {
        let proceedRun = true
        // set the status to running when the process starts
        // await setStatus(endEntryKey, "stopped")

        const status = await getStatus(endEntryKey)

        if (!status || status !== "running") {
            await setStatus(endEntryKey, "running")

            while (proceedRun) {
                const variance = await process(endEntryKey, startEntryKey)
                if (variance.length > 0) {
                    // await logVariance(variance)
                    await setStatus(endEntryKey, "stopped")
                    proceedRun = false
                } else {
                    await setStatus(endEntryKey, "stopped") // set the status to stopped when there are no more entries to process
                    proceedRun = false

                }
            }

            await redis.del(endEntryKey) // clean up the key after processing all entries
            await redis.del(startEntryKey)
            await redis.hdel("statuses",endEntryKey)
        }


    }

    export async function setStatus(key: string, status: "running" | "stopped") {
        await redis.hset("statuses", { [key]: status },)
    }

    export async function getStatus(key: string) {
        const status = await redis.hget("statuses", key)
        console.log("key==> ", key, " ", status)
        return status
    }

}
