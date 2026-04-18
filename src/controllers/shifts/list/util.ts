import { object, string, number, date } from "yup"
import { ACCESS_TYPES } from "../../../helpers/accessTypes"
import { prisma } from "../../../helpers/db/client";
import { DateTime } from "luxon";

export const ListShiftDTO = object(
    {
        userType: string().oneOf(Object.values(ACCESS_TYPES).map(i => { return i.toLowerCase() })).required("Missing user type"),
        profileUid: string().required("profile missing ?"),
        page: number().default(1),
        timezone: string().default("Africa/Lagos"),
        type: string().oneOf(["Pending", "Running", "Ended"]).notRequired()

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

    if (dto.type) {
        q.status = dto.type
    }



    return await prisma.shift.paginate(
        {
            where: {
                ...q
            },

            // distinct: ["baseShiftUid"],
            select: {
                baseShiftUid: true,
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
                        },
                        uid: true
                    }
                },
                uid: true,
                date: true,
                startTime: true,
                endTime: true,
                clockInTime: true,
                clockOutTime: true,
                status: true,
                staff: {
                    select: {
                        name: true
                    }
                }



            },

            orderBy: [

                { status: "desc" },
                { date: "asc" },
            ]
        }
    ).withPages(
        {
            page: dto.page,
            limit: 10,
            includePageCount: true
        }
    )


    // return await paginateShiftsByBaseShift(q, dto.page)
}


// export async function paginateShiftsByBaseShift(q: any, page: number) {
//     const limit = 10;
//     const skip = (page - 1) * limit;

//     // Step 1: Get distinct baseShiftUids
//     const distinctShifts = await prisma.shift.findMany({
//         where: { ...q },
//         distinct: ['baseShiftUid'],
//         select: { baseShiftUid: true },
//         orderBy: [
//             { status: 'desc' },
//             { date: 'asc' },
//         ],
//     });


//     console.log("distinct ==>", distinctShifts)

//     const totalCount = distinctShifts.length;
//     const totalPages = Math.ceil(totalCount / limit);

//     // Step 2: Slice the uids for the current page
//     // const pageUids = distinctShifts
//     //     .slice(skip, skip + limit)
//     //     .map(s => s.baseShiftUid);

//     // Step 3: Fetch full data for sliced uids
//     const data = await prisma.shift.findMany({
//         where: {
//             ...q,
//             //   baseShiftUid: { in: pageUids },
//         },
//         select: {
//             baseShiftUid: true,
//             baseShift: {
//                 select: {
//                     name: true,
//                     _count: {
//                         select: {
//                             linkedStaff: true,
//                         },
//                     },
//                     staffInCharge: {
//                         select: {
//                             name: true,
//                         },
//                     },
//                     uid: true,
//                 },
//             },
//             uid: true,
//             date: true,
//             startTime: true,
//             endTime: true,
//             clockInTime: true,
//             clockOutTime: true,
//             status: true,
//         },
//         orderBy: [
//             { status: 'desc' },
//             { date: 'asc' },
//         ],
//     });

//     // Same shape as .withPages()
//     return {
//         data,
//         meta: {
//             currentPage: page,
//             lastPage: totalPages,
//             next: page < totalPages ? page + 1 : null,
//             previous: page > 1 ? page - 1 : null,
//             total: totalCount,
//             isFirstPage: page === 1,
//             isLastPage: page === totalPages,
//         },
//     };
// }


// async function paginateShiftsByBaseShift(q: any, page: number) {
//   const limit = 10;
//   const offset = (page - 1) * limit;

//   // Build where conditions — keep it simple with known filters
//   const businessUid = (q as any).businessUid;

//   const [data, countResult] = await Promise.all([
//     prisma.$queryRaw<any[]>`
//       SELECT DISTINCT ON (s."baseShiftUid")
//         s.uid,
//         s.date,
//         s."startTime",
//         s."endTime",
//         s."clockInTime",
//         s."clockOutTime",
//         s.status,
//         s."baseShiftUid",
//         b.name AS "baseShiftName",
//         b.uid AS "baseShiftUid_ref",
//         sic.name AS "staffInChargeName",
//         COUNT(ls.id) AS "linkedStaffCount"
//       FROM "Shift" s
//       LEFT JOIN "BaseShift" b ON b.uid = s."baseShiftUid"
//       LEFT JOIN "staff" sic ON sic.id = b."staffInChargeId"
//       LEFT JOIN "LinkedStaff" ls ON ls."baseShiftId" = b.id
//       WHERE s."businessUid" = ${businessUid}
//       GROUP BY
//         s.uid, s.date, s."startTime", s."endTime",
//         s."clockInTime", s."clockOutTime", s.status,
//         s."baseShiftUid", b.name, b.uid, sic.name
//       ORDER BY s."baseShiftUid", s.status DESC, s.date ASC
//       LIMIT ${limit} OFFSET ${offset}
//     `,

//     prisma.$queryRaw<[{ count: bigint }]>`
//       SELECT COUNT(*) FROM (
//         SELECT DISTINCT ON (s."baseShiftUid") s.uid
//         FROM "Shift" s
//         WHERE s."businessUid" = ${businessUid}
//       ) AS distinct_shifts
//     `,
//   ]);

//   const totalCount = Number(countResult[0].count);
//   const totalPages = Math.ceil(totalCount / limit);

//   // Reshape to match your original select shape
//   const shaped = data.map(row => ({
//     uid: row.uid,
//     date: row.date,
//     startTime: row.startTime,
//     endTime: row.endTime,
//     clockInTime: row.clockInTime,
//     clockOutTime: row.clockOutTime,
//     status: row.status,
//     baseShift: {
//       uid: row.baseShiftUid_ref,
//       name: row.baseShiftName,
//       staffInCharge: { name: row.staffInChargeName },
//       _count: { linkedStaff: Number(row.linkedStaffCount) },
//     },
//   }));

//   return {
//     data: shaped,
//     meta: {
//       currentPage: page,
//       lastPage: totalPages,
//       next: page < totalPages ? page + 1 : null,
//       previous: page > 1 ? page - 1 : null,
//       total: totalCount,
//       isFirstPage: page === 1,
//       isLastPage: page === totalPages,
//     },
//   };
// }




function formatShiftForDisplay(date: Date, timezone: string) {

    return DateTime.fromJSDate(date, { zone: timezone })
}


export function getShiftsDAO(records: Awaited<ReturnType<typeof getShiftRecords>>, zone: TListShiftDTO["timezone"]) {
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
            shiftManager: shift.baseShift.staffInCharge.name,
            staff: shift?.staff?.name,

            baseShiftUid: shift.baseShift.uid
        }
    })

    return { meta: records[1], shifts }
}