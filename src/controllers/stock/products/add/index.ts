import { Request, Response, NextFunction } from "express";
import { getBusinessIdFromRequest, validateDTO } from "../../../../helpers/util";
import { AddPRoductDto, addProductRecord, getProductDao } from "./util";
import { success } from "../../../../helpers/errorHandler/statusCodes";
import { InternalError } from "../../../../helpers/errorHandler/errorHandler";

export async function AddProductController(req: Request, res: Response, next: NextFunction) {
    try {

        const business = getBusinessIdFromRequest(req)
        const dto = await validateDTO(AddPRoductDto, {...req.body, businessUid: business.busId});
        

        const shift = await addProductRecord(dto)

        const d = getProductDao(shift)
        
        success(res, d, "Product created successfully");
    } catch (error) {
        next(new InternalError(error));
    }
}