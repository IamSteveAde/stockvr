import { object, string, number, date } from "yup"
import { prisma } from "../../../helpers/db/client";
import { DateTime } from "luxon";

export const ListStaffShiftDTO = object(
    {
        type: string().oneOf(["upcoming", "recent"]).default("upcoming"),
        profileUid: string().required("profile missing ?"),
        page: number().default(1),
        timezone: string().default("Africa/Lagos")

    }
)

export type TListStaffShiftDTO = typeof ListStaffShiftDTO.__outputType;


export async function getStaffShiftRecords(dto: TListStaffShiftDTO) {

    return await prisma.shift.paginate(
        {
            where: dto.type == "recent" ? {
                status: {
                    in: ["Running", "Ended"]
                },
                staffUid: dto.profileUid
            } : {
                status: "Pending",
                staffUid: dto.profileUid
            },

            select: {
                baseShift: {
                    select: {
                        name: true,
                        _count: {
                            select: {
                                linkedStaff: true
                            }
                        },
                        staffInCharge: true
                    }
                },
                uid: true,
                date: true,
                startTime: true,
                endTime: true,
                clockInTime: true,
                clockOutTime: true,
                status: true


            },

            orderBy: dto.type == "recent" ? { date: "desc" } : {date: "asc"}
            
        }
    ).withPages(
        {
            page: dto.page,
            limit: 10,
            includePageCount: true
        }
    )
}