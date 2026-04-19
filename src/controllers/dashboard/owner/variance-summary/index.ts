import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../../helpers/errorHandler/errorHandler";
import { getBusinessIdFromRequest, validateDTO } from "../../../../helpers/util";
import { success } from "../../../../helpers/errorHandler/statusCodes";
import { getHighestVariantShiftForPeriod, getShiftVarianceCount, getTotalDescrepancies, VARsummary } from "./util";
// import { VARsummary } from "../util";

export async function VARsummaryController(req: Request, res: Response, next: NextFunction) {
    try {
        const bus = getBusinessIdFromRequest(req)

        const dto = await validateDTO(VARsummary, { businessUid: bus.busId, ...req.query })


        const data = {
            affectedShift: await getShiftVarianceCount(dto),
            totalDiscrepancies: await getTotalDescrepancies(dto),
            highestVarShift: await getHighestVariantShiftForPeriod(dto)

        }

        success(res, data, "Fetched")
    } catch (error) {
        next(new InternalError(error))
    }
}