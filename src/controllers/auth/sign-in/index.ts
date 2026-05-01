import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { sendMail, validateDTO } from "../../../helpers/util";
import { SignInDTO, fetchUserByEmail, validateUserPassword, getUserAccess, createJwtToken, getFirstLoginStatus } from "./util";
import { success } from "../../../helpers/errorHandler/statusCodes";
import { getSubscriptionForBusiness } from "../../subscriptions/find-subscription/util";
import { generateVerificationLink, templateHTMl } from "../create-account/util";
import util from "util";

export async function SignInController(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = await validateDTO(SignInDTO, req.body);
        const user = await fetchUserByEmail(dto.email);

        await validateUserPassword(dto.password, user.password);

        if (!user.verified) {
            const link = generateVerificationLink(user.uid)
            const html = util.format(templateHTMl, dto.fullName, link, link)
            // name,confirmationLink,confirmationLink
            await sendMail(
                {
                    to: dto.email,
                    subject: "New Account Verification",
                    // html: `<p>Hey there,</p><p>Kindly verify your account using this link below: <b>${link}</b></p>`
                    html
                }
            )
        }

        const { accessType, permissions } = getUserAccess(user);
        let subscription
        if (user.userProfiles?.businessUid) {
            subscription = await getSubscriptionForBusiness(user.userProfiles!.businessUid);
        }

        const token = createJwtToken({
            accessType,
            permissions,
            userProfileUid: user.userProfiles!.uid,
            businessUid: user?.userProfiles?.business?.uid
        });

        const d = getFirstLoginStatus(user)
        success(res, { token, accessType, proceedToProfileCreation: d.proceedToProfileCreation, isFirstLogin: d.isFirstLogin, isVerified: user.verified, subscription }, "Sign in successful");
    } catch (error) {
        next(new InternalError(error));
    }
}


// add BusinessProfile if user is BusinessOwner