import { prisma } from "../../../helpers/db/client";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";

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

    if(!user){
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