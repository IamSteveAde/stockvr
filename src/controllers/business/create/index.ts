import { Response, Request, NextFunction } from "express"
import { InternalError } from "../../../helpers/errorHandler/errorHandler"
import { getProfileUidFromRequest, validateDTO } from "../../../helpers/util"
import { CreateBusinessProfileDTO, updateFirstTimeLogin } from "../../profile/create-profile/util"
import { checkBusinessExists, createBusinessProfile } from "./util"
import { success } from "../../../helpers/errorHandler/statusCodes"

export async function CreateBusinessController(req: Request, res: Response, next: NextFunction) {
    try {

        // console.log("req.body --->", req.body)
        const profileUid = getProfileUidFromRequest(req)

        const dto = await validateDTO(CreateBusinessProfileDTO, { ...req.body, userUid: profileUid })

        await checkBusinessExists(dto)

        const business = await createBusinessProfile(dto)

        await updateFirstTimeLogin(profileUid, business)

        success(res, {}, "Business profile successfully updated.")
        return 

    } catch (error) {
        next(new InternalError(error))
    }
}