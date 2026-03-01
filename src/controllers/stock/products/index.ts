import { Router } from "express";
import { AddProductController } from "./add";
import { validateToken } from "../../auth/verify/util";
import { validateJwtToken } from "../../../helpers/middleware/validateJwtToken";
import { ListProductController } from "./list";
import { ChangeStatusController } from "./archive";

export const productRouter = Router();

productRouter.use(validateJwtToken)

productRouter.post("/create", AddProductController)
productRouter.get("/list", ListProductController)
productRouter.post("/status/update", ChangeStatusController)



// AddProductController