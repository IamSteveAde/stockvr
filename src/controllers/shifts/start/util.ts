import { object, string } from "yup"
import { prisma } from "../../../helpers/db/client";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { verifyPassword } from "../../auth/create-account/util";
import { HttpStatusCode } from "axios";
import { redis, SCOPE_KEY } from "../../../helpers/db/redis";

export const StartShiftDTO = object(
    {
        shiftUid: string().required("Kindly select shift to start."),
        staffUid: string().required("Staff member required."),
        pin: string().required("Kindly provide your auth pin to proceed.")
    }
)


export type TStartShiftDTO = typeof StartShiftDTO.__outputType;

export async function getSpecificShift(dto: TStartShiftDTO) {
    const shift = await prisma.shift.findFirst(
        {
            where: {
                uid: dto.shiftUid,
                staffUid: dto.staffUid,
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

    // console.log(shift)

    if (!shift || !shift.baseShift) {
        throw new InternalError(null, "Shift selected not found.", HttpStatusCode.NotFound)
    }

    if (shift.baseShift.staffInChargeId !== dto.staffUid) {
        throw new InternalError(null, "Only staff in charge can perform 'Start' action")
    }

    const pinValid = await verifyPassword({ password: dto.pin }, shift.staff.owner.password)

    if (!pinValid) {
        throw new InternalError(null, "Incorrect pin provided")
    }

    if(shift.status.toLowerCase() != "pending"){
        throw new InternalError(null, "Shift already ended or currently running.")
    }

    return shift
}

export async function startShift(shift: Awaited<ReturnType<typeof getSpecificShift>>) {

    await prisma.$transaction(async (t) => {
        await t.shift.updateMany(
            {
                where: {
                    baseShiftUid: shift.baseShiftUid,
                    date: shift.date
                },
                data: {
                    status: "Running"
                }
            }
        )

        await t.shift.update(
            {
                where: {
                    uid: shift.uid
                },
                data: {
                    clockInTime: new Date()
                }
            }
        )
    })

    
}

export async function getAllInventoryCountAtStartTime(businessUid: string, shiftId: string){
    const data = await prisma.inventory.findMany(
        {
            where: {
                businessUid,
                product: {
                    status: "Active"
                }
            },
            select: {
                uid: true,
                productUid: true,
                quantity: true
            }
        }
    )

    const startShiftKey = SCOPE_KEY.startShiftEntry(businessUid, shiftId)

    await redis.set(startShiftKey, JSON.stringify(data) )
}