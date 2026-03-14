import { nanoid } from "nanoid";
import { prisma } from "../../../helpers/db/client";
import { object, string } from "yup";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { addDays } from "date-fns"

const BusinessProfileDTO = object(
    {
        name: string().required("kindly provide name of business"),
        businessType: string().required("Kindly provide a business type"),
        location: string().required("Kindly provide current location"),
        dailyStaffSize: string().required("Kindly provide daily staff size"),
        userUid: string().required("User mising")
    }
)

export type TBusinessProfileDTO = typeof BusinessProfileDTO.__outputType

export async function checkBusinessExists(dto: TBusinessProfileDTO) {
    const exists = await prisma.businessProfile.findFirst(
        {
            where: {
                userUid: dto.userUid
            }
        }
    )

    if (exists) {
        throw new InternalError(null, "Business profile exists for user.")
    }
}

export async function createBusinessProfile(dto: TBusinessProfileDTO) {
    const startAt = new Date()
    const endAt = addDays(startAt, 15)

    await prisma.businessProfile.create(
        {
            data: {
                uid: "BUS_" + nanoid(12),
                // userUid: 
                ...dto,
                subscription: {
                    create: {

                        subscriptionRef: "SUB_" + nanoid(12),
                        startAt,
                        endAt
                    }

                }
            }
        }
    )
}