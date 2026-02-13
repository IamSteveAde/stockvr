import { prisma } from "../../../helpers/db/client";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";

export async function fetchUserProfileByUid(userProfileUid: string) {
    const userProfile = await prisma.userProfile.findFirst({
        where: { uid: userProfileUid },
        include: { owner: true }
    });
    if (!userProfile || !userProfile.owner) throw new InternalError(null, "User profile not found.");
    return userProfile;
}

export function userProfileDAO(userProfile: Awaited<ReturnType<typeof fetchUserProfileByUid>>) {
    return {
        fullName: userProfile.name || '',
        phoneNumber: userProfile.phoneNo || '',
        email: userProfile.owner.email,
        role: userProfile.accessType,
        status: userProfile.status,
        accessLevel: userProfile.accessType === 'owner' ? 'Full System Access' : '',
        lastPasswordChange: userProfile.owner.pwdChangeAt,
        profileUrl: userProfile.profileUrl || '',
        // Add more fields as needed for the frontend
    };
}
