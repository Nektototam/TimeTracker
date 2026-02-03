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
  app.get("/", { preHandler: [app.authenticate] }, async (request: FastifyRequest) => {
    const userId = getUserId(request);
    if (!userId) return { items: [], totalDuration: 0, projectSummaries: [] };

    const query = request.query as { period?: PeriodType; startDate?: string; endDate?: string };
    const { start, end } = getDateRange(query.period || "week", query.startDate, query.endDate);

    // Get all user's projects
    const userProjects = await prisma.project.findMany({
      where: { userId },
      select: { id: true, name: true, color: true }
    });
    const projectIds = userProjects.map(p => p.id);
    const projectMap = new Map(userProjects.map(p => [p.id, p]));

    // Get entries from all user's projects
    const entries = await prisma.timeEntry.findMany({
      where: {
        projectId: { in: projectIds },
        startTime: { gte: start, lte: end }
      },
      include: {
        project: true,
        workType: true
      },
      orderBy: { startTime: "desc" }
    });

    let totalDuration = 0;
    const projectGroups: Record<string, {
      project: { id: string; name: string; color: string };
      entries: typeof entries;
      totalDuration: number;
      workTypeSummaries: Record<string, { workType: any; duration: number; entries: any[] }>;
    }> = {};

    entries.forEach((entry) => {
      totalDuration += entry.durationMs;

      if (!projectGroups[entry.projectId]) {
        const project = projectMap.get(entry.projectId)!;
        projectGroups[entry.projectId] = {
          project: { id: project.id, name: project.name, color: project.color },
          entries: [],
          totalDuration: 0,
          workTypeSummaries: {}
        };
      }

      const group = projectGroups[entry.projectId];
      group.entries.push(entry);
      group.totalDuration += entry.durationMs;

      // Group by work type within project
      const workTypeKey = entry.workTypeId || "uncategorized";
      if (!group.workTypeSummaries[workTypeKey]) {
        group.workTypeSummaries[workTypeKey] = {
          workType: entry.workType || { id: "uncategorized", name: "Uncategorized", color: "#9ca3af" },
          duration: 0,
          entries: []
        };
      }
      group.workTypeSummaries[workTypeKey].duration += entry.durationMs;
      group.workTypeSummaries[workTypeKey].entries.push(entry);
    });

    const projectSummaries = Object.values(projectGroups).map((group) => ({
      project: group.project,
      totalDuration: group.totalDuration,
      percentage: totalDuration ? Math.round((group.totalDuration / totalDuration) * 100) : 0,
      workTypes: Object.values(group.workTypeSummaries).map((wt) => ({
        workType: wt.workType,
        duration: wt.duration,
        percentage: group.totalDuration ? Math.round((wt.duration / group.totalDuration) * 100) : 0,
        entriesCount: wt.entries.length
      })),
      entriesCount: group.entries.length
    }));

    return {
      startDate: start,
      endDate: end,
      totalDuration,
      entries,
      projectSummaries
    };
  });
}
