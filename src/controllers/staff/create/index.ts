import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { getProfileUidFromRequest, sendMail, validateDTO } from "../../../helpers/util";
import { success } from "../../../helpers/errorHandler/statusCodes";
import { CreateStaffDTO, createStaff } from "./util";

export async function CreateStaffController(req: Request, res: Response, next: NextFunction) {
    try {

        const profileUid = getProfileUidFromRequest(req)

        const dto = await validateDTO(CreateStaffDTO, { ...req.body, profileUid });
        const staff = await createStaff(dto);

        success(res, { }, "Staff member created successfully");
        await sendMail({
            to: dto.email,
            subject: "Your Staff Login PIN",
            html: `<p>Hello ${dto.name},</p><p>Your login PIN is: <b>${staff.pin}</b></p>`
        });
    } catch (error) {
        console.error("Error in CreateStaffController:", error);
        next(new InternalError(error));
    }
}


// todo structured flow staff is to be linked to businesses, owner logs in as a business and permissions are granted at owner level figure it out tomorrow.

