import { object, string, number, date } from "yup"
import { ACCESS_TYPES } from "../../../helpers/accessTypes"
import { prisma } from "../../../helpers/db/client";

export const ListShiftDTO = object(
    {
        type: string().oneOf(Object.values(ACCESS_TYPES).map(i=>{return i.toLowerCase()})).required("Missing user type"),
        profileUid: string().required("profile missing ?"),
        page: number().default(1),

    }
)

export type TListShiftDTO = typeof ListShiftDTO.__outputType;


export async function getShiftRecords(dto: TListShiftDTO) {
    let q: Record<any, any> = {}

    switch(dto.type.toLowerCase()){
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
                        _count:{
                            select: {
                                linkedStaff: true
                            }
                        }
                    }
                },
                date: true,
                startTime: true,
                endTime: true,
                clockInTime: true,
                clockOutTime: true,
                status: true
                

            },
            
            orderBy: [
                {date: "asc"}
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


export function getShiftsDAO(records: Awaited<ReturnType<typeof getShiftRecords>>){
    const shifts = records[0].map(shift =>{
        return {
            name: shift.baseShift.name,
            staffCount: shift.baseShift._count.linkedStaff,
            date: shift.date,
            startTime: shift.startTime,
            endTime: shift.endTime,
            clockInTime: shift.clockInTime,
            clockOutTime: shift.clockOutTime,

        }
    })

    return {meta: records[1], shifts}
}