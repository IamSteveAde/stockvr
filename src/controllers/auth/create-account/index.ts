import { Request, Response, NextFunction } from "express"
import { InternalError } from "../../../helpers/errorHandler/errorHandler"
import { validateDTO } from "../../../helpers/util"
import { AccountDTO, createUserRecord, validateExistence } from "./util"
import { success } from "../../../helpers/errorHandler/statusCodes"

export async function CreateAccountController(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = await validateDTO(AccountDTO, req.body)
        await validateExistence(dto);
        await createUserRecord(dto)

        success(res, {}, "Account created, Kindly verify mail")


    } catch (error) {
        next(new InternalError(error))
    }

}