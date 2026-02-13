import { Router } from "express";
import { CreateAccountController } from "./create-account";
import { SignInController } from "./sign-in";

export const authRouter = Router()

authRouter.post("/sign-up", CreateAccountController)
authRouter.post("/sign-in", SignInController)
authRouter.post("/reset", CreateAccountController)
