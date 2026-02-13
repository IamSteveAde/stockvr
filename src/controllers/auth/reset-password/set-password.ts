import { Request, Response, NextFunction } from "express";
import { prisma } from "../../../helpers/db/client";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { validateDTO } from "../../../helpers/util";
import { success } from "../../../helpers/errorHandler/statusCodes";
import { object, string } from "yup";
import { hashPassword } from "../create-account/util";

export const NewPasswordDTO = object({
    password: string().min(8, "Password cannot be less than 8 characters.").required("Password missing")
});

export async function SetNewPasswordController(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = await validateDTO(NewPasswordDTO, req.body);
        const payload = (req as any).jwtPayload;
        if (!payload || !payload.userProfileUid) {
            throw new InternalError(null, "Invalid or missing token payload.");
        }
        // Find user by userProfileUid
        const userProfile = await prisma.userProfile.findFirst({ where: { uid: payload.userProfileUid } });
        if (!userProfile) throw new InternalError(null, "User profile not found.");
        const user = await prisma.users.findFirst({ where: { uid: userProfile.userId } });
        if (!user) throw new InternalError(null, "User not found.");
        // Update password
        const hashed = await hashPassword({ password: dto.password });
        await prisma.users.update({ where: { uid: user.uid }, data: { password: hashed } });
        success(res, {}, "Password updated successfully");
    } catch (error) {
        next(new InternalError(error));
    }
}
