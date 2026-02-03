import { api, ApiTimeEntry } from './api';

// Типы данных для отчетов
export interface TimeEntry {
  id: string;
  user_id: string;
  project_type: string;
  start_time: string;
  end_time: string;
  duration: number;
  description?: string;
  created_at?: string;
  time_limit?: number;
}

export interface ProjectSummary {
  project_type: string;
  project_name: string;
  total_duration: number;
  percentage: number;
  entries: TimeEntry[];
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
  private standardProjectNames: Record<string, string> = {
    development: 'Веб-разработка',
    design: 'Дизайн',
    marketing: 'Маркетинг',
    meeting: 'Совещание',
    other: 'Другое'
  };

  private mapEntry(entry: ApiTimeEntry): TimeEntry {
    return {
      id: entry.id,
      user_id: entry.userId,
      project_type: entry.projectType,
      start_time: entry.startTime,
      end_time: entry.endTime,
      duration: entry.durationMs,
      description: entry.description || undefined,
      created_at: entry.createdAt,
      time_limit: entry.timeLimitMs || undefined
    };
  }

  private async getProjectNameMap(projectTypes: string[]) {
    const names: Record<string, string> = { ...this.standardProjectNames };
    const customIds = projectTypes.filter(type => !names[type]);

    if (customIds.length === 0) {
      return names;
    }

    const { items } = await api.projectTypes.list();
    items
      .filter(item => customIds.includes(item.id))
      .forEach(item => {
        names[item.id] = item.name;
      });

    return names;
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

    const mappedEntries = entries.map(this.mapEntry);
    const nameMap = await this.getProjectNameMap(projectSummaries.map(summary => summary.projectType));
    const mappedSummaries: ProjectSummary[] = projectSummaries.map((summary) => ({
      project_type: summary.projectType,
      project_name: nameMap[summary.projectType] || summary.projectType,
      total_duration: summary.totalDuration,
      percentage: summary.percentage,
      entries: (summary.entries ?? []).map(this.mapEntry)
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