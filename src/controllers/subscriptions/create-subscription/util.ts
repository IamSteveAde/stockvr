import { nanoid } from "nanoid";
import { prisma } from "../../../helpers/db/client";
import { addDays } from "date-fns";
import { SECRETS } from "../../../helpers/util/secrets";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { string, object } from "yup"

export function createSubscription(data: any) {
    // Implementation for creating a subscription

    return {
        id: "sub_123",
        ...data
    };
}

export async function createPaidSubscription(customer: { emailAddress: string, name: string }) {

    const response = await fetch(SECRETS.SUBBIT_URL + "/subscriptions/initialize", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `${SECRETS.SUBBIT_SECRET_KEY}`
        },
        body: JSON.stringify({
            customer,
            planId: SECRETS.SUBBIT_PLAN_ID,
            businessId: SECRETS.SUBBIT_BUSINESS_ID
        })
    })

    if (response.ok) {
        const data = await response.json();
        console.log("Subscription initialized with Subbit:", data);
    }
    return { success: false, message: "Failed to initialize subscription" };

}

export async function getBusinessProfileByUid(uid: string) {
    const profile = await prisma.businessProfile.findUnique(
        {
            where: {
                uid
            },
            select: {
                businessOwner: {
                    select: {
                        owner: { select: { email: true } }
                    }
                }
            }
        }
    )

    if (!profile) {
        throw new InternalError(null, "Business profile not found.")
    }

    return profile
}



export const createSubscriptionDTO = object(
    {
        businessProfileUid: string().required("Business profile UID is required."),
        email: string().email("Invalid email format.").required("Email is required."),
    }
)

export type TCreateSubscriptionDTO = typeof createSubscriptionDTO.__outputType

export function constructSubscription(businessProfileUid: string, isActive: boolean=true, isTrial: boolean=false) {
    return {
        subscriptionRef: "SUB_" + nanoid(12),
        businessProfileUid,
        isActive,
        isTrial,
        endAt: addDays(new Date(), 30),
    }
}

export async function insertSubscription(data: ReturnType<typeof constructSubscription> & { linkedCode?: string | undefined, linkedEmailToken?: string | undefined }) {
    return await prisma.subscriptions.create(
        {
            data: data
        }
    )
}

export async function initiatePayment(email: string, subscriptionRef: string) {
    const url = SECRETS.PAYSTACK_URL + "/transaction/initialize"

    const payload = {
        email,
        amount: 0,
        plan: SECRETS?.PAYSTACK_PLAN_ID,
        channels: ["card", "bank", "apple_pay", "ussd", "qr", "mobile_money", "bank_transfer", "eft", "capitec_pay", "payattitude"],
        metadata: {
            type: "subscription",
            subscriptionRef,
        },
        callback_url: SECRETS.PAYSTACK_CALLBACK
    }

    const response = await fetch(url, {
        body: JSON.stringify(payload), method: "POST", headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SECRETS.PAYSTACK_SECRET_KEY}`
        }
    })

    if (response.ok) {
        const data = await response.json() as unknown as Record<string, any>;
        return { success: true, trxRef: data.data.reference, authorizationUrl: data.data.authorization_url };
    }

    // return { success: false, message: "Failed to initialize payment" };
    throw new InternalError(null, "Failed to initialize payment with Paystack.")
}

export async function createTransactionRecord(payload: { trxRef: string, amount: number, currency: string, source: string, subscriptionRef?: string, status?:string }) {
    return await prisma.transactions.create(
        {
            data: payload
        }
    )
}

export async function expirePreviousSubscriptions(date: Date, ref: string, businessProfileUid: string) {
    return await prisma.subscriptions.updateMany(
        {
            where: {
                businessProfileUid: businessProfileUid,
                endAt: {
                    "lte": date
                },
                subscriptionRef: {
                    "not": ref
                }
            },
            data: {
                isActive: false
            }
        }
    )
}
