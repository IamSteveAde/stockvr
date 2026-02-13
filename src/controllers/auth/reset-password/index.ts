import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { validateDTO } from "../../../helpers/util";
import { success } from "../../../helpers/errorHandler/statusCodes";
import { ResetPasswordDTO, fetchUserByEmailForReset, generateResetLink } from "./util";

export async function ResetPasswordController(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = await validateDTO(ResetPasswordDTO, req.body);
        const user = await fetchUserByEmailForReset(dto.email);
        const resetLink = generateResetLink(user.uid);

        // TODO: Send email with resetLink to user.email
        // sendEmail(user.email, resetLink);

        success(res, { resetLink }, "Password reset link sent to your email");
    } catch (error) {
        next(new InternalError(error));
    }
}
