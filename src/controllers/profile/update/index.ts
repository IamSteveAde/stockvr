import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { validateDTO } from "../../../helpers/util";
import { success } from "../../../helpers/errorHandler/statusCodes";
import { UpdateProfileDTO, updateUserProfile } from "./util";

export async function UpdateUserProfileController(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = await validateDTO(UpdateProfileDTO, req.body);
        const userProfileUid = (req as any).jwtPayload.userProfileUid;
        await updateUserProfile(userProfileUid, dto);
        success(res, {}, "Profile updated successfully");
    } catch (error) {
        next(new InternalError(error));
    }
}
