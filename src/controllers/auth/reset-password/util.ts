import { object, string } from "yup";
import { prisma } from "../../../helpers/db/client";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { createJwtToken } from "../sign-in/util";
import { SECRETS } from "../../../helpers/util/secrets";

export const ResetPasswordDTO = object({
    email: string().required("Email missing.")
});

export type TResetPasswordDTO = typeof ResetPasswordDTO.__outputType;

export async function fetchUserByEmailForReset(email: string) {
    const user = await prisma.users.findFirst({ where: { email } });
    if (!user) throw new InternalError(null, "User not found.");
    return user;
}

export function generateResetLink(userUid: string) {
    const token = createJwtToken({
        accessType: "reset-password",
        permissions: [],
        userProfileUid: userUid
    });
    const frontendUrl = SECRETS.FRONTEND_URL || "http://localhost:3000/reset-password";
    return `${frontendUrl}?token=${token}`;
}
