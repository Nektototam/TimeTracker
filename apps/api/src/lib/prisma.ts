import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
const dbProvider = process.env.DB_PROVIDER || "postgres";

if (!connectionString) {
  // eslint-disable-next-line no-console
  console.warn("DATABASE_URL is not set. Prisma client will fail at runtime.");
}

const adapter = dbProvider === "sqlite"
  ? new PrismaBetterSqlite3({ url: connectionString || "file:./dev.db" })
  : new PrismaPg({ connectionString: connectionString || "" });

export const prisma = new PrismaClient({ adapter });
