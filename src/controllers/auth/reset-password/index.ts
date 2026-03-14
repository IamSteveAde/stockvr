import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { sendMail, validateDTO } from "../../../helpers/util";
import { success } from "../../../helpers/errorHandler/statusCodes";
import { ResetPasswordDTO, fetchUserByEmailForReset, generateResetLink } from "./util";

export async function ResetPasswordController(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = await validateDTO(ResetPasswordDTO, req.body);
        const user = await fetchUserByEmailForReset(dto.email);
        const resetLink = generateResetLink(user.uid);

        success(res, {}, "Password reset link sent to your email");
        await sendMail({ to: user.email, subject: "Password reset", html: `<p>Hey there,</p><p>Kindly reset your password to your account using this link below: <b>${resetLink}</b></p>` });
    } catch (error) {
        next(new InternalError(error));
    }
}
