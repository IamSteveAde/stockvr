import { Request, Response, NextFunction } from "express"
import { InternalError } from "../../../helpers/errorHandler/errorHandler"
import { sendMail, validateDTO } from "../../../helpers/util"
import { AccountDTO, createUserRecord, generateRVerificationLink, validateExistence } from "./util"
import { success } from "../../../helpers/errorHandler/statusCodes"

export async function CreateAccountController(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = await validateDTO(AccountDTO, req.body)
        await validateExistence(dto);
        const user = await createUserRecord(dto)

        success(res, {}, "Account created, Kindly verify mail")

        const link = generateRVerificationLink(user.uid)

        await sendMail(
            {
                to: dto.email,
                subject: "Your Staff Login PIN",
                html: `<p>Hey there,</p><p>Kindly verify your account using this link below: <b>${link}</b></p>`
            }
        )

    } catch (error) {
        console.log("error => ",error)

        next(new InternalError(error))
    }

}