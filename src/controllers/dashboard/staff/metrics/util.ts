import { object, string } from "yup"
import { prisma } from "../../../../helpers/db/client";

export const StaffMetricDTO = object(
    {
        profileUid: string().required(),
        type: string().oneOf(["all", "completed", "responsible"]).default("all"),

    }
)

export type TStaffMetricDTO = typeof StaffMetricDTO.__outputType;

export async function GetStaffMetric(dto: TStaffMetricDTO) {
    let count: number = 0
    switch (dto.type) {
        case "all":
            count = await prisma.shiftAssignment.count(
                {
                    where: {
                        staffUid: dto.profileUid
                    }
                }
            )
            break;

        case "completed":
            count = await prisma.shift.count(
                {
                    where: {
                        staffUid: dto.profileUid,
                        status: "Ended"
                    }
                }
            )
            break;

        case "responsible":
            count = await prisma.shift.count(
                {
                    where: {
                        baseShift: {
                            staffInChargeId: dto.profileUid
                        }

                    }
                }
            )
            break;

        default: //all
            count = await prisma.shiftAssignment.count(
                {
                    where: {
                        staffUid: dto.profileUid
                    }
                }
            )
            break;
    }

    return count
}