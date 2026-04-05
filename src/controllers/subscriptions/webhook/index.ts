import { Request, Response } from "express"
// import { APIResponse } from "../../util"
// import { getPlanByID, getUserByEmail, linkSubscriptionCodeToActiveSubscription, updateTransactionStatus } from "./util"
import { constructSubscription, createSubscription, createTransactionRecord, expirePreviousSubscriptions } from "../create-subscription/util"
import { nanoid } from "nanoid"
import { success } from "../../../helpers/errorHandler/statusCodes"
import { fetchUserByEmail } from "../../auth/sign-in/util"
import { fetchUserByEmailWithSubscription, linkSubscriptionCodeToActiveSubscription, updateTransactionStatus } from "./util"

export async function WebhookController(req: Request, res: Response) {
    success(res, {}, "rreceived")


    try {

        console.log("data ===> ", req.body)

        const event: Record<any, any> = req.body

        const data = event.data

        const ref = data.reference
        let subscriptionRef: string | undefined
        let invoice_action: string | undefined
        let plan_code: string | undefined
        const email = data.customer.email

        subscriptionRef = data.metadata?.subscriptionRef
        invoice_action = data.metadata?.invoice_action
        plan_code = data?.plan?.plan_code
        

        const user = await fetchUserByEmailWithSubscription(email)
        const businessProfileUid = user?.userProfiles?.business?.uid
        


        switch (event.event) {

            case "charge.success":

                if (subscriptionRef) {
                    await updateTransactionStatus(ref, subscriptionRef)
                }

                if (invoice_action == "create") {
                    const subscriptionData = constructSubscription(user.userProfiles?.business?.uid!, true)

                    await createSubscription(subscriptionData)
                }
                break
            case "subscription.create":
                const user_subscriptions = user?.userProfiles?.business?.subscription
                const linkedCode = data.subscription_code
                const linkedToken = data.email_token

                if (user_subscriptions && user_subscriptions?.length > 0) {
                    const subscription = user_subscriptions[0]

                    console.log("===>", subscription)

                    await linkSubscriptionCodeToActiveSubscription(subscription?.subscriptionRef!, linkedCode, linkedToken)
                }
                break

            case "invoice.create":
                const subscriptionData = constructSubscription(businessProfileUid!, true)

                await expirePreviousSubscriptions(new Date(), subscriptionData.subscriptionRef, businessProfileUid!)

                await createSubscription({ ...subscriptionData, linkedCode: data.subscription.subscription_code, linkedEmailToken: data.subscription.email_token })

                await createTransactionRecord({ trxRef: data.transaction.reference, amount: Number(data.subscription.amount) / 100, currency: data.transaction.currency, source: "Paystack", subscriptionRef: subscriptionData.subscriptionRef, status: "Success" })

                break

            case "charge:failed":
            case "invoice.payment_failed":
                // await updateTransactionStatus(ref, "Failed", subscriptionRef)
                break

            // default:
            //     await updateTransactionStatus(ref, "Failed", subscriptionRef)
            //     break
        }
    } catch (error) {
        console.log("Error processing webhook:", error)
    }
}