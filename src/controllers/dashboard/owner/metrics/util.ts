import { object, string } from "yup";
import { prisma } from "../../../../helpers/db/client";

export const BaseDTO = object(
    {
        businessUid: string().required()
    }
)

export type TBaseDTO = typeof BaseDTO.__outputType;

export async function getMetrics(dto: TBaseDTO){
    const stockCount = await prisma.products.count(
        {
            where: {
                businessUid: dto.businessUid
            }
        }
    )

    const unresolvedVar = await prisma.inventoryTotalVariance.aggregate(
        {
            where: {
                businessUid: dto.businessUid
            },
            _sum: {
                variance: true
            }
        }
    )

    const staff = await prisma.userProfile.count(
        {
            where: {
                businessUid: dto.businessUid
            }
        }
    )

    return {
        stockCount,
        unresolvedVar: unresolvedVar._sum.variance,
        staff
    }
}