
import {
    Request, Response, NextFunction
} from "express";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { getBusinessIdFromRequest, validateDTO } from "../../../helpers/util";
// import { getVarianceAlerts, getVarianceAlertsDAO, VarianceAlertDTO } from "./util";
import { success } from "../../../helpers/errorHandler/statusCodes";
import { getProductVarianceRecords, getProductVarianceRecordsDAO, ProductVariancetDTO } from "./util";


export async function ProductVarianceController(req: Request, res: Response, next: NextFunction){
    try{

        const bus = getBusinessIdFromRequest(req)

        const dto = await validateDTO(ProductVariancetDTO, {...req.query, businessUid: bus.busId})

        const data = await getProductVarianceRecords(dto)
        
        
        success(res, getProductVarianceRecordsDAO(data), "Fetched")


    }catch(error){
        next(new InternalError(error))
    }
}