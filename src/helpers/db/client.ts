import { pagination } from "prisma-extension-pagination";
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg";
import { PrismaClient } from "../../../generated/prisma/client";


const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

export const prisma = new PrismaClient(
    {
        adapter: new PrismaPg(pool),
        log: ["error", "warn"],
    }
).$extends(pagination())
