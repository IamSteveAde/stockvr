import { Request, Response, NextFunction } from "express"
import { InternalError } from "../../../helpers/errorHandler/errorHandler"
import { getProfileUidFromRequest, validateDTO } from "../../../helpers/util"
import { getAllInventoryCountAtStartTime, getSpecificShift, startShift, StartShiftDTO } from "./util"
import { success } from "../../../helpers/errorHandler/statusCodes"
import { addTrail } from "../../audit-trail/add/util"

export async function StartShiftController(req: Request, res: Response, next: NextFunction) {
    try {
        const profileUid = getProfileUidFromRequest(req)

        const dto = await validateDTO(StartShiftDTO, { ...req.body, staffUid: profileUid })
        const shift = await getSpecificShift(dto)

        await startShift(shift)


        success(res, {}, "Shift started.")

        await getAllInventoryCountAtStartTime(shift.businessUid, dto.shiftUid)

        await addTrail({
            businessUid: shift.businessUid,
            staffUid: profileUid,
            action: `Shift Start`,
            entity: "Shift",
            // productUid: product.uid,
            shiftUid: shift.uid,
            detail: `Shift, ${shift.baseShift.name} started`,
        })


    } catch (error) {
        next(new InternalError(error))
    }
}