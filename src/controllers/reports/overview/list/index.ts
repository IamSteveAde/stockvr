
import {
    Request, Response, NextFunction
} from "express";
import { InternalError } from "../../../../helpers/errorHandler/errorHandler";
import { getBusinessIdFromRequest, validateDTO } from "../../../../helpers/util";
import { getData, OverviewListDTO } from "./util";
import { success } from "../../../../helpers/errorHandler/statusCodes";


export async function GetOverViewListController(req: Request, res: Response, next: NextFunction){
    try{
        const business = getBusinessIdFromRequest(req)

        // console.log("bus ==> ", business)
        const dto = await validateDTO(OverviewListDTO, {...req.query, businessUid: business.busId})

        const data = await getData(dto)

        success(res, data, "fetched")


    }catch(error){
        console.log(error)
        next( new InternalError(error))
    }
}