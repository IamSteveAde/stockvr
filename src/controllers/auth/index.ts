import { Router } from "express";
import { CreateAccountController } from "./create-account";
import { SignInController } from "./sign-in";
import { ResetPasswordController } from "./reset-password";
import { SetNewPasswordController } from "./set-password";
import { validateJwtToken } from "../../helpers/middleware/validateJwtToken";
import { VerifyController } from "./verify";

export const authRouter = Router()

authRouter.post("/sign-up", CreateAccountController)
authRouter.post("/sign-in", SignInController)
authRouter.post("/reset", ResetPasswordController)
authRouter.post("/set-pwd", validateJwtToken, SetNewPasswordController)
authRouter.get("/verify", VerifyController)

