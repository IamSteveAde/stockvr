import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { validateDTO } from "../../../helpers/util";
import { getBusinesses, getBusinessesDAO, RestaurantDTO } from "./util";
import { success } from "../../../helpers/errorHandler/statusCodes";

export async function GetBusinessController(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = await validateDTO(RestaurantDTO, req.query)

        const business = await getBusinesses(dto)
        
        success(res, getBusinessesDAO(business))
    } catch (error) {
        next(new InternalError(error))
    }
}
