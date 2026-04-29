// import 

import { Prisma } from "../../../../generated/prisma/client";

import { prisma } from "../../../helpers/db/client";
import { TListShiftDTO } from "../list/util";



// export async function listUniqueSHifts(){

// }

// Prisma


export async function getUniqueEndedStaffShiftRecords(dto: { page: number, businessUid: string }) {

    console.log(dto)
    const limit = 10;
    const offset = (dto.page - 1) * limit;
    //   const statusFilter = dto.type === "recent" 
    //     ? Prisma.sql`s.status IN ('Running', 'Ended')` 
    //     : Prisma.sql`s.status = 'Pending'`;

    const statusFilter = Prisma.sql`s.status = 'Ended'`;
    const businessfilter = Prisma.sql`s."businessUid" = ${dto.businessUid}`;

    const [data, countResult] = await Promise.all([
        prisma.$queryRaw<any[]>`
      SELECT
        s.uid, s.date, s."startTime", s."endTime",
        s."clockInTime", s."clockOutTime", s.status, s."businessUid", 
        b.name AS "baseShiftName",
        sic.uid AS "staffInChargeUid",
        sic.name AS "staffInChargeName"
        -- COUNT(ls.id) AS "linkedStaffCount"
      FROM "Shift" s
      LEFT JOIN "BaseShift" b ON b.uid = s."baseShiftUid"
      LEFT JOIN "UserProfile" sic ON sic.uid = b."staffInChargeId"
    --   LEFT JOIN "LinkedStaff" ls ON ls."baseShiftId" = b.uid
      WHERE ${businessfilter}
        AND ${statusFilter}
        AND s."staffUid" = sic.uid  -- 👈 the column-to-column comparison
      GROUP BY s.uid, s.date, s."startTime", s."endTime",
               s."clockInTime", s."clockOutTime", s.status,
               b.name, sic.uid, sic.name, s."businessUid"
      ORDER BY ${Prisma.sql`s.date ASC`}
      LIMIT ${limit} OFFSET ${offset}
    `,

        prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) FROM "Shift" s
      LEFT JOIN "BaseShift" b ON b.uid = s."baseShiftUid"
      LEFT JOIN "UserProfile" sic ON sic.uid = b."staffInChargeId"
      WHERE ${businessfilter}
        AND ${statusFilter}
        AND s."staffUid" = sic.uid
    `,
    ]);

    const totalCount = Number(countResult[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    //   {
    //               uid: shift.uid,
    //               name: shift.baseShift.name,
    //               staffCount: shift.baseShift._count.linkedStaff,
    //               date: formatShiftForDisplay(shift.date, zone),
    //               startTime: shift.startTime,
    //               endTime: shift.endTime,
    //               clockInTime: shift.clockInTime,
    //               clockOutTime: shift.clockOutTime,
    //               status: shift.status,
    //               shiftManager: shift.baseShift.staffInCharge.name,
    //               staff: shift?.staff?.name,

    //               baseShiftUid: shift.baseShift.uid
    //           }

    return {
        data: data.map(row => ({
            uid: row.uid,
            date: row.date,
            startTime: row.startTime,
            endTime: row.endTime,
            clockInTime: row.clockInTime,
            clockOutTime: row.clockOutTime,
            status: row.status,
            name: row.baseShiftName,
            shiftManager: row.staffInChargeName,
            //   baseShift: {
            //     name: row.baseShiftName,
            //     staffInCharge: { uid: row.staffInChargeUid, name: row.staffInChargeName },
            //     _count: { linkedStaff: Number(row.linkedStaffCount) },
            //   },
        })),
        meta: {
            currentPage: dto.page,
            lastPage: totalPages,
            next: dto.page < totalPages ? dto.page + 1 : null,
            previous: dto.page > 1 ? dto.page - 1 : null,
            total: totalCount,
            isFirstPage: dto.page === 1,
            isLastPage: dto.page === totalPages,
        },
    };
}