import { object, string, number } from "yup"
import { prisma } from "../../../../helpers/db/client";

export const OverviewListDTO = object(
    {
        businessUid: string().required("Missing value of business identifier."),
        products: string(),
        shifts: string(),
        page: number().default(1),
        pageLimit: number().default(10)
    }
)

export type TOverviewListDTO = typeof OverviewListDTO.__outputType;


export async function getInventoryTotalVariance(dto: TOverviewListDTO) {

    const data = await prisma.inventory.paginate(
        {
            where: {
                businessUid: dto.businessUid
            },
            include: {
                product: true,
                inventoryTotalVariances: true
            }
        }
    ).withPages(
        {
            page: dto.page,
            limit: dto.pageLimit,
            includePageCount: true
        }
    )

    return data
}


export function getInventoryTotalDao(data: Awaited<ReturnType<typeof getInventoryTotalVariance>>) {

    return {
        data: data[0].map(item => {
            return {
                name: item.product.name,
                unit: item.product.unit,
                expectedCount: item.inventoryTotalVariances?.expectedCount || 0,
                actualCount: item.inventoryTotalVariances?.actualCount || 0,
                variance: item.inventoryTotalVariances?.variance || 0,
            }
        }), meta: data[1]
    }
}

export async function getInventoryTotalVarianceByShift(dto: TOverviewListDTO) {

    const shifts = dto.shifts ? dto.shifts?.split(",") : undefined
    const products = dto.products ? dto.products?.split(",") : undefined

    // console.log(products)
    // console.log(shifts)

    // // there's different errors

    // console.log("d = > ", {
    //                 shiftUid: shifts ? {
    //                     in: shifts
    //                 } : undefined,

    //                 linkedInventory: products ? {
    //                     productUid: {
    //                         in: products
    //                     }

    //                 } : undefined
    //             })

    const data = await prisma.variance.paginate(
        {
            where: {
                businessUid: dto.businessUid,
                AND: {
                    shiftUid: shifts ? {
                        in: shifts
                    } : undefined,

                    linkedInventory: products ? {
                        productUid: {
                            in: products
                        }

                    } : undefined
                }
            },
            
            include: {
                linkedInventory: {
                    include: {
                        product: true
                    }
                },
            }
        }
    ).withPages(
        {
            page: dto.page,
            limit: dto.pageLimit, includePageCount: true
        }
    )

    // console.log(data)

    return data
}

export function getInventoryTotalDaoByShift(data: Awaited<ReturnType<typeof getInventoryTotalVarianceByShift>>) {

    // this is incomplete it doesn't return a concatenated list of items

    return {
        data: data[0].map(item => {
            return {
                name: item.linkedInventory?.product.name,
                unit: item.linkedInventory?.product.unit,
                expectedCount: item.expectedCount || 0,
                actualCount: item.actualCount || 0,
                variance: item.variance || 0,
            }
        }), meta: data[1]
    }
}

export async function getData(dto: TOverviewListDTO) {
    if (dto.products || dto.shifts) {
        const d = await getInventoryTotalVarianceByShift(dto)
        return getInventoryTotalDaoByShift(d)
    }
    const d_ = await getInventoryTotalVariance(dto)
    return getInventoryTotalDao(d_)

}