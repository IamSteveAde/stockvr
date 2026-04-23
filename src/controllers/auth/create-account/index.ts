import { Request, Response, NextFunction } from "express"
import { InternalError } from "../../../helpers/errorHandler/errorHandler"
import { sendMail, validateDTO } from "../../../helpers/util"
import { AccountDTO, createUserRecord, generateVerificationLink, templateHTMl, validateExistence } from "./util"
import { success } from "../../../helpers/errorHandler/statusCodes"
import util from "util";

export async function CreateAccountController(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = await validateDTO(AccountDTO, req.body)
        await validateExistence(dto);
        const user = await createUserRecord(dto)

        success(res, {}, "Account created, Kindly verify mail")

        const link = generateVerificationLink(user.uid)
        const html  = util.format(templateHTMl, dto.fullName, link, link )
// name,confirmationLink,confirmationLink
        await sendMail(
            {
                to: dto.email,
                subject: "New Account Verification",
                // html: `<p>Hey there,</p><p>Kindly verify your account using this link below: <b>${link}</b></p>`
                html
            }
        )

    } catch (error) {
        console.log("error => ",error)

        next(new InternalError(error))
    }

}