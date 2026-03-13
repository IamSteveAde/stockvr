import { Router } from "express";
import { ownerRouter } from "./owner";
import { validateJwtToken } from "../../helpers/middleware/validateJwtToken";
import { staffdashboardRouter } from "./staff";

export const dashboardRouter = Router();

dashboardRouter.use("/base", ownerRouter)
dashboardRouter.use("/staff", staffdashboardRouter)


// StaffMetricsController