import { Router } from "express";
import { GetOverViewListController } from "./overview/list";
import { validateBusinessManagerPermission, validateJwtToken } from "../../helpers/middleware/validateJwtToken";
import { VarianceAlertController } from "./variance-alerts";
import { ShiftContextController } from "./shift-context";
import { ProductVarianceController } from "./product-variance";

export const reportRouter = Router()

reportRouter.use(validateJwtToken)
reportRouter.use(validateBusinessManagerPermission)



reportRouter.get("/overview", GetOverViewListController)
reportRouter.get("/variance-alerts", VarianceAlertController)
reportRouter.get("/shift-context", ShiftContextController)
reportRouter.get("/product-variance", ProductVarianceController)