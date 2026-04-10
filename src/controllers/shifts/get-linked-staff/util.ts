import { object, string, number } from "yup";
import { prisma } from "../../../helpers/db/client";


export const getLinkedStaffDto = object(
    {
        shiftUid: string().required(),
        page: number().default(1),
        limit: number().default(4)
    }
)

export type TgetLinkedStaffDto = typeof getLinkedStaffDto.__outputType;

export async function getLinkedStaffRecords(dto: TgetLinkedStaffDto) {
    return await prisma.shiftAssignment.paginate(
        {
            where: {
                baseShiftUid: dto.shiftUid
            },
            select: {
                staff: {
                    select: { name: true, uid: true }
                }
            }
        }
    ).withPages(
        {
            page: dto.page,
            limit: dto.limit,
            includePageCount: true
        }
    )
}

export function getLinkedStaffRecordsDAO(data: Awaited<ReturnType<typeof getLinkedStaffRecords>>) {
    return {
        linkedStaff: data[0].map(item => {
            return {
                name: item.staff.name,
                uid: item.staff.uid
            }
        }), meta: data[1]
    }
}
