import { Request, Response, NextFunction } from "express"
import { InternalError } from "../../../helpers/errorHandler/errorHandler"
import { getProfileUidFromRequest, validateDTO } from "../../../helpers/util"
import { addEndShiftEntry, endShift, EndShiftDTO, getInventoryRecords, getShift, pushtoRedis, updateInventory, validatePin } from "./util"
// import { getShift } from "../../stock/entry/util"
import { success } from "../../../helpers/errorHandler/statusCodes"
import { addTrail } from "../../audit-trail/add/util"


export async function EndShiftController(req: Request, res: Response, next: NextFunction) {
    try {
        const staffUid: string = getProfileUidFromRequest(req)

        const dto = await validateDTO(EndShiftDTO, { ...req.body, staffUid })
        const shift = await getShift({ staffUid, shiftUid: dto.shiftUid })

        const inventory = await getInventoryRecords(dto)

        await validatePin(dto.pin, shift)

        success(res, {}, "Shift ended successfully.")

        await addTrail({
            businessUid: shift.businessUid,
            staffUid: staffUid,
            action: `Shift ended`,
            entity: "Shift",
            // productUid: product.uid,
            shiftUid: shift.uid,
            detail: `Shift, ${shift.baseShift.name} ended`,
        })

        const entries = await addEndShiftEntry(dto, shift, inventory)
        await updateInventory(dto)
        await pushtoRedis(shift.businessUid, dto.shiftUid, entries)
        await endShift(shift)

    } catch (error) {
        console.log(error)
        next(new InternalError(error))
    }
}