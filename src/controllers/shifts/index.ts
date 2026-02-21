import { Router } from "express";
import { CreateShiftController } from "./create";
import { validateJwtToken } from "../../helpers/middleware/validateJwtToken";


export const shiftRouter = Router()

shiftRouter.use(validateJwtToken)

shiftRouter.post("/create", CreateShiftController)

// shift

// shiftRouter.get("/list", CreateShiftController)