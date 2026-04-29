import { Router } from "express"
import { authRouter } from "./auth"
import { profileRouter } from "./profile"
import { businessRouter } from "./business"
import { shiftRouter } from "./shifts"
import { staffRouter } from "./staff"
import { stockRouter } from "./stock"
import { auditRouter } from "./audit-trail"
import { reportRouter } from "./reports"
import { dashboardRouter } from "./dashboard"
import { adminRouter } from "./admin"
import { subscriptionRouter } from "./subscriptions"
import { validateBusinessManagerPermission, validateJwtToken } from "../helpers/middleware/validateJwtToken"
import { SearchController } from "./search"

export const baseRouter = Router()

baseRouter.use("/auth", authRouter)
baseRouter.use("/profile", profileRouter)
baseRouter.use("/business/profile", businessRouter)
baseRouter.use("/shift", shiftRouter)
baseRouter.use("/staff", staffRouter)
baseRouter.use("/stock", stockRouter)
baseRouter.use("/audit-trail", auditRouter) // Mount profile routes under /profile in the audit router
baseRouter.use("/report", reportRouter)
baseRouter.use("/dashboard", dashboardRouter)
baseRouter.use("/admin", adminRouter)
baseRouter.use("/subscription", subscriptionRouter)
baseRouter.get("/search", validateJwtToken,validateBusinessManagerPermission, SearchController)