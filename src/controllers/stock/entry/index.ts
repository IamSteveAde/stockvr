import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { getProfileUidFromRequest, validateDTO } from "../../../helpers/util";
import { getShift, getStockInventory, logStockEntry, StockEntryDTO } from "./util";
import { success } from "../../../helpers/errorHandler/statusCodes";
import { ACTIONS_KEY, addTrail } from "../../audit-trail/add/util";

export async function LogStockEntryController(req: Request, res: Response, next: NextFunction) {
    try {
        const staffUid = getProfileUidFromRequest(req)
        const dto = await  validateDTO(StockEntryDTO, {...req.body, staffUid})

        // console.log(dto)

        const shift = await getShift({staffUid, shiftUid: dto.shiftUid})

        const inventory = await getStockInventory(dto.inventoryUid)

        await logStockEntry(dto, shift)

        success(res, {}, "Entry logged.")

        await addTrail({
                    businessUid: shift.businessUid,
                    staffUid: staffUid,
                    action: dto.action,
                    entity: "Product",
                    productUid: inventory.productUid,
                    shiftUid: shift.uid,
                    detail: ` ${dto.action == ACTIONS_KEY.stockIn ? `Stock added (+${dto.quantity})` : `Stock removed (-${dto.quantity})`}`,
                })
    
    } catch (error) {
        next(new InternalError(error))
    }
}