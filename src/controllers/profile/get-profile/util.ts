import { prisma } from "../../../helpers/db/client";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";

export async function fetchUserProfileByUid(businessProfileUid: string) {
    const userProfile = await prisma.businessProfile.findFirst({
        where: { uid: businessProfileUid },
        include: { businessOwner: {include: {owner: true}} }
    });
    if (!userProfile) throw new InternalError(null, "User profile not found.");
    return userProfile;
}

export function userProfileDAO(userProfile: Awaited<ReturnType<typeof fetchUserProfileByUid>>) {
    return {
        fullName: userProfile.name || '',
        phoneNumber: userProfile.businessOwner?.phoneNo || '',
        email: userProfile.businessOwner?.owner.email,
        role: userProfile?.businessOwner?.accessType,
        status: userProfile?.businessOwner?.status,
        accessLevel: userProfile?.businessOwner?.accessType === 'owner' ? 'Full System Access' : '',
        lastPasswordChange: userProfile.businessOwner?.owner?.pwdChangeAt,
        profileUrl: userProfile.businessOwner?.profileUrl
        // Add more fields as needed for the frontend
    };
}

export async function fetchOtherUserProfile(userProfileUid: string){
    const profile = await prisma.userProfile.findFirst(
        {
            where:{
                uid: userProfileUid
            },
            include: {
                owner: true
            }
        }
    )

    if (!profile) throw new InternalError(null, "User profile not found.");
    return profile;
}

export function fetchOtherUserProfileDAO(userProfile: Awaited<ReturnType<typeof fetchOtherUserProfile>>) {
    return {
        fullName: userProfile.name || '',
        phoneNumber: userProfile?.phoneNo || '',
        email: userProfile?.owner.email,
        role: userProfile?.accessType,
        status: userProfile?.status,
        accessLevel: userProfile?.accessType === 'owner' ? 'Full System Access' : '',
        lastPasswordChange: userProfile?.owner?.pwdChangeAt,
        profileUrl: userProfile?.profileUrl
        // Add more fields as needed for the frontend
    };
}


