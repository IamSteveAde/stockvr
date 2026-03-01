import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { getProfileUidFromRequest, validateDTO } from "../../../helpers/util";
import { getShift, getStockInventory, logStockEntry, StockEntryDTO } from "./util";
import { success } from "../../../helpers/errorHandler/statusCodes";

export async function LogStockEntryController(req: Request, res: Response, next: NextFunction) {
    try {
        const staffUid = getProfileUidFromRequest(req)
        const dto = await  validateDTO(StockEntryDTO, {...req.body, staffUid})

        const shift = await getShift({staffUid, shiftUid: dto.shiftUid})

        const inventory = await getStockInventory(dto.inventoryUid)
        
        await logStockEntry(dto, shift)

        success(res, {}, "Entry logged.")
    
    } catch (error) {
        next(new InternalError(error))
    }
}