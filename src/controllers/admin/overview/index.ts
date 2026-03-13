import { Request, Response, NextFunction } from "express"
import { InternalError } from "../../../helpers/errorHandler/errorHandler"
import { validateDTO } from "../../../helpers/util"
import { GetOverView, OverviewDTO } from "./util"
import { success } from "../../../helpers/errorHandler/statusCodes"

export async function OverviewController(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = await validateDTO(OverviewDTO, {...req.params})

        const  overview = await GetOverView(dto)

        success(res, {
            type: dto.type,
            count: overview
        })

    } catch (error) {
        next(new InternalError(error))
    }
}