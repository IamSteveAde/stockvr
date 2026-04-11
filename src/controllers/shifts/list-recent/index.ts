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

        // console.log(dto.type," ===> " ,shifts_)

        // console.dir(shifts_, { depth: 12 })

        const shifts = getShiftsDAO(shifts_, dto.timezone)

        success(res, shifts, "Fetched")
    } catch (error) {

        console.log(error)
        next(new InternalError(error))
    }

}