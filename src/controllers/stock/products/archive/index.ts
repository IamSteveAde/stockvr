import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../../helpers/errorHandler/errorHandler";
import { getBusinessIdFromRequest, getProfileUidFromRequest, validateDTO } from "../../../../helpers/util";
import { ArchiveDTO, changeProductStatus, getProductRecord } from "./util";
import { success } from "../../../../helpers/errorHandler/statusCodes";
import { addTrail } from "../../../audit-trail/add/util";

export async function ChangeStatusController(req: Request, res: Response, next: NextFunction) {
    try {

        const bus = getBusinessIdFromRequest(req)
        const dto = await validateDTO(ArchiveDTO, { ...req.body, businessUid: bus.busId })

        const product = await getProductRecord(dto)

        await changeProductStatus(dto)

        success(res, {}, "Product state changed.")

        await addTrail({
            businessUid: product.businessUid,
            staffUid: getProfileUidFromRequest(req),
            action: `Product Archive`,
            entity: "Product",
            productUid: product.uid,
            // shiftUid: shift.uid,
            detail: `Product, ${product.name}, status update: ${dto.status}`,
        })


    } catch (error) {
        next(new InternalError(error))
    }
}