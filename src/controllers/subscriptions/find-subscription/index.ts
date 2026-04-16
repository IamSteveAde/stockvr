import { NextFunction, Request, Response } from "express";
import { getBusinessIdFromRequest } from "../../../helpers/util";
import { getBusinessProfileByUid } from "../create-subscription/util";
import { getSubscriptionForBusiness } from "./util";
import { success } from "../../../helpers/errorHandler/statusCodes";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";


export async function FindSubscriptionController(req: Request, res: Response, next: NextFunction) {
    try {
        const businessProfileUid = getBusinessIdFromRequest(req)

        // console.log("buss ===>" , businessProfileUid, req.jwtPayload)

        const business = await getBusinessProfileByUid(businessProfileUid.busId)

        const subscription = await getSubscriptionForBusiness(businessProfileUid.busId)

        success(res, subscription || {})
    }catch(error){
        next(new InternalError(error))
    }

}