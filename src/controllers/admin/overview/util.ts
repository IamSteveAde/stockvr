import { object, string } from "yup"
import { prisma } from "../../../helpers/db/client";

export const OverviewDTO = object(
    {
        // adminUid: string().required("Unauthorizd access, sikeeeeee"),
        type: string().oneOf(["total-restaurants", "active-subscription", "trial-running", "churn-risk"]),

    }
)

export type TOverviewDTO = typeof OverviewDTO.__outputType;

export async function GetOverView(dto: TOverviewDTO) {
    let count: number = 0
    switch (dto.type) {
        case "total-restaurants":
            count = await prisma.businessProfile.count()
            break;

        case "active-subscription":
            count = await prisma.subscriptions.count(
                {
                    where: {
                        isTrial: false,
                        isActive: true
                    }
                }
            )
            break;

        case "trial-running":
            count = await prisma.subscriptions.count(
                {
                    where: {
                        isTrial: true,
                        isActive: true
                    }
                }
            )
            break;

        case "churn-risk":
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            count = await prisma.subscriptions.count({
                where: {
                    endAt: {
                        lte: sevenDaysAgo, // endAt is 7 days ago or further in the past
                    },
                },
            });
            break;

    }

    return count
}