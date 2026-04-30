import { object, string, number, date } from "yup"
import { prisma } from "../../../helpers/db/client";

export const ShiftContextDTO = object(
    {
        startDate: date().default(new Date()),
        endDate: date().default(new Date()),
        page: number().default(1),
        pageLimit: number().default(10),
        businessUid: string().required("sikeeeeee.")
    }
)

export type TShiftContextDTO = typeof ShiftContextDTO.__outputType;

export async function getShiftVarianceRecords(dto: TShiftContextDTO) {

    return await prisma.shift.paginate(
        {
            where: {
                businessUid:dto.businessUid,
                variances: {
                    some: {
                        createdAt: {
                            gte: dto.startDate,
                            lte: dto.endDate
                        },
                        variance: {
                            lt: 0
                        }
                    }
                }
            },
            // select: {}
            include: {
                
                baseShift: {
                    include: {
                        staffInCharge: true
                    }
                },
                variances: {
                    where: {
                        variance: {
                            lt: 0

                        }
                    },
                    include: {
                        linkedInventory: {
                            include: {
                                product: true
                            }
                        }
                    }
                    
                }
            }
        }
    ).withPages(
        {
            limit: dto.pageLimit,
            page: dto.page,
            includePageCount: true
        }
    )
}


export function getShiftContextRecordsDAO(data: Awaited<ReturnType<typeof getShiftVarianceRecords>>) {
    return {
        meta: data[1],
        context: data[0].map(item => {
            return {
                name: item.baseShift.name,
                date: item.date,
                itemsAffected: item.variances.length,
                items: item.variances.map(x=>{
                    return {
                        name: x.linkedInventory.product.name,
                        used: x.usedCount,
                        opening: x.openingCount,
                        expected: x.expectedCount,
                        actual: x.actualCount,
                        unit: x.linkedInventory.product.unit
                    }
                })
            }
        })
    }
}