import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const dbProvider = process.env.DB_PROVIDER || "postgres";

export default defineConfig({
  schema: dbProvider === "sqlite" ? "prisma/schema.sqlite.prisma" : "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL")
  }
});
