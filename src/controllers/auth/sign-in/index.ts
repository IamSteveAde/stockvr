import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { validateDTO } from "../../../helpers/util";
import { SignInDTO, fetchUserByEmail, validateUserPassword, getUserAccess, createJwtToken, getFirstLoginStatus } from "./util";
import { success } from "../../../helpers/errorHandler/statusCodes";
import { getSubscriptionForBusiness } from "../../subscriptions/find-subscription/util";

export async function SignInController(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = await validateDTO(SignInDTO, req.body);
        const user = await fetchUserByEmail(dto.email);

        await validateUserPassword(dto.password, user.password);

        (user.verified)

        const { accessType, permissions } = getUserAccess(user);

        // if (user.userProfiles?.businessUid) {
        //     const subscription = await getSubscriptionForBusiness(user.userProfiles!.businessUid);
            
        // }

        const token = createJwtToken({
            accessType,
            permissions,
            userProfileUid: user.userProfiles!.uid,
            businessUid: user?.userProfiles?.business?.uid
        });

        const d = getFirstLoginStatus(user)
        success(res, { token, accessType, proceedToProfileCreation: d.proceedToProfileCreation, isFirstLogin: d.isFirstLogin }, "Sign in successful");
    } catch (error) {
        next(new InternalError(error));
    }
}


// add BusinessProfile if user is BusinessOwner