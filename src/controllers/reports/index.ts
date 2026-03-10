import { Router } from "express";
import { GetOverViewListController } from "./overview/list";
import { validateJwtToken } from "../../helpers/middleware/validateJwtToken";

export const reportRouter = Router()

reportRouter.use(validateJwtToken)

reportRouter.get("/overview", GetOverViewListController)
