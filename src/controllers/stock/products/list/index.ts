import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../../helpers/errorHandler/errorHandler";
import { getBusinessIdFromRequest, validateDTO } from "../../../../helpers/util";
import { getProductsDao, getProductsRecords, ListProductDTO } from "./util";
import { success } from "../../../../helpers/errorHandler/statusCodes";

export async function ListProductController(req: Request, res: Response, next: NextFunction) {
    try {
        const bus =  getBusinessIdFromRequest(req)

        // console.log("bussss=> ", bus)

        const dto = await validateDTO(ListProductDTO, {...req.query, businessUid: bus.busId})

        const products_ = await getProductsRecords(dto)

        const products = getProductsDao(products_)

        success(res, products, "Fetched")

    } catch (error) {
        next(new InternalError(error))
    }
}