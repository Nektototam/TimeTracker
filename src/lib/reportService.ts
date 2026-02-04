import { api, ApiTimeEntry } from './api';

// Типы данных для отчетов (используем новую модель с проектами и типами работ)
export interface TimeEntry {
  id: string;
  project_id: string;
  work_type_id?: string;
  start_time: string;
  end_time: string;
  duration: number;
  description?: string;
  created_at?: string;
  time_limit?: number;
  // Связанные объекты
  project?: {
    id: string;
    name: string;
    color: string;
  };
  work_type?: {
    id: string;
    name: string;
    color: string;
  };
}

export interface WorkTypeSummary {
  work_type: {
    id: string;
    name: string;
    color: string;
  };
  duration: number;
  percentage: number;
  entries_count: number;
}

export interface ProjectSummary {
  project: {
    id: string;
    name: string;
    color: string;
  };
  total_duration: number;
  percentage: number;
  work_types: WorkTypeSummary[];
  entries_count: number;
}

export interface DailySummary {
  date: string;
  total_duration: number;
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
      project_id: entry.projectId,
      work_type_id: entry.workTypeId || undefined,
      start_time: entry.startTime,
      end_time: entry.endTime,
      duration: entry.durationMs,
      description: entry.description || undefined,
      created_at: entry.createdAt,
      time_limit: entry.timeLimitMs || undefined,
      project: entry.project ? {
        id: entry.project.id,
        name: entry.project.name,
        color: entry.project.color
      } : undefined,
      work_type: entry.workType ? {
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
      total_duration: summary.totalDuration,
      percentage: summary.percentage,
      work_types: summary.workTypes.map((wt) => ({
        work_type: wt.workType,
        duration: wt.duration,
        percentage: wt.percentage,
        entries_count: wt.entriesCount
      })),
      entries_count: summary.entriesCount
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
