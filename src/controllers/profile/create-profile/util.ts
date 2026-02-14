import { object, string, number } from "yup";
import { prisma } from "../../../helpers/db/client";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { nanoid } from "nanoid";

export const CreateBusinessProfileDTO = object({
    
    name: string().required("Business name is required."),
    businessType: string().oneOf([
        "restaurant",
        "cafe",
        "lounge/bar",
        "hotel Kitchen",
        "cloud Kitchen",
        "retail Experience Center"
    ], "Invalid business type").required("Business type is required."),
    location: string().required("Business location is required."),
    dailyStaffSize: string().oneOf([
        "1-5",
        "6-15",
        "16-30",
        "30+"
    ], "Invalid daily staff size").required("Daily staff size is required."),
    profileUid: string().required("Profile UID is required.")
    
});

export type TCreateBusinessProfileDTO = typeof CreateBusinessProfileDTO.__outputType;

export async function getBusinessProfileExistence(profileUid: string) {
    const profile = await prisma.userProfile.findFirst({ where: { uid: profileUid } });
    if (!profile) throw new InternalError(null, "Business profile not found.");
    if (profile.businessType) throw new InternalError(null, "Business profile already exists for this user.");
    return;
}

export async function createBusinessProfile(data: TCreateBusinessProfileDTO) {
    try {
        return await prisma.userProfile.update({
            data: {
                name: data.name,
                businessType: data.businessType,
                location: data.location,
                dailyStaffSize: data.dailyStaffSize,
                owner: {
                    update: {  
                        isFirstLogin: false
                    }
                }
            },
            where: { uid: data.profileUid }
        });
    } catch (error) {
        throw new InternalError(error, "Failed to update business profile.");
    }
}
