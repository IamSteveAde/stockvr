import { object, number } from "yup"
import { prisma } from "../../../helpers/db/client";

export const RestaurantDTO = object(
    {
        // adminUid: string().required("Unauthorizd access, sikeeeeee"),
        // type: string().oneOf(["total-restaurants", "active-subscription", "trial-running", "churn-risk"]),
        page: number().default(1),
        pageLimit: number().default(10)

    }
)

export type TRestaurantDTO = typeof RestaurantDTO.__outputType;

export async function getBusinesses(dto: TRestaurantDTO) {
    return await prisma.businessProfile.paginate(
        {

            select: {
                uid: true,
                name: true,
                _count: {
                    select: {
                        userProfiles: true
                    }
                },
                businessOwner: {
                    select: {
                        name: true,
                        owner: {
                            select: {
                                email: true
                            }
                        }
                    }
                },
                location: true,
                businessType: true,
                subscription: true
            },


        }
    ).withPages(
        {
            limit: dto.pageLimit,
            page: dto.page, includePageCount: true
        }
    )
}

export function getBusinessesDAO(data: Awaited<ReturnType<typeof getBusinesses>>) {
    return {
        meta: data[1],
        businesses: data[0].map(item => {
            return {
                uid: item.uid,
                name: item.name,
                city: item.location,
                owner: {
                    name: item.businessOwner?.name,
                    email: item.businessOwner?.owner.email
                },
                staffSize: item._count.userProfiles,
                subscriptionStatus: item.subscription?.isTrial ? "Trial" : item.subscription?.isActive ? "Active" : "Expired"
            }
        })
    }
}