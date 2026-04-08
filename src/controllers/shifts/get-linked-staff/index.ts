import {Request, Response, NextFunction} from "express"
import { InternalError } from "../../../helpers/errorHandler/errorHandler"
import { validateDTO } from "../../../helpers/util"
import { getLinkedStaffDto, getLinkedStaffRecords, getLinkedStaffRecordsDAO } from "./util"
import { success } from "../../../helpers/errorHandler/statusCodes"

export async function GetShiftLinkedStaffController (req: Request, res: Response, next: NextFunction){
    try{

        const dto = await validateDTO(getLinkedStaffDto, req.query)
        
        const data = await getLinkedStaffRecords(dto)

        success(res,  getLinkedStaffRecordsDAO(data), "Fetched")
        
        
    }catch(error){
        next (new InternalError(error))
    }
}