import { validateBusinessPermission, validateJwtToken } from "../../helpers/middleware/validateJwtToken";
import { validateToken } from "../auth/verify/util";
import { InitializeSubscriptionController } from "./create-subscription";
import {Router} from "express";
import { WebhookController } from "./webhook";
import { FindSubscriptionController } from "./find-subscription";

export const subscriptionRouter = Router();


subscriptionRouter.post("/webhook", WebhookController);

subscriptionRouter.use(validateJwtToken)
subscriptionRouter.use(validateBusinessPermission)

subscriptionRouter.get("/initialize", InitializeSubscriptionController);
subscriptionRouter.get("/find", FindSubscriptionController);
// subscriptionRouter.post("/initialize", InitializeSubscriptionController);
