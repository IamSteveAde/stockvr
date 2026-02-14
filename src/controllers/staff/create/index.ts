import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { getProfileUidFromRequest, validateDTO } from "../../../helpers/util";
import { success } from "../../../helpers/errorHandler/statusCodes";
import { CreateStaffDTO, createStaff } from "./util";

export async function CreateStaffController(req: Request, res: Response, next: NextFunction) {
    try {

        const profileUid = getProfileUidFromRequest(req)

        const dto = await validateDTO(CreateStaffDTO, req.body);
        const staff = await createStaff(dto);
        success(res, { staff }, "Staff member created successfully");
    } catch (error) {
        next(new InternalError(error));
    }
}


// todo structured flow staff is to be linked to businesses, owner logs in as a business and permissions are granted at owner level figure it out tomorrow.
