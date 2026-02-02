import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const createSchema = z.object({
  name: z.string().min(1).max(64)
});

const updateSchema = createSchema.partial();

function getUserId(request: any) {
  return request.user?.sub as string | undefined;
}

export async function projectTypesRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: app.authenticate }, async (request: FastifyRequest) => {
    const userId = getUserId(request);
    if (!userId) return { items: [] };

    const items = await prisma.customProjectType.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
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

    const item = await prisma.customProjectType.create({
      data: { userId, name: parsed.data.name }
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
    const existing = await prisma.customProjectType.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return reply.code(404).send({ error: "Not found" });
    }

    const item = await prisma.customProjectType.update({
      where: { id },
      data: { name: parsed.data.name }
    });

    return reply.send({ item });
  });

  app.delete("/:id", { preHandler: app.authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });

    const { id } = request.params as { id: string };
    const existing = await prisma.customProjectType.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return reply.code(404).send({ error: "Not found" });
    }

    await prisma.customProjectType.delete({ where: { id } });
    return reply.send({ ok: true });
  });
}
