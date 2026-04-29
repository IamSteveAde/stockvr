import express, { Response, Request } from "express"
import { createServer } from "http";
import { errorHandler } from "./src/helpers/errorHandler/errorHandler";
import cors from "cors"
import morgan from "morgan";
import path from "path";
import { baseRouter } from "./src/controllers";

const app = express()
app.use(cors(
    { origin: ["http://localhost:3000", "https://stockvar.netlify.app", "https://stockvar.app"] }
))
app.use(express.urlencoded())
app.use(express.json())

app.use(morgan("dev"));

var dir = path.join(__dirname, 'src/templates');

app.use("/static",express.static(dir));

app.use("/api", baseRouter)

app.use("/", (req: Request, res: Response) => {
    res.status(404).json({ status: "Error", message: "Path not found" })
})

app.use(errorHandler)


const httpServer = createServer(app)

httpServer.listen(3002, () => {
    console.log("running on ", 3002)
})
