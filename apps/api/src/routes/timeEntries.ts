import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const createSchema = z.object({
  projectType: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  durationMs: z.number().int().positive(),
  description: z.string().optional(),
  timeLimitMs: z.number().int().positive().optional()
});

const updateSchema = createSchema.partial();

function getUserId(request: any) {
  return request.user?.sub as string | undefined;
}

export async function timeEntriesRoutes(app: FastifyInstance) {
  app.get("/today", { preHandler: app.authenticate }, async (request: FastifyRequest) => {
    const userId = getUserId(request);
    if (!userId) return { items: [] };

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const items = await prisma.timeEntry.findMany({
      where: {
        userId,
        startTime: { gte: start, lt: end }
      },
      orderBy: { startTime: "desc" }
    });

    return { items };
  });

  app.get("/", { preHandler: app.authenticate }, async (request: FastifyRequest) => {
    const userId = getUserId(request);
    if (!userId) return { items: [] };

    const query = request.query as { from?: string; to?: string; projectType?: string; limit?: string };
    const where: any = { userId };

    if (query.from) {
      where.startTime = { ...(where.startTime || {}), gte: new Date(query.from) };
    }
    if (query.to) {
      where.startTime = { ...(where.startTime || {}), lte: new Date(query.to) };
    }
    if (query.projectType) {
      where.projectType = query.projectType;
    }

    const take = query.limit ? Math.max(1, Number(query.limit)) : undefined;

    const items = await prisma.timeEntry.findMany({
      where,
      orderBy: { startTime: "desc" },
      take
    });

    return { items };
  });

  app.post("/", { preHandler: app.authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });

    const parsed = createSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid payload" });
    }

    const data = parsed.data;
    const item = await prisma.timeEntry.create({
      data: {
        userId,
        projectType: data.projectType,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        durationMs: data.durationMs,
        description: data.description,
        timeLimitMs: data.timeLimitMs
      }
    });

    return reply.code(201).send({ item });
  });

  app.patch("/:id", { preHandler: app.authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });

    const parsed = updateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid payload" });
    }

    const { id } = request.params as { id: string };
    const data = parsed.data;

    const existing = await prisma.timeEntry.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return reply.code(404).send({ error: "Not found" });
    }

    const item = await prisma.timeEntry.update({
      where: { id },
      data: {
        projectType: data.projectType,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        durationMs: data.durationMs,
        description: data.description,
        timeLimitMs: data.timeLimitMs
      }
    });

    return reply.send({ item });
  });

  app.delete("/:id", { preHandler: app.authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });

    const { id } = request.params as { id: string };
    const item = await prisma.timeEntry.findUnique({ where: { id } });

    if (!item || item.userId !== userId) {
      return reply.code(404).send({ error: "Not found" });
    }

    await prisma.timeEntry.delete({ where: { id } });
    return reply.send({ ok: true });
  });
}
