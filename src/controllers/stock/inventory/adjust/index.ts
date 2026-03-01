import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../../helpers/errorHandler/errorHandler";
import { getProductRecord } from "../../products/archive/util";
import { getBusinessIdFromRequest, validateDTO } from "../../../../helpers/util";
import { adjustInventory, AdjustInventoryDTO } from "./util";
import { success } from "../../../../helpers/errorHandler/statusCodes";

export async function AdjustInventoryController(req: Request, res: Response, next: NextFunction) {
    try {
        const bus = getBusinessIdFromRequest(req)

        const dto = await validateDTO(AdjustInventoryDTO, {...req.body, businessUid: bus.busId})

        const product = await getProductRecord(dto)

        await adjustInventory(dto, product)

        success(res, {}, "Inventory updated.")

    } catch (error) {
        next(new InternalError(error))
    }
}