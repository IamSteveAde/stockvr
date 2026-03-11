import { Request, Response, NextFunction } from "express"
import { InternalError } from "../../../helpers/errorHandler/errorHandler"
import { getProfileUidFromRequest, validateDTO } from "../../../helpers/util"
import { getAllInventoryCountAtStartTime, getSpecificShift, startShift, StartShiftDTO } from "./util"
import { success } from "../../../helpers/errorHandler/statusCodes"

export async function StartShiftController(req: Request, res: Response, next: NextFunction) {
    try {
        const profileUid = getProfileUidFromRequest(req)

        const dto = await validateDTO(StartShiftDTO, {...req.body, staffUid: profileUid})
        const shift = await getSpecificShift(dto)

        await startShift(shift)
        

        success(res, {}, "Shift started.")

        await getAllInventoryCountAtStartTime(shift.businessUid,dto.shiftUid )


    } catch (error) {
        next(new InternalError(error))
    }
}