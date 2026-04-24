// import p

import { prisma } from "../../../../helpers/db/client";


import { object, string, date } from "yup";

export const VarianceReportSchema = object(
    {
        startDate: date().default(new Date()),
        endDate: date().default(new Date()),
        businessUid: string().required("Sikeeeeeeee")
    }
)

export type TVarianceReportSchema = typeof VarianceReportSchema.__outputType;


export async function getBusinessProductsInventoryUids(businessUid: TVarianceReportSchema['businessUid']) {
    const inventory = await prisma.inventory.findMany(
        {
            where: {
                businessUid
            },
            select: {
                uid: true,
                product: {
                    select: {
                        uid: true,
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


export async function getVarianceAggregateByProduct(dto: TVarianceReportSchema, inventoryIds: Awaited<ReturnType<typeof getBusinessProductsInventoryUids>>["items"]) {
    const data = await prisma.variance.groupBy(
        {
            by: ["inventoryUid"],
            where: {
                businessUid: dto.businessUid,
                AND: {
                    inventoryUid: { in: inventoryIds }
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


    console.log("agg => ", data)
    return data
}


// use this for getting items for overview on reports
export function siftFetched(inventory: Awaited<ReturnType<typeof getBusinessProductsInventoryUids>>["inventory"], aggregates: Awaited<ReturnType<typeof getVarianceAggregateByProduct>>) {
    // aggregates.forEach(item=>)

    const d = aggregates.map((items, index) => {
        const productInventory = inventory.find(x => x.uid == items.inventoryUid)

        // return {
        //     // uid: productInventory?.uid,
        //     name: productInventory?.product.name,
        //     unit: productInventory?.product.unit,
        //     exprected: items._sum.expectedCount,
        //     actual: items._sum.actualCount,
        //     variance: items._sum.variance
        // }

        return [index+1, productInventory?.product.name, items._sum.expectedCount, items._sum.actualCount, items._sum.variance, productInventory?.product.unit]
    })

    return d
}
