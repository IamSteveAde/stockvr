import { object, string } from "yup";
import { fetchOtherUserProfile } from "../get-profile/util";
import { HttpStatusCode } from "axios";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { prisma } from "../../../helpers/db/client";
import { nanoid } from "nanoid";


export const DeactivateDTO = object(
    {
        businessUid: string().required("Sikeeee"),
        profileUid: string().required("Missing value of profileUid")
    }
)

export type TDeactivateDTO = typeof DeactivateDTO.__outputType;

export async function validateAccountUsedToDeactivate(dto: TDeactivateDTO) {
    const profile = await fetchOtherUserProfile(dto.profileUid)
    if (!profile || profile.businessUid != dto.businessUid) {
        throw new InternalError(null, "Profile not found", HttpStatusCode.NotFound)
    }

    if (profile.accessType.toLowerCase() != "owner") {
        throw new InternalError(null, "Only owner can deactivate business account.", HttpStatusCode.BadRequest)
    }

    return profile
}


export async function deactivateBusiness(profile: Awaited<ReturnType<typeof validateAccountUsedToDeactivate>>) {

    const x = "::" + nanoid(7) + "::DEACTIVATED"

    await prisma.$transaction(async t => {
        await t.userProfile.updateMany(
            {
                where: {
                    businessUid: profile.businessUid!
                },
                data: {
                    status: "DEACTIVATED"
                }
            }
        )

        const uids = (await t.userProfile.findMany(
            {
                where: {
                    businessUid: profile.businessUid
                },
                select: {
                    userId: true
                }
            }
        ) )?.map(i=>i.userId)

        await t.$executeRaw`
  UPDATE "Users"
  SET "email" = "email" || ${x}
  WHERE "uid" =  ANY(${uids}::text[])
`;
    })
}