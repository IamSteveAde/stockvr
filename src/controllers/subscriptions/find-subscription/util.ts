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
        }
    })

    if (!subscription) {
        throw new InternalError(null, "Active subscription not found for this business.", HttpStatusCode.PaymentRequired)
    }

    return subscription
}