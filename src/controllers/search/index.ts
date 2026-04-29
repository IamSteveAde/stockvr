import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../helpers/errorHandler/errorHandler";
import { getBusinessIdFromRequest, validateDTO } from "../../helpers/util";
import { getSearchOutputs, GetSearchSchema } from "./util";
import { success } from "../../helpers/errorHandler/statusCodes";

export async function SearchController(req: Request, res: Response, next: NextFunction) {
    try {
        const bus = getBusinessIdFromRequest(req)

        

        const dto = await validateDTO(GetSearchSchema, {...req.query, businessUid: bus.busId})
        
        const d = await getSearchOutputs(dto)

        success(res, {results: d[0], meta: d[1]}, "Fetched.")


    } catch (error) {
        next(new InternalError(error))
    }
}