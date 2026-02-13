import { Router } from "express";
import { GetUserProfileController } from "./get-profile";
import { validateJwtToken } from "../../helpers/middleware/validateJwtToken";
import { UpdateUserProfileController } from "./update";



export const profileRouter = Router()

profileRouter.use(validateJwtToken) // Apply JWT validation to all profile routes

profileRouter.get("/me", GetUserProfileController)
profileRouter.put("/me", UpdateUserProfileController)