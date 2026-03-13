import { Request, Response, NextFunction } from "express";
import { validateDTO } from "../../../helpers/util";
import { GetUserMetric, UserMetricDTO } from "./util";
import { success } from "../../../helpers/errorHandler/statusCodes";

export async function UsersMetricsController(req: Request, res: Response, next: NextFunction) {
    try {

        const dto = await validateDTO(UserMetricDTO, { ...req.query })

        const count = await GetUserMetric(dto)

        success(res, { type: dto.type, count }, "Fetched")

    } catch (error) {

    }
}