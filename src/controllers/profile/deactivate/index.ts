import { NextFunction, Request, Response } from "express";
import { getBusinessIdFromRequest, getProfileUidFromRequest, validateDTO } from "../../../helpers/util";
import { deactivateBusiness, DeactivateDTO, validateAccountUsedToDeactivate } from "./util";
import { success } from "../../../helpers/errorHandler/statusCodes";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";


export async function DeactivateBusinessProfileController(req: Request, res: Response, next: NextFunction) {
    try {

        const business = getBusinessIdFromRequest(req)
        const profileUid = getProfileUidFromRequest(req)

        const dto = await validateDTO(DeactivateDTO, { profileUid, businessUid: business.busId });

        const profile = await validateAccountUsedToDeactivate(dto)

        await deactivateBusiness(profile)

        success(res, { }, "Account deactivated successfully");

    } catch (error) {
        // console.error("Error in DeleteStaff:", error);
        next(new InternalError(error));
    }
}
