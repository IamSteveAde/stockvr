
import {
    Request, Response, NextFunction
} from "express";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { getBusinessIdFromRequest, validateDTO } from "../../../helpers/util";
// import { getVarianceAlerts, getVarianceAlertsDAO, VarianceAlertDTO } from "./util";
import { success } from "../../../helpers/errorHandler/statusCodes";
import { getShiftContextRecordsDAO, getShiftVarianceRecords, ShiftContextDTO } from "./util";


export async function ShiftContextController(req: Request, res: Response, next: NextFunction){
    try{

        const bus = getBusinessIdFromRequest(req)

        const dto = await validateDTO(ShiftContextDTO, {...req.query, businessUid: bus.busId})

        const data = await getShiftVarianceRecords(dto)
        
        
        success(res, getShiftContextRecordsDAO(data), "Fetched")


    }catch(error){
        next(new InternalError(error))
    }
}