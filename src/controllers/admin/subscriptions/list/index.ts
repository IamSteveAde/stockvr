import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../../helpers/errorHandler/errorHandler";
import { validateDTO } from "../../../../helpers/util";
import {  GetSubscriptionDTO, getSubscriptions, getSubscriptionsDAO } from "./util";
import { success } from "../../../../helpers/errorHandler/statusCodes";

export async function GetSubscriptionsController(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = await validateDTO(GetSubscriptionDTO, req.query)

        const subscriptions = await getSubscriptions(dto)
        
        success(res, getSubscriptionsDAO(subscriptions))
    } catch (error) {
        next(new InternalError(error))
    }
}
