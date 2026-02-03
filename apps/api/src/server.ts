import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import { healthRoutes } from "./routes/health";
import { authRoutes } from "./routes/auth";
import { timeEntriesRoutes } from "./routes/timeEntries";
import { settingsRoutes } from "./routes/settings";
import { projectsRoutes } from "./routes/projects";
import { workTypesRoutes } from "./routes/workTypes";
import { reportsRoutes } from "./routes/reports";
import { authPlugin } from "./plugins/auth";

export async function buildServer() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: true,
    credentials: true
  });

  await app.register(cookie);

  await app.register(jwt, {
    secret: process.env.JWT_SECRET || "",
    decode: { complete: false }
  });

  if (!process.env.JWT_SECRET) {
    app.log.warn("JWT_SECRET is not set. Auth will fail at runtime.");
  }

  await app.register(authPlugin);

  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute"
  });

  await app.register(healthRoutes, { prefix: "/health" });
  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(projectsRoutes, { prefix: "/projects" });
  await app.register(workTypesRoutes, { prefix: "/work-types" });
  await app.register(timeEntriesRoutes, { prefix: "/time-entries" });
  await app.register(settingsRoutes, { prefix: "/settings" });
  await app.register(reportsRoutes, { prefix: "/reports" });

  return app;
}
