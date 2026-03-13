
import { prisma } from "../../../../helpers/db/client";
import { TBaseDTO } from "../metrics/util";

export async function getMetrics(dto: TBaseDTO) {
    const varianceSummary = await prisma.inventoryTotalVariance.paginate(
        {
            where: {
                businessUid: dto.businessUid
            },
            include: {
                linkedInventory: {
                    include: {
                        product: true
                    }
                }
            }
        }
    ).withPages({
        page: 1,
        limit: 5
    })

    // return getInventoryTotalDao(varianceSummary)

    return {
        data:
            varianceSummary[0].map(item=>{
                return {
                     
                name: item.linkedInventory.product.name,
                unit: item.linkedInventory.product.unit,
                expectedCount: item?.expectedCount || 0,
                actualCount: item?.actualCount || 0,
                variance: item?.variance || 0,

                }
            }),

        meta: {}
    }
}