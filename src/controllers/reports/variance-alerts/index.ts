
import {
    Request, Response, NextFunction
} from "express";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { getBusinessIdFromRequest, validateDTO } from "../../../helpers/util";
import { getVarianceAlerts, getVarianceAlertsDAO, VarianceAlertDTO } from "./util";
import { success } from "../../../helpers/errorHandler/statusCodes";


export async function VarianceAlertController(req: Request, res: Response, next: NextFunction){
    try{

        const bus = getBusinessIdFromRequest(req)

        const dto = await validateDTO(VarianceAlertDTO, {...req.query, businessUid: bus.busId})

        const data = await getVarianceAlerts(dto)
        
        
        success(res, getVarianceAlertsDAO(data), "Fetched")


    }catch(error){
        next(new InternalError(error))
    }
}