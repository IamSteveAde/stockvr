import { Request, Response, NextFunction } from "express";
import { getProfileUidFromRequest, validateDTO } from "../../../../helpers/util";
import { GetStaffMetric, StaffMetricDTO } from "./util";
import { success } from "../../../../helpers/errorHandler/statusCodes";

export async function StaffMetricsController(req: Request, res: Response, next: NextFunction) {
    try {
        const profileUid = getProfileUidFromRequest(req)

        const dto = await validateDTO(StaffMetricDTO, { ...req.query, profileUid })

        const count = await GetStaffMetric(dto)

        success(res, { type: dto.type, count }, "Fetched")

    } catch (error) {

    }
}