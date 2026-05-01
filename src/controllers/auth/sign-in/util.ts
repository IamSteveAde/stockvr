import { object, string } from "yup"
import { prisma } from "../../../helpers/db/client";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { ACCESS_TYPES, PERMISSIONS } from "../../../helpers/accessTypes";
import { verifyPassword } from "../create-account/util";
import jwt from "jsonwebtoken";
import { SECRETS } from "../../../helpers/util/secrets";

export const SignInDTO = object({
    email: string().required("Email missing."),
    password: string().required("Password missing")
});

export type TSignInDTO = typeof SignInDTO.__outputType;

export async function fetchUserByEmail(email: string) {
    const user = await prisma.users.findFirst({
        where: { email },
        include: { userProfiles: { include:{business: true} }}
    });
    if (!user ||user.userProfiles?.status.toLowerCase() != "active") throw new InternalError(null, "User not found.");
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

    const accessType = user.isBusinessOwner ? "owner" : profile.accessType.toLowerCase() as keyof typeof PERMISSIONS;
    const permissions = PERMISSIONS[accessType] || [];
    return { accessType, permissions };
}

export function createJwtToken({ accessType, permissions, userProfileUid, businessUid }: {
    accessType: string;
    permissions: string[];
    userProfileUid: string;
    businessUid?: string|undefined
}) {
    const secret = SECRETS.JWT_SECRET
    const payload = {
        accessType,
        permissions,
        userProfileUid,
        businessUid
    };
    return jwt.sign(payload, secret, { expiresIn: "1d" });
}

export function getFirstLoginStatus(user: Awaited<ReturnType<typeof fetchUserByEmail>>) {
    // console.log(user)

    return { isFirstLogin: user.isFirstLogin, isBusinessOwner: user.isBusinessOwner, proceedToProfileCreation: user.isFirstLogin && user.isBusinessOwner }
}