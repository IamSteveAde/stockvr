import { CreateStaffController } from "./create";



import { Router } from "express";
import { validateJwtToken } from "../../helpers/middleware/validateJwtToken";




export const staffRouter = Router()

staffRouter.use(validateJwtToken) // Apply JWT validation to all staff routes

staffRouter.post("/create", CreateStaffController)
// staffRouter.put("/me", UpdateUserProfileController)