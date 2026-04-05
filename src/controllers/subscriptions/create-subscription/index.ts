import { Request, Response, NextFunction } from "express"
import { InternalError } from "../../../helpers/errorHandler/errorHandler"
import { getBusinessIdFromRequest, validateDTO } from "../../../helpers/util"
import { constructSubscription, createSubscription, createSubscriptionDTO, createTransactionRecord, getBusinessProfileByUid, initiatePayment, insertSubscription, TCreateSubscriptionDTO } from "./util"
import { success } from "../../../helpers/errorHandler/statusCodes"

export async function InitializeSubscriptionController(req: Request, res: Response, next: NextFunction) {
    try {

        // const dto = await validateDTO(createSubscriptionDTO, req.body) as TCreateSubscriptionDTO
        const businessProfileUid = getBusinessIdFromRequest(req)

        const business = await getBusinessProfileByUid(businessProfileUid.busId) // to check if business profile exists. If not, it will throw an error and stop the process.

        const subscriptionPayload = constructSubscription(businessProfileUid.busId, false)

        await insertSubscription(subscriptionPayload)

        const response = await initiatePayment(business.businessOwner?.owner.email!, subscriptionPayload.subscriptionRef)

        success(res, { paymentUrl: response.authorizationUrl }, "Subscription initiate successfully. Please proceed to payment.");

        await createTransactionRecord({
            currency: "NGN",
            subscriptionRef: subscriptionPayload.subscriptionRef,
            amount: 60000, // amount in kobo for paystack
            source: "Paystack",
            trxRef: response.trxRef,
        })

    } catch (error) {
        next(new InternalError(error))
    }
}