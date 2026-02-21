import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { getBusinessIdFromRequest, validateDTO } from "../../../helpers/util";
import { success } from "../../../helpers/errorHandler/statusCodes";
import { CreateShiftDTO, createShiftWithAssignments, ShiftStaffsDTO } from "./util";

export async function CreateShiftController(req: Request, res: Response, next: NextFunction) {
    try {

        const businessUid = getBusinessIdFromRequest(req)
        const dto_ = await validateDTO(CreateShiftDTO, {...req.body, businessUid});
        const staff_ = await validateDTO(ShiftStaffsDTO, req.body)

        const shift = await createShiftWithAssignments({...dto_, ...staff_})

        success(res, {}, "Shift created successfully");
    } catch (error) {
        next(new InternalError(error));
    }
}
