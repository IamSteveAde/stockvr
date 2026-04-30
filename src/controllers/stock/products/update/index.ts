import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../../helpers/errorHandler/errorHandler";
import { getBusinessIdFromRequest, getProfileUidFromRequest, validateDTO } from "../../../../helpers/util";
import { UpdateDTO, updateProductDetails, getProductRecord } from "./util";
import { success } from "../../../../helpers/errorHandler/statusCodes";
import { addTrail } from "../../../audit-trail/add/util";

export async function UpdateProductDetailController(req: Request, res: Response, next: NextFunction) {
    try {

        const bus = getBusinessIdFromRequest(req)

        console.log(req.body)
        const dto = await validateDTO(UpdateDTO, { ...req.body, businessUid: bus.busId })

        const product = await getProductRecord(dto)

        await updateProductDetails(dto)

        success(res, {}, "Product detail updated.")

        await addTrail({
            businessUid: product.businessUid,
            staffUid: getProfileUidFromRequest(req),
            action: `Product Update`,
            entity: "Product",
            productUid: product.uid,
            // shiftUid: shift.uid,
            detail: `Product detail updated; name: ${dto.name}, unit: ${dto.unit}`,
        })


    } catch (error) {
        next(new InternalError(error))
    }
}