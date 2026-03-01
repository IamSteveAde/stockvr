import { Request, Response, NextFunction } from "express"
import { InternalError } from "../../../helpers/errorHandler/errorHandler"
import { getBusinessIdFromRequest, getProfileUidFromRequest, validateDTO } from "../../../helpers/util"
import { getShiftRecords, getShiftsDAO, ListShiftDTO } from "./util"
import { success } from "../../../helpers/errorHandler/statusCodes"

export async function ListShiftsController(req: Request, res: Response, next: NextFunction) {
    try {

        const bus = getBusinessIdFromRequest(req)
        const user = getProfileUidFromRequest(req)
 
        const q = {
            type: bus.type,
            profileUid: bus.type == "owner" ? bus.busId : user
        }

        const dto = await validateDTO(ListShiftDTO, { ...req.query, ...q })

        const shifts_ = await getShiftRecords(dto)

        const shifts = getShiftsDAO(shifts_, dto.timezone)

        success(res, shifts,"Fetched" )
    } catch (error) {
        next(new InternalError(error))
    }

}