import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { success } from "../../../helpers/errorHandler/statusCodes";
import { fetchOtherUserProfile, fetchOtherUserProfileDAO } from "../get-profile/util";
import { getBusinessIdFromRequest, getProfileUidFromRequest } from "../../../helpers/util";

export async function GetUserProfileController(req: Request, res: Response, next: NextFunction) {
    try {

        const profileUid = getProfileUidFromRequest(req)

        // console.log(bus)

        // if(bus.type != "owner"){
        //     const profileUid = getProfileUidFromRequest(req)

        //     const userProfile = await fetchOtherUserProfile(profileUid)

        //     return success(res, fetchOtherUserProfileDAO(userProfile), "User profile fetched successfully");
        // }

        // if(!bus.busId){
        //     next (new InternalError(undefined, "Business profile missing."))
        //     return
        // }

        const profile = await fetchOtherUserProfile(profileUid);

        const user = fetchOtherUserProfileDAO(profile)

        // console.log("user ===> ", user)
        success(res, user, "User profile fetched successfully");
    } catch (error) {
        console.log(error)
        next(new InternalError(error));
    }
}
