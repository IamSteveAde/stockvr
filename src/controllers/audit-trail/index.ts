import { Router } from "express";
import { ListAuditTrailController } from "./list";
import { validateJwtToken } from "../../helpers/middleware/validateJwtToken";

export const auditRouter = Router();

auditRouter.use(validateJwtToken)

auditRouter.get("/list", ListAuditTrailController)

