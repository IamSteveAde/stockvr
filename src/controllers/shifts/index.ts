import { Router } from "express";
import { CreateShiftController } from "./create";


export const shiftRouter = Router()

shiftRouter.post("/create", CreateShiftController)

// shift

// shiftRouter.get("/list", CreateShiftController)