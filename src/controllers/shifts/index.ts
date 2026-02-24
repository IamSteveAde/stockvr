import { Router } from "express";
import { CreateShiftController } from "./create";
import { validateJwtToken } from "../../helpers/middleware/validateJwtToken";
import { ListShiftsController } from "./list";


export const shiftRouter = Router()

shiftRouter.use(validateJwtToken)

shiftRouter.post("/create", CreateShiftController)

shiftRouter.get("/list", ListShiftsController)