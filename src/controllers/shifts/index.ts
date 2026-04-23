import { Router } from "express";
import { CreateShiftController } from "./create";
import { validateBusinessManagerPermission, validateJwtToken } from "../../helpers/middleware/validateJwtToken";
import { ListShiftsController } from "./list";
import { StartShiftController } from "./start";
import { EndShiftController } from "./end";
import { ListStaffRecentShiftController } from "./list-recent";
import { GetShiftLinkedStaffController } from "./get-linked-staff";
import { DeleteShiftController } from "./delete-shift";
import { ListUniqueShifts } from "./list-unique-shifts";


export const shiftRouter = Router()

shiftRouter.use(validateJwtToken)

shiftRouter.post("/create", CreateShiftController)

shiftRouter.get("/list", ListShiftsController)

shiftRouter.post("/start", StartShiftController)

shiftRouter.post("/end", EndShiftController)

shiftRouter.get("/list/:type", ListStaffRecentShiftController)

shiftRouter.get("/unique/list", validateBusinessManagerPermission, ListUniqueShifts)


shiftRouter.get("/linked-staff", GetShiftLinkedStaffController)

shiftRouter.post("/delete", validateBusinessManagerPermission, DeleteShiftController)





