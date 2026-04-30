import { Router } from "express";
import { AddProductController } from "./add";
import { validateToken } from "../../auth/verify/util";
import { validateJwtToken } from "../../../helpers/middleware/validateJwtToken";
import { ListProductController } from "./list";
import { ChangeStatusController } from "./archive";
import { LogStockEntryController } from "../entry";
import { UpdateProductDetailController } from "./update";

export const productRouter = Router();

productRouter.use(validateJwtToken)

productRouter.post("/create", AddProductController) // for owner
productRouter.put("/update", UpdateProductDetailController)
// productRouter.put("/archive", UpdateProductDetailController) // for owner

productRouter.get("/list", ListProductController)
productRouter.post("/status/update", ChangeStatusController) //for owner
productRouter.post("/entry", LogStockEntryController)





// AddProductController