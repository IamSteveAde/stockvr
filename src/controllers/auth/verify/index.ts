import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { validateDTO } from "../../../helpers/util";
import { setUserIdVerified, validateToken, VerifyDTO } from "./util";
import { redirect } from "../../../helpers/errorHandler/statusCodes";
import { SECRETS } from "../../../helpers/util/secrets";


export async function VerifyController(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = await validateDTO(VerifyDTO, req.query)

        const payload = validateToken(dto)

        await setUserIdVerified(payload.userProfileUid)

        redirect(res, `${SECRETS.FRONTEND_URL}/auth/login`)
        

    } catch (error) {
        next(new InternalError(error))
    }
}