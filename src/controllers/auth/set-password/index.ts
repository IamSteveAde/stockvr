import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { validateDTO } from "../../../helpers/util";
import { success } from "../../../helpers/errorHandler/statusCodes";
import { fetchUserAndProfileByUid, NewPasswordDTO, updateUserPassword } from "./util";

export async function SetNewPasswordController(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = await validateDTO(NewPasswordDTO, req.body);
        const payload = (req as any).jwtPayload;
        if (!payload || !payload.userProfileUid) {
            throw new InternalError(null, "Invalid or missing token payload.");
        }
        const user = await fetchUserAndProfileByUid(payload.userProfileUid);
        await updateUserPassword(user, dto.password);
        success(res, {}, "Password updated successfully");
    } catch (error) {
        // console.log("Error in SetNewPasswordController:", error);
        next(new InternalError(error));
    }
}
