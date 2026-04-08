import { object, string, number, date } from "yup"
import { ACCESS_TYPES } from "../../../helpers/accessTypes"
import { prisma } from "../../../helpers/db/client";
import { DateTime } from "luxon";

export const ListShiftDTO = object(
    {
        userType: string().oneOf(Object.values(ACCESS_TYPES).map(i => { return i.toLowerCase() })).required("Missing user type"),
        profileUid: string().required("profile missing ?"),
        page: number().default(1),
        timezone: string().default("Africa/Lagos")

    }
)

export type TListShiftDTO = typeof ListShiftDTO.__outputType;


export async function getShiftRecords(dto: TListShiftDTO) {

    // console.log("q==> ", dto)
    let q: Record<any, any> = {}

    switch (dto.userType.toLowerCase()) {
        case "owner":
            q.businessUid = dto.profileUid
            break

        case "manager":
        case "staff":
            q.staffUid = dto.profileUid
    }



    return await prisma.shift.paginate(
        {
            where: {
                ...q
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
                        staffInCharge:{
                            select: {
                                name: true
                            }
                        }
                    }
                },
                uid: true,
                date: true,
                startTime: true,
                endTime: true,
                clockInTime: true,
                clockOutTime: true,
                status: true,
                


            },

            orderBy: [
                { date: "asc" }
            ]
        }
    ).withPages(
        {
            page: dto.page,
            limit: 10,
            includePageCount: true
        }
    )
}

function formatShiftForDisplay(date: Date, timezone: string) {
    // const localDate = DateTime.fromJSDate(date, { zone: timezone })

    //   return {
    //     ...shift,
    //     localDate: localDate.toFormat('yyyy-MM-dd'),         // "2025-02-17"
    //     localDay: localDate.toFormat('EEEE'),                // "Monday"
    //     clockIn: shift.clockInTime
    //       ? DateTime.fromJSDate(shift.clockInTime, { zone: shift.timezone }).toFormat('hh:mm a')
    //       : null,
    //   }

    return DateTime.fromJSDate(date, {zone: timezone})
}


export function getShiftsDAO(records: Awaited<ReturnType<typeof getShiftRecords>>, zone: TListShiftDTO["timezone"] ) {
    const shifts = records[0].map(shift => {
        return {
            uid: shift.uid,
            name: shift.baseShift.name,
            staffCount: shift.baseShift._count.linkedStaff,
            date: formatShiftForDisplay(shift.date, zone),
            startTime: shift.startTime,
            endTime: shift.endTime,
            clockInTime: shift.clockInTime,
            clockOutTime: shift.clockOutTime,
            status: shift.status,
            staffResponsible: shift.baseShift.staffInCharge.name
        }
    })

    return { meta: records[1], shifts }
}