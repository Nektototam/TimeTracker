import { FastifyInstance, FastifyRequest } from "fastify";
import { prisma } from "../lib/prisma";

type PeriodType = "week" | "month" | "quarter" | "custom";

function getUserId(request: any) {
  return request.user?.sub as string | undefined;
}

function getDateRange(period: PeriodType, startCustom?: string, endCustom?: string) {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  switch (period) {
    case "week":
      start.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case "month":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
    case "quarter":
      const currentQuarter = Math.floor(now.getMonth() / 3);
      start.setMonth(currentQuarter * 3);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(currentQuarter * 3 + 3);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
    case "custom":
      if (startCustom && endCustom) {
        return { start: new Date(startCustom), end: new Date(endCustom) };
      }
      start.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
}

export async function reportsRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: app.authenticate }, async (request: FastifyRequest) => {
    const userId = getUserId(request);
    if (!userId) return { items: [], totalDuration: 0, projectSummaries: [] };

    const query = request.query as { period?: PeriodType; startDate?: string; endDate?: string };
    const { start, end } = getDateRange(query.period || "week", query.startDate, query.endDate);

    const entries = await prisma.timeEntry.findMany({
      where: {
        userId,
        startTime: { gte: start, lte: end }
      },
      orderBy: { startTime: "desc" }
    });

    let totalDuration = 0;
    const groups: Record<string, typeof entries> = {};

    entries.forEach((entry: { projectType: string; durationMs: number }) => {
      totalDuration += entry.durationMs;
      groups[entry.projectType] = groups[entry.projectType] || [];
      groups[entry.projectType].push(entry as any);
    });

    const projectSummaries = Object.keys(groups).map((projectType) => {
      const items = groups[projectType] as Array<{ durationMs: number }>;
      const duration = items.reduce((sum: number, item) => sum + item.durationMs, 0);
      return {
        projectType,
        totalDuration: duration,
        percentage: totalDuration ? Math.round((duration / totalDuration) * 100) : 0,
        entries: items
      };
    });

    return {
      startDate: start,
      endDate: end,
      totalDuration,
      entries,
      projectSummaries
    };
  });
}
