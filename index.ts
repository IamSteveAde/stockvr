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

const app = express()
app.use(cors())
app.use(express.urlencoded())
app.use(express.json())

app.use("/api/auth", authRouter)
app.use("/api/profile", profileRouter)
app.use("/api/business/profile", businessRouter)
app.use("/api/shift", shiftRouter)
app.use("/api/staff", staffRouter)
app.use("/api/stock", stockRouter)
app.use("/api/audit-trail", auditRouter) // Mount profile routes under /profile in the audit router

app.use("/", (req: Request, res: Response) => {
    res.status(200).json({ status: "success", message: "Welcome to StockVar Backend" })
})

app.use(errorHandler)


const httpServer = createServer(app)

httpServer.listen(3002, () => {
    console.log("running on ", 3002)
})
