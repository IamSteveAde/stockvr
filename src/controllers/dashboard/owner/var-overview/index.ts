import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../../helpers/errorHandler/errorHandler";
import { getBusinessIdFromRequest, validateDTO } from "../../../../helpers/util";
import { getMetrics } from "./util";
import { success } from "../../../../helpers/errorHandler/statusCodes";
import { BaseDTO } from "../metrics/util";

export async function VarOverviewController(req: Request, res: Response, next: NextFunction) {
    try {
        const bus = getBusinessIdFromRequest(req)

        const dto = await validateDTO(BaseDTO, {businessUid: bus.busId})

        success(res, await getMetrics(dto), "Fetched")
    } catch (error) {
        next(new InternalError(error))
    }
}