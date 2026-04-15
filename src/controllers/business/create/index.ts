import { Response, Request, NextFunction } from "express"
import { InternalError } from "../../../helpers/errorHandler/errorHandler"
import { getProfileUidFromRequest, validateDTO } from "../../../helpers/util"
import { CreateBusinessProfileDTO, updateFirstTimeLogin } from "../../profile/create-profile/util"
import { checkBusinessExists, createBusinessProfile } from "./util"
import { success } from "../../../helpers/errorHandler/statusCodes"
import { createJwtToken } from "../../auth/sign-in/util"
import { PERMISSIONS } from "../../../helpers/accessTypes"

export async function CreateBusinessController(req: Request, res: Response, next: NextFunction) {
    try {

        const profileUid = getProfileUidFromRequest(req)

        const dto = await validateDTO(CreateBusinessProfileDTO, { ...req.body, userUid: profileUid })

        await checkBusinessExists(dto)

        const business = await createBusinessProfile(dto)

        const token = createJwtToken({
            accessType: "owner",
            permissions: PERMISSIONS["owner"],
            userProfileUid: profileUid,
            businessUid: business?.uid
        });

        await updateFirstTimeLogin(profileUid, business)

        // return new token here.

        success(res, {token}, "Business profile successfully updated.")
        return

    } catch (error) {

        console.log(error)

        next(new InternalError(error))
    }
}