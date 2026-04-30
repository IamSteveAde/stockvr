import { object, string, number } from "yup";
import { fetchOtherUserProfile } from "../../profile/get-profile/util";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { HttpStatusCode } from "axios";
import { prisma } from "../../../helpers/db/client";
import { nanoid } from "nanoid";

export const DeleteDTO = object(
    {
        businessUid: string().required("skieeeeee"),
        uid: string().required("skieeeeee")
    }
)

export type TDeleteDTO = typeof DeleteDTO.__outputType;

export async function validateUserProfile(dto: TDeleteDTO) {
    const profile = await fetchOtherUserProfile(dto.uid)
    if (!profile || profile.businessUid != dto.businessUid) {
        throw new InternalError(null, "Profile not found", HttpStatusCode.NotFound)
    }

    if (profile.accessType.toLowerCase() == "owner") {
        throw new InternalError(null, "Oops, Owner Account cannot be deleted.", HttpStatusCode.NotFound)
    }

    return profile
}



export async function deleteUserRecord(profile: Awaited<ReturnType<typeof validateUserProfile>>) {
    await prisma.$transaction(async t => {
        await t.userProfile.update(
            {
                where: {
                    uid: profile.uid
                },
                data: {
                    status: "DELETED"
                }
            }
        )

        await t.users.update(
            {
                where: {
                    uid: profile.owner.uid
                },
                data: {
                    email: profile.owner.email + nanoid(7) + "::DELETED"
                }
            }
        )
    })
}