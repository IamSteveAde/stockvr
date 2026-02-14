up import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { validateDTO } from "../../../helpers/util";
import { success } from "../../../helpers/errorHandler/statusCodes";
import { CreateShiftDTO, createShift } from "./util";

export async function CreateShiftController(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = await validateDTO(CreateShiftDTO, req.body);
        const shift = await createShift(dto);
        success(res, { shift }, "Shift created successfully");
    } catch (error) {
        next(new InternalError(error));
    }
}
