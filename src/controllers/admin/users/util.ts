import { object, string } from "yup"
import { prisma } from "../../../helpers/db/client";
import { ACCESS_TYPES } from "../../../helpers/accessTypes";

export const UserMetricDTO = object(
    {
        // profileUid: string().required(),
        type: string().oneOf(["total", "inactive", ...Object.values(ACCESS_TYPES).map(i => { return i.toLowerCase() })]).required("Missing user type"),

    }
)

export type TUserMetricDTO = typeof UserMetricDTO.__outputType;

export async function GetUserMetric(dto: TUserMetricDTO) {
    let count: number = 0
    switch (dto.type) {
        case "total":
            count = await prisma.userProfile.count()
            break;

        case ACCESS_TYPES.staff.toLowerCase():
        case ACCESS_TYPES.owner.toLowerCase():
        case ACCESS_TYPES.manager.toLowerCase():
            count = await prisma.userProfile.count(
                {
                    where: {
                        accessType: dto.type
                    }
                }
            )
            break;
        case "inactive":
            count = await prisma.userProfile.count(
                {
                    where: {
                        status: {
                            not:"active",
                            mode: "insensitive"
                        }
                    }
                }
            )
            break;
        default:
            count = await prisma.userProfile.count()
            break;
    }

    return count
}