



import { Router } from "express";
import { MetricController } from "./metrics";
import { validateJwtToken } from "../../../helpers/middleware/validateJwtToken";
import { VarOverviewController } from "./var-overview";
import { VARsummaryController } from "./variance-summary";

export const ownerRouter = Router();
ownerRouter.use(validateJwtToken)

ownerRouter.use("/metric", MetricController)
ownerRouter.use("/var-summary", VarOverviewController)
ownerRouter.use("/var-overview", VARsummaryController)



