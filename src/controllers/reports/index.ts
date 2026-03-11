import { Router } from "express";
import { GetOverViewListController } from "./overview/list";
import { validateJwtToken } from "../../helpers/middleware/validateJwtToken";
import { VarianceAlertController } from "./variance-alerts";
import { ShiftContextController } from "./shift-context";

export const reportRouter = Router()

reportRouter.use(validateJwtToken)

reportRouter.get("/overview", GetOverViewListController)
reportRouter.get("/variance-alerts", VarianceAlertController)
reportRouter.get("/shift-context", ShiftContextController)