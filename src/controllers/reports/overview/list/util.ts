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

// downloadVarianceReport

export async function getBusinessProductInventoryUidsForOverview(productIds: string[], businessUid: string) {
    const inventory = await prisma.inventory.findMany(
        {
            where: {
                businessUid,
                productUid: {
                    in: productIds
                }
            },
            select: {
                uid: true,
                product: {
                    select: {

                        name: true,
                        unit: true
                    }
                }
            }
        }
    )
    const items = inventory?.map(item => item.uid)

    return { items, inventory }
}




export async function getVarianceAggregateByProductForOverView(dto: TOverviewListDTO) {

    const shifts = dto.shifts ? dto.shifts?.split(",") : undefined
    const inventoryIds = dto.products ? await getBusinessProductInventoryUidsForOverview(dto.products?.split(","), dto.businessUid) : undefined

    const data = await prisma.variance.groupBy(
        {
            by: ["inventoryUid"],
            where: {
                businessUid: dto.businessUid,
                // AND: {

                // }
                AND: {
                    shiftUid: shifts ? {
                        in: shifts
                    } : undefined,
                    inventoryUid: inventoryIds ? { in: inventoryIds.items } : undefined
                }
            },
            _sum: {
                // : true,
                actualCount: true,
                expectedCount: true,
                variance: true
            },

        },

    )

    // console.log("aggregates ====> ")
    // console.dir({
    //     shifts,
    //     inventoryIds,
    //     data
    // }, { depth: 12 })

    // console.log("aggregates ====> ")

    return { data, inventoryIds }
}


export async function siftFetchedByFilters(aggregates: Awaited<ReturnType<typeof getVarianceAggregateByProductForOverView>>) {
    let inventory: any[] = []
    if (!aggregates.inventoryIds) {
        inventory = await prisma.inventory.findMany(
            {
                where: {
                    uid: {
                        in: aggregates.data.map(item => item.inventoryUid)
                    }
                },
                select: {
                    uid: true,
                    product: {
                        select: {

                            name: true,
                            unit: true
                        }
                    }
                }
            }
        )
    } else {
        inventory = aggregates.inventoryIds.inventory
    }

    // console.log("in sifts ====> ")
    // console.dir({
    //     aggregates,
    //     inventory
    // }, { depth: 12 })



    const d = aggregates.data.map((items, index) => {
        const productInventory = inventory.find(x => x.uid == items.inventoryUid)

        // console.log("On product map ===> ", productInventory)

        return {
            // uid: productInventory?.uid,
            name: productInventory?.product.name,
            unit: productInventory?.product.unit,
            expectedCount: items._sum.expectedCount,
            actualCount: items._sum.actualCount,
            variance: items._sum.variance
        }

    })

    return d
}




export async function getData(dto: TOverviewListDTO) {
    if (dto.products || dto.shifts) {
        const d = await getVarianceAggregateByProductForOverView(dto)

        // console.log("d-====> ", d)
        return {data: await siftFetchedByFilters(d), meta: {}}
    }
    const d_ = await getInventoryTotalVariance(dto)
    return getInventoryTotalDao(d_)

}