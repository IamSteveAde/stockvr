import { object, string } from "yup"
import { prisma } from "../../../helpers/db/client";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { ACCESS_TYPES, PERMISSIONS } from "../../../helpers/accessTypes";
import { verifyPassword } from "../create-account/util";
import jwt from "jsonwebtoken";
import { SECRETS } from "../../../helpers/util/secrets";

export const SignInDTO = object({
    email: string().required("Email missing."),
    password: string().min(8, "Password cannot be less than 8 characters.").required("Password missing")
});

export type TSignInDTO = typeof SignInDTO.__outputType;

export async function fetchUserByEmail(email: string) {
    const user = await prisma.users.findFirst({
        where: { email },
        include: { userProfiles: true }
    });
    if (!user) throw new InternalError(null, "User not found.");
    return user;
}

export async function validateUserPassword(password: string, storedHash: string) {
    const isValid = await verifyPassword({ password }, storedHash);
    if (!isValid) throw new InternalError(null, "Incorrect password.");
    return true;
}

export function getUserAccess(user: Awaited<ReturnType<typeof fetchUserByEmail>>) {
    const profile = user.userProfiles;
    if (!profile) throw new InternalError(null, "User profile not found.");
    const accessType = profile.accessType.toLowerCase() as keyof typeof PERMISSIONS;
    const permissions = PERMISSIONS[accessType] || [];
    return { accessType, permissions };
}

export function createJwtToken({ accessType, permissions, userProfileUid }: {
    accessType: string;
    permissions: string[];
    userProfileUid: string;
}) {
    const secret = SECRETS.JWT_SECRET
    const payload = {
        accessType,
        permissions,
        userProfileUid
    };
    return jwt.sign(payload, secret, { expiresIn: "1d" });
}

export function getFirstLoginStatus(user: Awaited<ReturnType<typeof fetchUserByEmail>>) {
    return {isFirstLogin: user.isFirstLogin, isBusiness: user.userProfiles?.isBusiness, proceedToProfileCreation: user.isFirstLogin && user.userProfiles?.isBusiness}
}