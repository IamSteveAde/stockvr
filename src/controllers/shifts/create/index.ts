import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { getBusinessIdFromRequest, validateDTO } from "../../../helpers/util";
import { success } from "../../../helpers/errorHandler/statusCodes";
import { CreateShiftDTO, ShiftStaffsDTO, createBaseShift, createShiftAssignments } from "./util";

export async function CreateShiftController(req: Request, res: Response, next: NextFunction) {
    try {

        const businessUid = getBusinessIdFromRequest(req)
        
        const dto_ = await validateDTO(CreateShiftDTO, req.body);
        const staff_ = await validateDTO(ShiftStaffsDTO, req.body)

        const shift = await createBaseShift(dto_);


        success(res, { shift }, "Shift created successfully");

        await createShiftAssignments(shift, staff_)
    } catch (error) {
        next(new InternalError(error));
    }
}
