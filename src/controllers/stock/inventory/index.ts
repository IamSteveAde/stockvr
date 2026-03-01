import { Router } from "express";

import { validateToken } from "../../auth/verify/util";
import { validateJwtToken } from "../../../helpers/middleware/validateJwtToken";
import { ListProductController } from "../products/list";
import { AdjustInventoryController } from "./adjust";

export const inventoryRouter = Router();

inventoryRouter.use(validateJwtToken)

// inventoryRouter.post("/create", AddinventoryController)
inventoryRouter.get("/list", ListProductController)
inventoryRouter.post("/adjust", AdjustInventoryController)

