import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { getBusinessIdFromRequest, getProfileUidFromRequest, validateDTO } from "../../../helpers/util";
import { success } from "../../../helpers/errorHandler/statusCodes";
import { CreateBusinessProfileDTO, createBusinessProfile, getBusinessProfileExistence, updateFirstTimeLogin } from "./util";

export async function CreateBusinessProfileController(req: Request, res: Response, next: NextFunction) {
    try {
        const profileUid = getProfileUidFromRequest(req)

        const dto = await validateDTO(CreateBusinessProfileDTO, { ...req.body, userUid: profileUid });
        await getBusinessProfileExistence(profileUid);
        const business = await createBusinessProfile(dto);
        success(res, {}, "Business profile created successfully");

        await updateFirstTimeLogin(profileUid, business)
    } catch (error) {
        next(new InternalError(error));
    }
}
