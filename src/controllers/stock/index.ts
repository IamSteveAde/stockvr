import { Router } from "express";
import { productRouter } from "./products";
import { inventoryRouter } from "./inventory";
import { LogStockEntryController } from "./entry";
import { validateJwtToken } from "../../helpers/middleware/validateJwtToken";

export const stockRouter = Router();

stockRouter.use("/product", productRouter)
stockRouter.use("/inventory", inventoryRouter)
stockRouter.post("/logEntry", validateJwtToken, LogStockEntryController)