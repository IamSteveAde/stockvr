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
        select: {
            subscriptionRef: true,
            startAt: true,
            endAt: true,
            isTrial: true,
            isActive: true
        }
    })

    return subscription
}