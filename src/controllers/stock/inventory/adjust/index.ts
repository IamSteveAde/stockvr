import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../../helpers/errorHandler/errorHandler";
import { getProductRecord } from "../../products/archive/util";
import { getBusinessIdFromRequest, getProfileUidFromRequest, validateDTO } from "../../../../helpers/util";
import { adjustInventory, AdjustInventoryDTO } from "./util";
import { success } from "../../../../helpers/errorHandler/statusCodes";
import { ACTIONS_KEY, addTrail } from "../../../audit-trail/add/util";

export async function AdjustInventoryController(req: Request, res: Response, next: NextFunction) {
    try {
        const bus = getBusinessIdFromRequest(req)
        const staffUid = getProfileUidFromRequest(req)

        const dto = await validateDTO(AdjustInventoryDTO, { ...req.body, businessUid: bus.busId })

        const product = await getProductRecord(dto)

        await adjustInventory(dto, product)

        success(res, {}, "Inventory updated.")

        await addTrail({
            businessUid: bus.busId,
            staffUid: staffUid,
            action: ACTIONS_KEY.inventoryAdjusted,
            entity: "Inventory",
            productUid: product.uid,
            detail: ` ${dto.action == "add" ? `Inventory increased (+${dto.quantity})` : `Inventory decreased (-${dto.quantity})`}`,
        })

    } catch (error) {
        next(new InternalError(error))
    }
}