import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { success } from "../../../helpers/errorHandler/statusCodes";
import { fetchUserProfileByUid, userProfileDAO } from "../get-profile/util";

export async function GetUserProfileController(req: Request, res: Response, next: NextFunction) {
    try {
        // Assume userProfileUid is available from JWT payload or session
        const userProfileUid = (req as any).jwtPayload?.userProfileUid;
        // if (!userProfileUid) throw new InternalError(null, "User profile UID missing in request.");


        const profile = await fetchUserProfileByUid(userProfileUid);

        const user = userProfileDAO(profile)
        success(res, user, "User profile fetched successfully");
    } catch (error) {
        next(new InternalError(error));
    }
}
