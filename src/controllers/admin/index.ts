import { Router } from "express";
import { OverviewController } from "./overview";
import { GetBusinessController } from "./restaurants";
import { GetSubscriptionsController } from "./subscriptions/list";
import { SubscriptionMetricsController } from "./subscriptions/metric";
import { UsersMetricsController } from "./users";


export const adminRouter = Router();

adminRouter.get("/overview/:type", OverviewController)
adminRouter.get("/businesses", GetBusinessController)
adminRouter.get("/subscriptions/list", GetSubscriptionsController)
adminRouter.get("/subscriptions/metrics", SubscriptionMetricsController)
adminRouter.get("/users/metrics", UsersMetricsController)






