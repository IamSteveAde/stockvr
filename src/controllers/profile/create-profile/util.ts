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
    userUid: string().required("Profile UID is required.")

});

export type TCreateBusinessProfileDTO = typeof CreateBusinessProfileDTO.__outputType;

export async function getBusinessProfileExistence(userUid: string) {
    const profile = await prisma.businessProfile.findFirst({ where: { userUid: userUid } });
    // if (!profile) throw new InternalError(null, "Business profile not found.");
    if (profile) throw new InternalError(null, "Business profile already exists for this user.");
    return;
}

export async function createBusinessProfile(data: TCreateBusinessProfileDTO) {
    try {
        return await prisma.businessProfile.create({
            data: {
                uid: "BUS-" + nanoid(12),
                name: data.name,
                businessType: data.businessType,
                location: data.location,
                dailyStaffSize: data.dailyStaffSize,
                userUid: data.userUid
            },
        });
    } catch (error) {
        throw new InternalError(error, "Failed to update business profile.");
    }
}

export async function updateFirstTimeLogin(uid: string, business: Awaited<ReturnType<typeof createBusinessProfile>>) {

    await prisma.$transaction(async (t) => {
        const profile = await t.userProfile.findUnique(
            {
                where: {
                    uid
                },
                include: {
                    owner: true
                }
            }
        )

        await t.userProfile.update(
            {
                where: {
                    uid
                },
                data: {
                    businessUid: business.uid
                }
            }
        )

        await t.users.update({
            where: { uid: profile?.owner.uid },
            data: {
                isFirstLogin: false
            }
        }
        )
    })
}
