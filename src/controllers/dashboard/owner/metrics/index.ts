import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../../helpers/errorHandler/errorHandler";
import { getBusinessIdFromRequest, validateDTO } from "../../../../helpers/util";
import { BaseDTO, getMetrics } from "./util";
import { success } from "../../../../helpers/errorHandler/statusCodes";

export async function MetricController(req: Request, res: Response, next: NextFunction) {
    try {
        const bus = getBusinessIdFromRequest(req)

        console.log(bus)

        const dto = await validateDTO(BaseDTO, {businessUid: bus.busId})

        success(res, await getMetrics(dto), "Fetched")
    } catch (error) {
        next(new InternalError(error))
    }
}