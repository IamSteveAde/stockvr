import { prisma } from "../../../helpers/db/client";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { object, string } from "yup";

export const UpdateProfileDTO = object({
    name: string().optional(),
    profileUrl: string().optional(),
    phoneNo: string().optional()
});

export type TUpdateProfileDTO = typeof UpdateProfileDTO.__outputType;

export async function updateUserProfile(userProfileUid: string, data: TUpdateProfileDTO) {
    const userProfile = await prisma.userProfile.findFirst({ where: { uid: userProfileUid } });
    if (!userProfile) throw new InternalError(null, "User profile not found.");
    await prisma.userProfile.update({
        where: { uid: userProfileUid },
        data: {
            name: data.name ?? userProfile.name,
            profileUrl: data.profileUrl ?? userProfile.profileUrl,
            phoneNo: data.phoneNo ?? userProfile.phoneNo
        }
    });
}
