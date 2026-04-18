import { Response, Request, NextFunction } from "express";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { getBusinessIdFromRequest, getProfileUidFromRequest, validateDTO } from "../../../helpers/util";
import { deleteShift, DeleteShiftDTO, getSpecificShift, TDeleteShiftDTO } from "./util";
import { success } from "../../../helpers/errorHandler/statusCodes";

export async function DeleteShiftController(req: Request, res: Response, next: NextFunction) {
    try {
        const profileUid = getBusinessIdFromRequest(req)

        console.log(req.body)

        const dto: TDeleteShiftDTO = await validateDTO(DeleteShiftDTO, {...req.body, businessUid: profileUid.busId})

        const shift = await getSpecificShift(dto)


        await deleteShift(shift)

        success(res, {}, "Shift deleted.")

    } catch (error) {
        next(new InternalError(error))
    }
}