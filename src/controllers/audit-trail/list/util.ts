import { object, string, date, number } from "yup"
import { endOfMonth, startOfMonth } from "date-fns"
import { ACTIONS } from "../add/util"
import { prisma } from "../../../helpers/db/client";

export const ListAuditTrailDTO = object(
    {
        search: string(),
        page: number().default(1),
        pageLimit: number().default(9),
        startDate: date().default(startOfMonth(new Date())),
        endDate: date(),//.default(endOfMonth(new Date())),
        action: string().notRequired().oneOf(ACTIONS),
        // entity: string(), //.required("Missing value of entity."),
        businessUid: string().required("missing value of business")
    }
)

export type TListAuditTrailDTO = typeof ListAuditTrailDTO.__outputType;

export async function listAuditTrails(dto: TListAuditTrailDTO) {
    return await prisma.auditTrail.paginate(
        {
            where: {
                businessUid: dto.businessUid,
                AND: [
                    dto.search ? {
                        OR: [
                            {
                                staff: {
                                    name: {
                                        contains: dto.search
                                    }
                                }
                            },
                            {
                                product: {
                                    name: {
                                        contains: dto.search
                                    }
                                }
                            }
                        ]
                    }: {},

                    dto.action ? {
                        action: dto.action
                    }: {},
                    dto.startDate ? {
                        createdAt: {
                            gte: dto.startDate
                        }
                    }: {},
                    dto.endDate ? {
                        createdAt: {
                            lte: dto.endDate
                        }
                    }: {}
                ]
            },
            include: {
                staff: true,
                shift: true,
                product: true
            },
            orderBy: {
                createdAt: "desc"
            }
        }
    ).withPages(
        {
            page: dto.page,
            limit: dto.pageLimit,
            includePageCount: true
        }
    )
}


export function listAuditTrailDAO(records: Awaited<ReturnType<typeof listAuditTrails>>){
    return {
        trail: records[0].map(trail=>{
            return {
                createdAt: trail.createdAt,
                staff: {
                    name: trail.staff.name,
                    role: trail.staff.accessType
                },
                action: trail.action,
                detail: trail.detail,
                product: trail?.product ? trail.product?.name : "N/A",
                shift: trail?.shift ? trail.shift?.name : "N/A",
                entity: trail.entity

            }
        }),
        meta: records[1]
    }
}