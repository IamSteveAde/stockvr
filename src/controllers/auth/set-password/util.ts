import { object, string } from "yup";
import { prisma } from "../../../helpers/db/client";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { hashPassword } from "../create-account/util";

// DTO for new password
export const NewPasswordDTO = object({
    password: string().min(8, "Password cannot be less than 8 characters.").required("Password missing")
});

export type TNewPasswordDTO = typeof NewPasswordDTO.__outputType;

// Fetch user and user profile by userProfileUid
export async function fetchUserAndProfileByUid(userProfileUid: string) {
    const userProfile = await prisma.userProfile.findFirst(
        {
            where: { uid: userProfileUid },
            include: { owner: true }
        }
    );
    if (!userProfile || !userProfile.owner) throw new InternalError(null, "User profile not found.");
    return userProfile;
}

// Update user password
export async function updateUserPassword(profile: Awaited<ReturnType<typeof fetchUserAndProfileByUid>>, password: string) {
    const userId = profile.owner.uid
    const hashed = await hashPassword({ password });
    await prisma.users.update({ where: { uid: userId }, data: { password: hashed } });
}
