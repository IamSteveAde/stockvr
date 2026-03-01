import { Router } from "express";
import { productRouter } from "./products";
import { inventoryRouter } from "./inventory";

export const stockRouter = Router();

stockRouter.use("/product", productRouter)
stockRouter.use("/inventory", inventoryRouter)