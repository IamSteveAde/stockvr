import { object, string, number, array, date } from "yup";
import { prisma } from "../../../helpers/db/client";
import { redis, SCOPE_KEY } from "../../../helpers/db/redis";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { verifyPassword } from "../../auth/create-account/util";
import { Variance } from "../../../worker";

export const EndShiftDTO = object(
    {
        products: array(
            object(
                {
                    inventoryUid: string().required("Missing value of inventory identifier"),
                    count: number().required("Missing value of product count")
                }
            )
        ).min(1, "Kindly select at least one stock item used during shift.").required("Missing value of products"),
        // businessUid: string(),
        shiftUid: string().required("Missing value of shift identifier."),
        staffUid: string().required("Missing value of staff identifier."),
        pin: string().required("Missing value of pin."),
        clockOutTime: date().default(new Date())
    }
)



export type TEndShiftDTO = typeof EndShiftDTO.__outputType;
export async function getShift(dto: { staffUid: string, shiftUid: string }) {
    const shift = await prisma.shift.findUnique(
        {
            where: {
                uid: dto.shiftUid
            },
            include: {
                baseShift: true,
                staff: {
                    include: {
                        owner: true
                    }
                }
            }
        }
    )

    if (!shift) throw new InternalError(null, "Shift not found.")
    if (shift.status.toLowerCase() != "running") throw new InternalError(null, "Shift is not running.")
    if (shift.baseShift.staffInChargeId != dto.staffUid) throw new InternalError(null, "Only staff in charge can add a stock entry.")
    return shift
}

export async function getInventoryRecords(dto: TEndShiftDTO) {
    const inventoryUids = dto.products.map(product => product.inventoryUid)

    const inventories = await prisma.inventory.findMany(
        {
            where: {
                uid: {
                    in: inventoryUids
                }
            }
        }
    )

    if (inventories.length != inventoryUids.length) {
        throw new InternalError(null, "One or more inventory items not found.", 404)
    }

    return inventories
}

export async function validatePin(pin: TEndShiftDTO["pin"], shift: Awaited<ReturnType<typeof getShift>>) {
    const valid = await verifyPassword({ password: pin }, shift.staff.owner.password)

    if (!valid) {
        throw new InternalError(null, "Invalid pin provided.")
    }
    return
}

export async function addEndShiftEntry(dto: TEndShiftDTO, shift: Awaited<ReturnType<typeof getShift>>, inventories: Awaited<ReturnType<typeof getInventoryRecords>>) {
    const entries = dto.products.map(product => {
        const inventory = inventories.find(inv => inv.uid === product.inventoryUid)
        return {
            ...product,
            businessUid: shift.businessUid,
            shiftUid: dto.shiftUid,
            initialCount: inventory?.quantity || 0,
            baseShiftUid: shift.baseShiftUid
        }
    })

    await prisma.endShiftEntry.createMany(
        {
            data: entries
        }
    )

    return entries

}

export async function updateInventory(dto: TEndShiftDTO) {
    await Promise.all(
        dto.products.map(async product => {

            await prisma.inventory.update(
                {
                    where: { uid: product.inventoryUid },
                    data: {
                        quantity: product.count,
                        updatedAt: new Date()
                    }
                }
            )
        }
        )
    )
}

// push all records to redis for end shift summary generation in the next 24hrs. Redis key should be something like "end-shift-entry:businessUid" and value should be an array of all end shift entries for that business. When generating the end shift summary, we can pop all records from redis and generate the summary based on those records. This way, we can avoid hitting the database multiple times when generating the summary and also ensure that we have a record of all end shift entries for a business in the last 24hrs.
export async function pushtoRedis(businessUid: string, shiftId : string, entries: Awaited<ReturnType<typeof addEndShiftEntry>>) {
    const endShiftKey = SCOPE_KEY.endShiftEntry(businessUid, shiftId)
    const startShiftKey = SCOPE_KEY.startShiftEntry(businessUid, shiftId)
    // await redis.lpush(key, ...entries.map(entry => JSON.stringify(entry)))

    await redis.set(endShiftKey, JSON.stringify(entries))
    await Variance.run(endShiftKey, startShiftKey)
}

export async function endShift( shift: Awaited<ReturnType<typeof getShift>>) {
    await prisma.shift.updateMany(
        {
            where: { baseShiftUid: shift.baseShiftUid, date: shift.date },
            data: {
                status: "Ended",
                clockOutTime: new Date()
            }
        }
    )

    
}
