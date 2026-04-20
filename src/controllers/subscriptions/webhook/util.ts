import { prisma } from "../../../helpers/db/client";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import crypto from "crypto";
import { SECRETS } from "../../../helpers/util/secrets";
import { Request, Response } from "express";
import { HttpStatusCode } from "axios";

export async function fetchUserByEmailWithSubscription(email: string) {
    const user = await prisma.users.findUnique(
        {
            where: {
                email
            },
            include: {
                userProfiles: {
                    include: {
                        business: {
                            include: {
                                subscription: {
                                    orderBy: {
                                        createdAt: "desc"
                                    },
                                    take: 1,
                                }
                            }
                        }
                    }
                }
            }
        }
    )

    if (!user) {
        throw new InternalError("User not found")
    }
    return user
}


export async function updateTransactionStatus(trxRef: string, subscriptionRef: string) {

    await prisma.$transaction(async (t) => {
        await t.transactions.update({
            where: {
                trxRef: trxRef
            },
            data: {
                status: "Success"
            }
        })

        await t.subscriptions.update({
            where: {
                subscriptionRef: subscriptionRef
            },
            data: {
                isActive: true
            }
        })
    })


}

export async function linkSubscriptionCodeToActiveSubscription(ref: string, linkedCode: string, linkedEmailToken: string) {
    return await prisma.subscriptions.update(
        {
            where: {
                subscriptionRef: ref
            },
            data: {
                linkedCode,
                linkedEmailToken
            }
        }
    )
}

export async function linksubscriptionRefToTransaction(ref: string, subscriptionRef: string) {
    await prisma.transactions.update(
        {
            where: {
                trxRef: ref
            },
            data: {
                subscriptionRef
            }
        }
    )
}

export function validateSignature(req: Request) {
    const hash = crypto.createHmac('sha512', SECRETS.PAYSTACK_SECRET_KEY!).update(JSON.stringify(req.body)).digest('hex');

    if (hash != req.headers['x-paystack-signature']) {
        throw new InternalError(null, "Invalid signature", HttpStatusCode.BadRequest)
    }
}