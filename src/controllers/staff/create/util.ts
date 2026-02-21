import { object, string } from "yup";
import { prisma } from "../../../helpers/db/client";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { nanoid } from "nanoid";
import { ACCESS_TYPES } from "../../../helpers/accessTypes";
import { sendMail } from "../../../helpers/util";
import { hashPassword } from "../../auth/create-account/util";

export const CreateStaffDTO = object({
    name: string().required("Full name is required."),
    email: string().email("Invalid email address.").required("Email address is required."),
    phoneNo: string().required("Phone number is required."),
    role: string().oneOf([ACCESS_TYPES.staff, ACCESS_TYPES.manager], "Invalid role").required("Role is required."),
    businessUid: string().required("Business profile UID is required.")
});

export type TCreateStaffDTO = typeof CreateStaffDTO.__outputType;

function generatePin(length = 6): string {
    let pin = "";
    for (let i = 0; i < length; i++) {
        pin += Math.floor(Math.random() * 10).toString();
    }
    return pin
}

export async function createStaff(data: TCreateStaffDTO) {
    // Check if user already exists
    const existingUser = await prisma.users.findFirst({ where: { email: data.email } });
    if (existingUser) throw new InternalError(null, "A user with this email already exists.");

    // Generate PIN and set as password
    const pin = generatePin();

    // Create user and user profile
    const user = await prisma.users.create({
        data: {
            uid: `STAFF-${nanoid(24)}`,
            email: data.email,
            password: await hashPassword({password: pin}), // In production, hash this PIN
            userProfiles: {
                create: {
                    uid: `PROFILE-${nanoid(12)}`,
                    businessUid: data.businessUid,
                    accessType: data.role,
                    phoneNo: data.phoneNo,
                    name: data.name,
                    status: "Active",
                    pin: pin
                }
            }
        },
        include: { userProfiles: true }
    });

    return {user, pin};
}
