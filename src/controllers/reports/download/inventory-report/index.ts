import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../../helpers/errorHandler/errorHandler";
import { getAllProducts, jsonToPdf } from "./util";
import { getBusinessIdFromRequest } from "../../../../helpers/util";
import { generalError } from "../../../../helpers/errorHandler/statusCodes";


export async function downloadInventoryReport(req: Request, res: Response, next: NextFunction) {
    try {

        const bus = getBusinessIdFromRequest(req)
        const p = await getAllProducts(bus.busId)

        if (p.length < 1) {
            generalError(res, "No products found")

            return
        }

        const columns = ["S/N", "Name", "Quantity", "Unit"]
        const tableData = p.map((data, index) => [index+1, data.name, data.quantity, data.unit])

        jsonToPdf(`StockVAR-Inventory Report`, "StockVAR - Inventory Report", tableData, columns, res)


    } catch (error) {
        next(new InternalError(Error))
    }
}