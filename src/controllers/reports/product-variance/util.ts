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
                        variance: {
                            lt: 0
                        }
                    }
                }
            },
            include: {
                product: true,
                variances: {
                    where: {
                        variance: {
                            lt: 0

                        }
                    },
                    // include: {
                    //     baseShift: true
                    // }
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


export function getProductVarianceRecordsDAO(data: Awaited<ReturnType<typeof getProductVarianceRecords>>) {
    return {
        meta: data[1],
        pv: data[0].map(item=>{
            return {
                name: item.product.name,
                variance: item.variances
            }
        })
    }
}