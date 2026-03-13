import { object, string } from "yup"
import { prisma } from "../../../../helpers/db/client";

export const SubscriptionMetricDTO = object(
    {
        type: string().oneOf(["active", "trial", "expired"]).default("active"),

    }
)

export type TSubscriptionMetricDTO = typeof SubscriptionMetricDTO.__outputType;

export async function GetSubscriptionMetric(dto: TSubscriptionMetricDTO) {
    let count: number = 0
    switch (dto.type) {
        case "active":
            count = await prisma.subscriptions.count(
                {
                    where: {
                        isTrial: false,
                        isActive: true
                    }
                }
            )
            break;

        case "trial":
            count = await prisma.subscriptions.count(
                {
                    where: {
                        isTrial: true,
                        isActive: true
                    }
                }
            )
            break;

        case "expired":
            count = await prisma.subscriptions.count(
                {
                    where: {
                        isTrial: false,
                        isActive: false
                    }
                }
            )
            break;

        default: //all
            count = await prisma.subscriptions.count(
                {
                    where: {
                        isTrial: false,
                        isActive: true
                    }
                }
            )
    }

    return count
}