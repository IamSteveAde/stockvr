import {Request, Response, NextFunction} from "express";
import { InternalError } from "../../../../helpers/errorHandler/errorHandler";
import { getBusinessIdFromRequest, validateDTO } from "../../../../helpers/util";
import { ArchiveDTO, changeProductStatus, getProductRecord } from "./util";
import { success } from "../../../../helpers/errorHandler/statusCodes";

export async function ChangeStatusController (req: Request, res: Response, next: NextFunction){
    try {

        const bus =  getBusinessIdFromRequest(req)
        const dto = await validateDTO(ArchiveDTO, {...req.body, businessUid: bus.busId})

        await getProductRecord(dto)        

        await changeProductStatus(dto)

        success(res, {}, "Product state changed.")


    }catch(error){
        next( new InternalError(error))
    }
}