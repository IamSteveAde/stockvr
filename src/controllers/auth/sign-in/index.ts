import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { validateDTO } from "../../../helpers/util";
import { SignInDTO, fetchUserByEmail, validateUserPassword, getUserAccess, createJwtToken } from "./util";
import { success } from "../../../helpers/errorHandler/statusCodes";

export async function SignInController(req: Request, res: Response, next: NextFunction) {
    try {
        const dto = await validateDTO(SignInDTO, req.body);
        const user = await fetchUserByEmail(dto.email);

        await validateUserPassword(dto.password, user.password);

        const { accessType, permissions } = getUserAccess(user);
        const token = createJwtToken({
            accessType,
            permissions,
            userProfileUid: user.userProfiles!.uid
        });
        success(res, { token, accessType, permissions }, "Sign in successful");
    } catch (error) {
        next(new InternalError(error));
    }
}
