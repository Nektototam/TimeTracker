import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const settingsSchema = z.object({
  pomodoroWorkTime: z.number().int().min(1).max(60),
  pomodoroRestTime: z.number().int().min(1).max(30),
  pomodoroLongRestTime: z.number().int().min(1).max(60),
  autoStart: z.boolean(),
  roundTimes: z.string(),
  language: z.string(),
  dataRetentionPeriod: z.number().int().min(1).max(36)
});

function getUserId(request: any) {
  return request.user?.sub as string | undefined;
}

const defaultSettings = {
  pomodoroWorkTime: 25,
  pomodoroRestTime: 5,
  pomodoroLongRestTime: 15,
  autoStart: false,
  roundTimes: "off",
  language: "ru",
  dataRetentionPeriod: 3
};

export async function settingsRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: app.authenticate }, async (request: FastifyRequest) => {
    const userId = getUserId(request);
    if (!userId) return { settings: defaultSettings };

    const existing = await prisma.userSettings.findUnique({ where: { userId } });
    if (!existing) {
      const created = await prisma.userSettings.create({
        data: {
          userId,
          ...defaultSettings
        }
      });
      return { settings: created };
    }

    return { settings: existing };
  });

  app.put("/", { preHandler: app.authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });

    const parsed = settingsSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid payload" });
    }

    const data = parsed.data;
    const settings = await prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data
    });

    return reply.send({ settings });
  });

  app.post("/cleanup", { preHandler: app.authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });

    const settings = await prisma.userSettings.findUnique({ where: { userId } });
    const retentionMonths = settings?.dataRetentionPeriod ?? defaultSettings.dataRetentionPeriod;

    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - retentionMonths);

    await prisma.timeEntry.deleteMany({
      where: {
        userId,
        startTime: { lt: cutoff }
      }
    });

    return reply.send({ ok: true });
  });
}
