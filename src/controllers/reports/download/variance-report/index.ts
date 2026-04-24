import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../../helpers/errorHandler/errorHandler";
import { getBusinessIdFromRequest, validateDTO } from "../../../../helpers/util";
import { getBusinessProductsInventoryUids, getVarianceAggregateByProduct, siftFetched, VarianceReportSchema } from "./util";

import { jsonToPdf } from "../inventory-report/util";

export async function downloadVarianceReport(req: Request, res: Response, next: NextFunction){
    try{
        const bus = getBusinessIdFromRequest(req)

        const dto = await validateDTO(VarianceReportSchema, {...req.query, businessUid: bus.busId})

        const inventoryItems = await getBusinessProductsInventoryUids(bus.busId)

        const aggregates = await getVarianceAggregateByProduct(dto, inventoryItems.items)

        const d = siftFetched(inventoryItems.inventory, aggregates)

        const columns = ["S/N", "Name", "Expected", "Actual", "Variance", "Unit"]

        jsonToPdf(`StockVAR-Variance Report`, "StockVAR - Variance Report", d, columns, res)

        // success(res, d, "working")

    }catch(error){  
        next(new InternalError(error))
    }
}