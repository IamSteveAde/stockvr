import { Request, Response, NextFunction } from "express";
import { getProfileUidFromRequest, validateDTO } from "../../../../helpers/util";
import { GetSubscriptionMetric, SubscriptionMetricDTO } from "./util";
import { success } from "../../../../helpers/errorHandler/statusCodes";

export async function SubscriptionMetricsController(req: Request, res: Response, next: NextFunction) {
    try {
        // const profileUid = getProfileUidFromRequest(req)

        const dto = await validateDTO(SubscriptionMetricDTO, { ...req.query })

        const count = await GetSubscriptionMetric(dto)

        success(res, { type: dto.type, count }, "Fetched")

    } catch (error) {

    }
}