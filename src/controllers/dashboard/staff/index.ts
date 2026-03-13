import { StaffMetricsController } from "./metrics";



import { Router } from "express";
import { validateJwtToken } from "../../../helpers/middleware/validateJwtToken";

export const staffdashboardRouter = Router();
staffdashboardRouter.use(validateJwtToken)

staffdashboardRouter.get("/metric", StaffMetricsController)