import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { success } from "../../../helpers/errorHandler/statusCodes";
import { fetchUserProfileByUid, userProfileDAO } from "../get-profile/util";
import { getBusinessIdFromRequest } from "../../../helpers/util";

export async function GetUserProfileController(req: Request, res: Response, next: NextFunction) {
    try {

        const bus = getBusinessIdFromRequest(req)

        console.log(bus)

        if(!bus.busId){
            next (new InternalError(undefined, "Business profile missing."))
            return
        }

        const profile = await fetchUserProfileByUid(bus.busId);

        const user = userProfileDAO(profile)
        success(res, user, "User profile fetched successfully");
    } catch (error) {
        next(new InternalError(error));
    }
}
