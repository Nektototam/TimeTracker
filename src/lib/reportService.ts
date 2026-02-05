import { api, ApiTimeEntry } from './api';

// Типы данных для отчетов (используем новую модель с проектами и типами работ)
export interface TimeEntry {
  id: string;
  projectId: string;
  workTypeId?: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  description?: string;
  createdAt?: string;
  timeLimitMs?: number;
  // Связанные объекты
  project?: {
    id: string;
    name: string;
    color: string;
  };
  workType?: {
    id: string;
    name: string;
    color: string;
  };
}

export interface WorkTypeSummary {
  workType: {
    id: string;
    name: string;
    color: string;
  };
  duration: number;
  percentage: number;
  entriesCount: number;
}

export interface ProjectSummary {
  project: {
    id: string;
    name: string;
    color: string;
  };
  totalDuration: number;
  percentage: number;
  workTypes: WorkTypeSummary[];
  entriesCount: number;
}

export interface DailySummary {
  date: string;
  totalDuration: number;
}

export interface ReportData {
  startDate: Date;
  endDate: Date;
  totalDuration: number;
  entries: TimeEntry[];
  projectSummaries: ProjectSummary[];
}

// Форматы периодов для отчетов
export type PeriodType = 'week' | 'month' | 'quarter' | 'custom';

class ReportService {
  private mapEntry(entry: ApiTimeEntry): TimeEntry {
    return {
      id: entry.id,
      projectId: entry.projectId,
      workTypeId: entry.workTypeId || undefined,
      startTime: entry.startTime,
      endTime: entry.endTime,
      durationMs: entry.durationMs,
      description: entry.description || undefined,
      createdAt: entry.createdAt,
      timeLimitMs: entry.timeLimitMs || undefined,
      project: entry.project ? {
        id: entry.project.id,
        name: entry.project.name,
        color: entry.project.color
      } : undefined,
      workType: entry.workType ? {
        id: entry.workType.id,
        name: entry.workType.name,
        color: entry.workType.color
      } : undefined
    };
  }

  async getReportData(
    userId: string,
    period: PeriodType = 'week',
    startDate?: string,
    endDate?: string
  ): Promise<ReportData> {
    const response = await api.reports.get({
      period,
      startDate,
      endDate
    });

    const entries = response?.entries ?? [];
    const projectSummaries = response?.projectSummaries ?? [];
    const totalDuration = response?.totalDuration ?? 0;

    const mappedEntries = entries.map((entry) => this.mapEntry(entry));

    const mappedSummaries: ProjectSummary[] = projectSummaries.map((summary) => ({
      project: summary.project,
      totalDuration: summary.totalDuration,
      percentage: summary.percentage,
      workTypes: summary.workTypes.map((wt) => ({
        workType: wt.workType,
        duration: wt.duration,
        percentage: wt.percentage,
        entriesCount: wt.entriesCount
      })),
      entriesCount: summary.entriesCount
    }));

    const start = response?.startDate ?? new Date().toISOString();
    const end = response?.endDate ?? new Date().toISOString();

    return {
      startDate: new Date(start),
      endDate: new Date(end),
      totalDuration,
      entries: mappedEntries,
      projectSummaries: mappedSummaries
    };
  }

  async getWeeklyReport(userId: string): Promise<ReportData> {
    return this.getReportData(userId, 'week');
  }

  async getMonthlyReport(userId: string): Promise<ReportData> {
    return this.getReportData(userId, 'month');
  }

  async getQuarterlyReport(userId: string): Promise<ReportData> {
    return this.getReportData(userId, 'quarter');
  }

  async getCustomReport(userId: string, startDate: string, endDate: string): Promise<ReportData> {
    return this.getReportData(userId, 'custom', startDate, endDate);
  }
}

const reportService = new ReportService();

export default reportService;
export { reportService };
