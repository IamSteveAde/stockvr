import { CreateStaffController } from "./create";



import { Router } from "express";
import { validateJwtToken } from "../../helpers/middleware/validateJwtToken";
import { ListStaffController } from "./list";
import { DeleteStaffController } from "./delete";




export const staffRouter = Router()

staffRouter.use(validateJwtToken) // Apply JWT validation to all staff routes

staffRouter.post("/create", CreateStaffController)
staffRouter.get("/list", ListStaffController)
staffRouter.post("/delete", DeleteStaffController)
