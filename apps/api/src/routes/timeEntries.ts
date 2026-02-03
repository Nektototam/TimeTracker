import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const createSchema = z.object({
  projectId: z.string().uuid(),
  workTypeId: z.string().uuid().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  durationMs: z.number().int().positive(),
  description: z.string().optional(),
  timeLimitMs: z.number().int().positive().optional()
});

const updateSchema = z.object({
  workTypeId: z.string().uuid().nullable().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  durationMs: z.number().int().positive().optional(),
  description: z.string().nullable().optional(),
  timeLimitMs: z.number().int().positive().nullable().optional()
});

function getUserId(request: any) {
  return request.user?.sub as string | undefined;
}

export async function timeEntriesRoutes(app: FastifyInstance) {
  // Get today's entries for active project
  app.get("/today", { preHandler: [app.authenticate] }, async (request: FastifyRequest) => {
    const userId = getUserId(request);
    if (!userId) return { items: [] };

    const settings = await prisma.userSettings.findUnique({ where: { userId } });
    if (!settings?.activeProjectId) return { items: [] };

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const items = await prisma.timeEntry.findMany({
      where: {
        projectId: settings.activeProjectId,
        startTime: { gte: start, lt: end }
      },
      include: { workType: true },
      orderBy: { startTime: "desc" }
    });

    return { items };
  });

  // Get entries with filters
  app.get("/", { preHandler: [app.authenticate] }, async (request: FastifyRequest) => {
    const userId = getUserId(request);
    if (!userId) return { items: [] };

    const query = request.query as {
      projectId?: string;
      workTypeId?: string;
      from?: string;
      to?: string;
      limit?: string;
      all?: string;
    };

    // If "all" flag is set, get entries from all user's projects (for reports)
    if (query.all === "true") {
      const userProjects = await prisma.project.findMany({
        where: { userId },
        select: { id: true }
      });
      const projectIds = userProjects.map(p => p.id);

      const where: any = { projectId: { in: projectIds } };

      if (query.from) {
        where.startTime = { ...(where.startTime || {}), gte: new Date(query.from) };
      }
      if (query.to) {
        where.startTime = { ...(where.startTime || {}), lte: new Date(query.to) };
      }

      const take = query.limit ? Math.max(1, Number(query.limit)) : undefined;

      const items = await prisma.timeEntry.findMany({
        where,
        include: { workType: true, project: true },
        orderBy: { startTime: "desc" },
        take
      });

      return { items };
    }

    // Otherwise, filter by specific project or active project
    let projectId = query.projectId;
    if (!projectId) {
      const settings = await prisma.userSettings.findUnique({ where: { userId } });
      projectId = settings?.activeProjectId ?? undefined;
    }

    if (!projectId) return { items: [] };

    // Verify project belongs to user
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== userId) {
      return { items: [] };
    }

    const where: any = { projectId };

    if (query.from) {
      where.startTime = { ...(where.startTime || {}), gte: new Date(query.from) };
    }
    if (query.to) {
      where.startTime = { ...(where.startTime || {}), lte: new Date(query.to) };
    }
    if (query.workTypeId) {
      where.workTypeId = query.workTypeId;
    }

    const take = query.limit ? Math.max(1, Number(query.limit)) : undefined;

    const items = await prisma.timeEntry.findMany({
      where,
      include: { workType: true },
      orderBy: { startTime: "desc" },
      take
    });

    return { items };
  });

  // Create time entry
  app.post("/", { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });

    const parsed = createSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid payload" });
    }

    // Verify project belongs to user
    const project = await prisma.project.findUnique({ where: { id: parsed.data.projectId } });
    if (!project || project.userId !== userId) {
      return reply.code(404).send({ error: "Project not found" });
    }

    // Verify workType belongs to project (if provided)
    if (parsed.data.workTypeId) {
      const workType = await prisma.workType.findUnique({ where: { id: parsed.data.workTypeId } });
      if (!workType || workType.projectId !== parsed.data.projectId) {
        return reply.code(400).send({ error: "Work type not found in this project" });
      }
    }

    const data = parsed.data;
    const item = await prisma.timeEntry.create({
      data: {
        projectId: data.projectId,
        workTypeId: data.workTypeId,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        durationMs: data.durationMs,
        description: data.description,
        timeLimitMs: data.timeLimitMs
      },
      include: { workType: true }
    });

    return reply.code(201).send({ item });
  });

  // Update time entry
  app.patch("/:id", { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });

    const parsed = updateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid payload" });
    }

    const { id } = request.params as { id: string };
    const data = parsed.data;

    const existing = await prisma.timeEntry.findUnique({
      where: { id },
      include: { project: true }
    });

    if (!existing || existing.project.userId !== userId) {
      return reply.code(404).send({ error: "Not found" });
    }

    // Verify workType belongs to project (if provided)
    if (data.workTypeId) {
      const workType = await prisma.workType.findUnique({ where: { id: data.workTypeId } });
      if (!workType || workType.projectId !== existing.projectId) {
        return reply.code(400).send({ error: "Work type not found in this project" });
      }
    }

    const item = await prisma.timeEntry.update({
      where: { id },
      data: {
        ...(data.workTypeId !== undefined && { workTypeId: data.workTypeId }),
        ...(data.startTime && { startTime: new Date(data.startTime) }),
        ...(data.endTime && { endTime: new Date(data.endTime) }),
        ...(data.durationMs !== undefined && { durationMs: data.durationMs }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.timeLimitMs !== undefined && { timeLimitMs: data.timeLimitMs })
      },
      include: { workType: true }
    });

    return reply.send({ item });
  });

  // Delete time entry
  app.delete("/:id", { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });

    const { id } = request.params as { id: string };
    const item = await prisma.timeEntry.findUnique({
      where: { id },
      include: { project: true }
    });

    if (!item || item.project.userId !== userId) {
      return reply.code(404).send({ error: "Not found" });
    }

    await prisma.timeEntry.delete({ where: { id } });
    return reply.send({ ok: true });
  });
}
