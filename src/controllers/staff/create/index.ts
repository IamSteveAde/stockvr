import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { getBusinessIdFromRequest, getProfileUidFromRequest, sendMail, validateDTO } from "../../../helpers/util";
import { success } from "../../../helpers/errorHandler/statusCodes";
import { CreateStaffDTO, createStaff, getBusinessProfile, staffInviteHTML } from "./util";
import util from "util"
import { SECRETS } from "../../../helpers/util/secrets";
export async function CreateStaffController(req: Request, res: Response, next: NextFunction) {
    try {

        const business = getBusinessIdFromRequest(req)

        const dto = await validateDTO(CreateStaffDTO, { ...req.body, businessUid: business.busId });

        const business_  = await getBusinessProfile(business.busId)

        const staff = await createStaff(dto);

        success(res, { }, "Staff member created successfully");


        const html = util.format( staffInviteHTML, dto.name,business_?.name,dto.email,staff.pin,SECRETS.FRONTEND_URL+"/auth/login",SECRETS.SUPPORT_MAIL, SECRETS.SUPPORT_MAIL)
        await sendMail({
            to: dto.email,
            subject: "Your Staff Login PIN",
            // html: `<p>Hello ${dto.name},</p><p>Your login PIN is: <b>${staff.pin}</b></p>`
            html
        });
    } catch (error) {
        console.error("Error in CreateStaffController:", error);
        next(new InternalError(error));
    }
}

