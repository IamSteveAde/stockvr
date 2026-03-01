import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { getBusinessIdFromRequest, validateDTO } from "../../../helpers/util";
import { listAuditTrailDAO, ListAuditTrailDTO, listAuditTrails } from "./util";
import { success } from "../../../helpers/errorHandler/statusCodes";

export async function ListAuditTrailController(req: Request, res: Response, next: NextFunction) {
    try {

        const bus = getBusinessIdFromRequest(req)

        const dto = await validateDTO(ListAuditTrailDTO, {...req.query, businessUid: bus.busId})

        const records = await listAuditTrails(dto)

        const d = listAuditTrailDAO(records)

        success(res, d, "Fetched.")


    } catch (error) {
        next(new InternalError(error))
    }
}