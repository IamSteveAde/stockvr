import { object, number } from "yup"
import { prisma } from "../../../../helpers/db/client";

export const GetSubscriptionDTO = object(
    {
        // adminUid: string().required("Unauthorizd access, sikeeeeee"),
        // type: string().oneOf(["total-GetSubscriptions", "active-subscription", "trial-running", "churn-risk"]),
        page: number().default(1),
        pageLimit: number().default(10)

    }
)

export type TGetSubscriptionDTO = typeof GetSubscriptionDTO.__outputType;

export async function getSubscriptions(dto: TGetSubscriptionDTO) {
    return await prisma.subscriptions.paginate(
        {

            

            include: {
                business: {
                    include: { 
                        businessOwner: {
                            include: {
                                owner: true
                            }
                        },
                        auditTrails: { orderBy: { createdAt: "desc" }, take: 1, } }
                }
            },
            orderBy: {
                endAt: "asc"
            }


        }
    ).withPages(
        {
            limit: dto.pageLimit,
            page: dto.page, includePageCount: true
        }
    )
}

export function getSubscriptionsDAO(data: Awaited<ReturnType<typeof getSubscriptions>>) {
    return {
        meta: data[1],
        businesses: data[0].map(item => {
            return {
                uid:item.business.uid,
                name: item.business.name,
                
                owner: {
                    name: item.business.businessOwner?.name,
                    email: item.business.businessOwner?.owner.email
                },
                lastActivity: item.business.auditTrails[0]?.createdAt,
                subscriptionStatus: item?.isTrial ? "Trial" : item?.isActive ? "Active" : "Expired"
            }
        })
    }
}