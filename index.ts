import express, { Response, Request } from "express"
import { createServer } from "http";
import { errorHandler } from "./src/helpers/errorHandler/errorHandler";
import cors from "cors"
import { authRouter } from "./src/controllers/auth";
import { profileRouter } from "./src/controllers/profile";

const app = express()
app.use(cors())
app.use(express.urlencoded())
app.use(express.json())

app.use("/api/auth", authRouter)
app.use("/api/profile", profileRouter)


app.use("/", (req: Request, res: Response) => {
    res.status(200).json({ status: "success", message: "Welcome to StockVar Backend" })
})

app.use(errorHandler)


const httpServer = createServer(app)

httpServer.listen(3002, () => {
    console.log("running on ", 3002)
})
