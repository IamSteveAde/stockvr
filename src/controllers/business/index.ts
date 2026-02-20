import { Router } from "express";
import { CreateBusinessController } from "./create";
import { validateJwtToken } from "../../helpers/middleware/validateJwtToken";

export const businessRouter = Router()

businessRouter.use(validateJwtToken)

businessRouter.post("/create", CreateBusinessController)