import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const createSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1).max(64),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().default("#6366f1"),
  description: z.string().max(256).optional(),
  timeGoalMs: z.number().int().positive().optional()
});

const updateSchema = z.object({
  name: z.string().min(1).max(64).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  description: z.string().max(256).nullable().optional(),
  status: z.enum(["active", "archived"]).optional(),
  timeGoalMs: z.number().int().positive().nullable().optional()
});

function getUserId(request: any) {
  return request.user?.sub as string | undefined;
}

export async function workTypesRoutes(app: FastifyInstance) {
  // Get work types for a project
  app.get("/", { preHandler: [app.authenticate] }, async (request: FastifyRequest) => {
    const userId = getUserId(request);
    if (!userId) return { items: [] };

    const { projectId } = request.query as { projectId?: string };

    if (!projectId) {
      return { items: [] };
    }

    // Verify project belongs to user
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== userId) {
      return { items: [] };
    }

    const items = await prisma.workType.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" }
    });

    return { items };
  });

  // Create work type
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

    const item = await prisma.workType.create({
      data: {
        projectId: parsed.data.projectId,
        name: parsed.data.name,
        color: parsed.data.color,
        description: parsed.data.description,
        timeGoalMs: parsed.data.timeGoalMs
      }
    });

    return reply.code(201).send({ item });
  });

  // Update work type
  app.patch("/:id", { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });

    const parsed = updateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid payload" });
    }

    const { id } = request.params as { id: string };
    const existing = await prisma.workType.findUnique({
      where: { id },
      include: { project: true }
    });

    if (!existing || existing.project.userId !== userId) {
      return reply.code(404).send({ error: "Not found" });
    }

    const item = await prisma.workType.update({
      where: { id },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.color !== undefined && { color: parsed.data.color }),
        ...(parsed.data.description !== undefined && { description: parsed.data.description }),
        ...(parsed.data.status !== undefined && { status: parsed.data.status }),
        ...(parsed.data.timeGoalMs !== undefined && { timeGoalMs: parsed.data.timeGoalMs })
      }
    });

    return reply.send({ item });
  });

  // Delete work type
  app.delete("/:id", { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });

    const { id } = request.params as { id: string };
    const existing = await prisma.workType.findUnique({
      where: { id },
      include: { project: true }
    });

    if (!existing || existing.project.userId !== userId) {
      return reply.code(404).send({ error: "Not found" });
    }

    await prisma.workType.delete({ where: { id } });
    return reply.send({ ok: true });
  });
}
