import { Request, Response, NextFunction } from "express";
import { getBusinessIdFromRequest, validateDTO } from "../../../helpers/util";
import { DeleteDTO, deleteUserRecord, validateUserProfile } from "./util";
import { success } from "../../../helpers/errorHandler/statusCodes";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";

export async function DeleteStaffController(req: Request, res: Response, next: NextFunction) {
    try {

        const business = getBusinessIdFromRequest(req)

        const dto = await validateDTO(DeleteDTO, { ...req.body, businessUid: business.busId });

        const profile = await validateUserProfile(dto)

        await deleteUserRecord(profile)

        success(res, { }, "Staff member deleted successfully");


        
    } catch (error) {
        // console.error("Error in DeleteStaff:", error);
        next(new InternalError(error));
    }
}
