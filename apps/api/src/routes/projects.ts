import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const createSchema = z.object({
  name: z.string().min(1).max(64),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().default("#6366f1"),
  description: z.string().max(256).optional()
});

const updateSchema = z.object({
  name: z.string().min(1).max(64).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  description: z.string().max(256).nullable().optional(),
  status: z.enum(["active", "archived"]).optional()
});

function getUserId(request: any) {
  return request.user?.sub as string | undefined;
}

export async function projectsRoutes(app: FastifyInstance) {
  // Get all projects for user
  app.get("/", { preHandler: [app.authenticate] }, async (request: FastifyRequest) => {
    const userId = getUserId(request);
    if (!userId) return { items: [] };

    const items = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { timeEntries: true, workTypes: true }
        }
      }
    });

    return { items };
  });

  // Get single project with work types
  app.get("/:id", { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });

    const { id } = request.params as { id: string };
    const item = await prisma.project.findUnique({
      where: { id },
      include: {
        workTypes: {
          where: { status: "active" },
          orderBy: { name: "asc" }
        },
        _count: {
          select: { timeEntries: true }
        }
      }
    });

    if (!item || item.userId !== userId) {
      return reply.code(404).send({ error: "Not found" });
    }

    return { item };
  });

  // Create project
  app.post("/", { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });

    const parsed = createSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid payload" });
    }

    const item = await prisma.project.create({
      data: {
        userId,
        name: parsed.data.name,
        color: parsed.data.color,
        description: parsed.data.description
      }
    });

    // Set as active project if it's the first one
    const settings = await prisma.userSettings.findUnique({ where: { userId } });
    if (settings && !settings.activeProjectId) {
      await prisma.userSettings.update({
        where: { userId },
        data: { activeProjectId: item.id }
      });
    }

    return reply.code(201).send({ item });
  });

  // Update project
  app.patch("/:id", { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });

    const parsed = updateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid payload" });
    }

    const { id } = request.params as { id: string };
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return reply.code(404).send({ error: "Not found" });
    }

    const item = await prisma.project.update({
      where: { id },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.color !== undefined && { color: parsed.data.color }),
        ...(parsed.data.description !== undefined && { description: parsed.data.description }),
        ...(parsed.data.status !== undefined && { status: parsed.data.status })
      }
    });

    return reply.send({ item });
  });

  // Delete project
  app.delete("/:id", { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });

    const { id } = request.params as { id: string };
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return reply.code(404).send({ error: "Not found" });
    }

    // Clear activeProjectId if deleting the active project
    const settings = await prisma.userSettings.findUnique({ where: { userId } });
    if (settings?.activeProjectId === id) {
      const otherProject = await prisma.project.findFirst({
        where: { userId, id: { not: id }, status: "active" }
      });
      await prisma.userSettings.update({
        where: { userId },
        data: { activeProjectId: otherProject?.id ?? null }
      });
    }

    await prisma.project.delete({ where: { id } });
    return reply.send({ ok: true });
  });

  // Set active project
  app.post("/:id/activate", { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });

    const { id } = request.params as { id: string };
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return reply.code(404).send({ error: "Not found" });
    }

    await prisma.userSettings.upsert({
      where: { userId },
      create: { userId, activeProjectId: id },
      update: { activeProjectId: id }
    });

    return reply.send({ ok: true, activeProjectId: id });
  });
}
