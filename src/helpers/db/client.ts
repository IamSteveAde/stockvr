// import { PrismaClient } from "../generated/prisma";
import { pagination } from "prisma-extension-pagination";
import { PrismaClient } from "../../../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg"
import {Pool} from "pg";


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const prisma = new PrismaClient(
    {
        adapter: new PrismaPg(pool),
        log: ["query", "error", "warn"],
    }
).$extends(pagination())
