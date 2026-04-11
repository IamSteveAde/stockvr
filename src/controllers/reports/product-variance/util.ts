import { object, string, number, date } from "yup"
import { prisma } from "../../../helpers/db/client";

export const ProductVariancetDTO = object(
    {
        startDate: date().default(new Date()),
        endDate: date().default(new Date()),
        page: number().default(1),
        pageLimit: number().default(10),
        businessUid: string().required("sikeeeeee.")
    }
)

export type TProductVariancetDTO = typeof ProductVariancetDTO.__outputType;

export async function getProductVarianceRecords(dto: TProductVariancetDTO) {

    return await prisma.inventory.paginate(
        {
            where: {
                variances: {
                    some: {
                        createdAt: {
                            gte: dto.startDate,
                            lte: dto.endDate
                        },
                        // variance: {
                        //     {lt: 0}
                        // }
                    }
                }
            },
            select: {
                product: {
                    select: {
                        name: true
                    }
                },
                _count: {
                    select: {variances: true}
                },
                variances: {
                    select: {
                        baseShift: {
                            select: {
                                _count: {
                                    select: {
                                        linkedStaff: true
                                    }
                                }
                            }
                        },
                        "id": true,
                        "shiftUid": true,
                        "baseShiftUid": true,
                        "inventoryUid": true,
                        "openingCount": true,
                        "addedCount": true,
                        "usedCount": true,
                        "actualCount": true,
                        "expectedCount": true,
                        "variance": true,
                        "createdAt": true,
                        "businessUid": true
                    }
                }
                // {
                //     // where: {
                //     //     variance: {
                //     //         lt: 0

                //     //     }
                //     // },
                //     // include: {
                //     //     baseShift: true
                //     // }
                // }
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


export function getProductVarianceRecordsDAO(data: Awaited<ReturnType<typeof getProductVarianceRecords>>) {
    return {
        meta: data[1],
        pv: data[0].map(item=>{
            return {
                name: item.product.name,
                variance: item.variances.map(x=>{
                    return {
                        "id": x.id,
                        "shiftUid": x.shiftUid,
                        "baseShiftUid": x.baseShiftUid,
                        "inventoryUid": x.inventoryUid,
                        "openingCount": x.openingCount,
                        "addedCount": x.addedCount,
                        "usedCount": x.usedCount,
                        "actualCount": x.actualCount,
                        "expectedCount": x.expectedCount,
                        "variance": x.variance,
                        "createdAt": x.createdAt,
                        "businessUid": x.businessUid,
                        linkedStaffCount: x.baseShift._count.linkedStaff
                    }
                })
            }
        })
    }
}