import express, { Response, Request } from "express"
import { createServer } from "http";
import { errorHandler } from "./src/helpers/errorHandler/errorHandler";
import cors from "cors"
import { authRouter } from "./src/controllers/auth";
import { profileRouter } from "./src/controllers/profile";
import { staffRouter } from "./src/controllers/staff";
import { businessRouter } from "./src/controllers/business";
import { shiftRouter } from "./src/controllers/shifts";
import { stockRouter } from "./src/controllers/stock";
import { auditRouter } from "./src/controllers/audit-trail";
import { reportRouter } from "./src/controllers/reports";
import { dashboardRouter } from "./src/controllers/dashboard";
import { adminRouter } from "./src/controllers/admin";
import morgan from "morgan";
import { subscriptionRouter } from "./src/controllers/subscriptions";

const app = express()
app.use(cors(
    { origin: ["http://localhost:3000", "https://stockvar.netlify.app", "https://stockvar.app"] }
))
app.use(express.urlencoded())
app.use(express.json())

app.use(morgan("dev"));

app.use("/api/auth", authRouter)
app.use("/api/profile", profileRouter)
app.use("/api/business/profile", businessRouter)
app.use("/api/shift", shiftRouter)
app.use("/api/staff", staffRouter)
app.use("/api/stock", stockRouter)
app.use("/api/audit-trail", auditRouter) // Mount profile routes under /profile in the audit router
app.use("/api/report", reportRouter)
app.use("/api/dashboard", dashboardRouter)
app.use("/api/admin", adminRouter)
app.use("/api/subscription", subscriptionRouter)

app.use("/", (req: Request, res: Response) => {
    res.status(404).json({ status: "Error", message: "Path not found" })
})

app.use(errorHandler)


const httpServer = createServer(app)

httpServer.listen(3002, () => {
    console.log("running on ", 3002)
})
