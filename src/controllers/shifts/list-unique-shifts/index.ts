import { NextFunction, Request, Response } from "express";
import { getBusinessIdFromRequest, getProfileUidFromRequest, validateDTO } from "../../../helpers/util";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { ListShiftDTO } from "../list/util";
import { getUniqueEndedStaffShiftRecords } from "./util";
import { success } from "../../../helpers/errorHandler/statusCodes";

export async function ListUniqueShifts(req: Request, res: Response, next: NextFunction) {

    try {
        // const profileUid = getProfileUidFromRequest(req)

        const bus = getBusinessIdFromRequest(req)
        const user = getProfileUidFromRequest(req)

        const q = {
            userType: bus.type,
            profileUid: bus.type == "owner" ? bus.busId : user
        }

        // const dto = await validateDTO(ListShiftDTO, { ...req.params, ...req.query, profileUid })

        const data = await getUniqueEndedStaffShiftRecords({ page: Number(req.query.page || 1), businessUid:q.profileUid })

        success(res, data)

    } catch (error) {
        next(new InternalError(error))
    }
}