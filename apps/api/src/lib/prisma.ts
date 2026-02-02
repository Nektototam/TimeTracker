import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // eslint-disable-next-line no-console
  console.warn("DATABASE_URL is not set. Prisma client will fail at runtime.");
}

const adapter = new PrismaPg({
  connectionString: connectionString || ""
});

export const prisma = new PrismaClient({ adapter });
