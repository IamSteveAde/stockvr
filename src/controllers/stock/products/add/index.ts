import { Request, Response, NextFunction } from "express";
import { getBusinessIdFromRequest, getProfileUidFromRequest, validateDTO } from "../../../../helpers/util";
import { AddPRoductDto, addProductRecord, getProductDao } from "./util";
import { success } from "../../../../helpers/errorHandler/statusCodes";
import { InternalError } from "../../../../helpers/errorHandler/errorHandler";
import { addTrail } from "../../../audit-trail/add/util";

export async function AddProductController(req: Request, res: Response, next: NextFunction) {
    try {

        const business = getBusinessIdFromRequest(req)
        const dto = await validateDTO(AddPRoductDto, {...req.body, businessUid: business.busId});
        

        const product = await addProductRecord(dto)

        const d = getProductDao(product)
        
        success(res, d, "Product created successfully");

        await addTrail({
                            businessUid: product.businessUid,
                            staffUid: getProfileUidFromRequest(req),
                            action: "Product created",
                            entity: "Product",
                            productUid: product.uid,
                            // shiftUid: shift.uid,
                            detail: `New product added: ${product.name}`,
                        })
    } catch (error) {
        next(new InternalError(error));
    }
}