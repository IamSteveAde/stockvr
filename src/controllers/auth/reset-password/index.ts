import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { sendMail, validateDTO } from "../../../helpers/util";
import { success } from "../../../helpers/errorHandler/statusCodes";
import { ResetPasswordDTO, fetchUserByEmailForReset, generateResetLink, resetTemplate } from "./util";
import util from "util"
import { SECRETS } from "../../../helpers/util/secrets";

export async function ResetPasswordController(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = await validateDTO(ResetPasswordDTO, req.body);
        const user = await fetchUserByEmailForReset(dto.email);
        const resetLink = generateResetLink(user.uid);

        success(res, {}, "Password reset link sent to your email");

        const html = util.format( resetTemplate, "", resetLink, resetLink)
        await sendMail({ to: user.email, subject: "Password reset", html: html });
    } catch (error) {
        next(new InternalError(error));
    }
}
