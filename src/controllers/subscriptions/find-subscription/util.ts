import { HttpStatusCode } from "axios";
import { prisma } from "../../../helpers/db/client";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";

export async function getSubscriptionForBusiness(businessUid: string){
    const subscription = await prisma.subscriptions.findFirst({
        where: {
            businessProfileUid: businessUid,
            isActive: true,
            endAt: {
                gte: new Date()
            }
        },
        orderBy: {
            createdAt: "desc"
        },
        select: {
            subscriptionRef: true,
            startAt: true,
            endAt: true,
            isTrial: true,
            isActive: true,
            createdAt: true,
            transactions: {
                select: {
                    createdAt: true,
                    amount: true,
                    currency: true,
                    source: true,
                    status: true,
                    trxRef: true
                }
            }
        }
    })

    return subscription
}