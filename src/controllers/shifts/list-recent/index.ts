import { Request, Response, NextFunction } from "express"
import { InternalError } from "../../../helpers/errorHandler/errorHandler"
import { getBusinessIdFromRequest, getProfileUidFromRequest, validateDTO } from "../../../helpers/util"
import { getStaffShiftRecords, ListStaffShiftDTO } from "./util"
import { success } from "../../../helpers/errorHandler/statusCodes"
import { getShiftsDAO } from "../list/util"

export async function ListStaffRecentShiftController(req: Request, res: Response, next: NextFunction) {
    try {

        const profileUid = getProfileUidFromRequest(req)
 
        const dto = await validateDTO(ListStaffShiftDTO, { ...req.params, ...req.query, profileUid })

        const shifts_ = await getStaffShiftRecords(dto)

        const shifts = getShiftsDAO(shifts_, dto.timezone)

        success(res, shifts,"Fetched" )
    } catch (error) {
        next(new InternalError(error))
    }

}