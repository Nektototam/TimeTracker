import { supabase } from './supabase';

// Типы данных для отчетов
export interface TimeEntry {
  id: string;
  user_id: string;
  project_type: string;
  start_time: string;
  end_time: string;
  duration: number;
  description?: string;
  created_at: string;
}

export interface ProjectSummary {
  project_type: string;
  total_duration: number;
  percentage: number;
}

export interface DailySummary {
  date: string;
  total_duration: number;
}

export interface ReportData {
  entries: TimeEntry[];
  projectSummaries: ProjectSummary[];
  dailySummaries: DailySummary[];
  totalDuration: number;
}

// Форматы периодов для отчетов
export type PeriodType = 'week' | 'month' | 'quarter' | 'custom';

// Сервис для работы с отчетами
class ReportService {
  // Получение данных для отчета
  async getReportData(
    startDate: Date,
    endDate: Date
  ): Promise<ReportData> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        throw new Error('Пользователь не авторизован');
      }

      // Получаем записи за выбранный период
      const { data: entries, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', startDate.toISOString())
        .lte('end_time', endDate.toISOString())
        .order('start_time', { ascending: false });

      if (error) {
        console.error('Ошибка при получении данных:', error);
        throw error;
      }

      // Инициализируем данные отчета
      const reportData: ReportData = {
        entries: entries || [],
        projectSummaries: [],
        dailySummaries: [],
        totalDuration: 0
      };

      if (!entries || entries.length === 0) {
        return reportData;
      }

      // Рассчитываем общую продолжительность
      const totalDuration = entries.reduce((sum, entry) => sum + entry.duration, 0);
      reportData.totalDuration = totalDuration;

      // Группируем по типам проектов
      const projectMap = new Map<string, number>();
      
      entries.forEach(entry => {
        const current = projectMap.get(entry.project_type) || 0;
        projectMap.set(entry.project_type, current + entry.duration);
      });

      // Создаем суммарные данные по проектам
      const projectSummaries = Array.from(projectMap.entries()).map(([project_type, duration]) => ({
        project_type,
        total_duration: duration,
        percentage: (duration / totalDuration) * 100
      }));

      // Сортируем от большего к меньшему
      projectSummaries.sort((a, b) => b.total_duration - a.total_duration);
      reportData.projectSummaries = projectSummaries;

      // Группируем по дням
      const dateMap = new Map<string, number>();
      
      entries.forEach(entry => {
        const date = new Date(entry.start_time).toISOString().split('T')[0];
        const current = dateMap.get(date) || 0;
        dateMap.set(date, current + entry.duration);
      });

      // Создаем суммарные данные по дням
      const dailySummaries = Array.from(dateMap.entries()).map(([date, duration]) => ({
        date,
        total_duration: duration
      }));

      // Сортируем по дате
      dailySummaries.sort((a, b) => a.date.localeCompare(b.date));
      reportData.dailySummaries = dailySummaries;

      return reportData;
    } catch (error) {
      console.error('Ошибка при получении данных отчета:', error);
      throw error;
    }
  }

  // Получение данных для недели
  async getWeekReport(date: Date = new Date()): Promise<ReportData> {
    // Определяем первый день недели (понедельник)
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Корректируем для воскресенья
    
    const startDate = new Date(date);
    startDate.setDate(diff);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    
    return await this.getReportData(startDate, endDate);
  }

  // Получение данных за месяц
  async getMonthReport(date: Date = new Date()): Promise<ReportData> {
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);
    
    return await this.getReportData(startDate, endDate);
  }

  // Получение данных за квартал
  async getQuarterReport(date: Date = new Date()): Promise<ReportData> {
    const quarter = Math.floor(date.getMonth() / 3);
    
    const startDate = new Date(date.getFullYear(), quarter * 3, 1);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date.getFullYear(), (quarter + 1) * 3, 0);
    endDate.setHours(23, 59, 59, 999);
    
    return await this.getReportData(startDate, endDate);
  }

  // Получение данных за произвольный период
  async getCustomReport(startDate: Date, endDate: Date): Promise<ReportData> {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return await this.getReportData(start, end);
  }

  // Форматирование времени
  formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  
  // Форматирование полного времени
  formatFullTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Получение названия проекта
  getProjectName(projectType: string): string {
    // Для пользовательских типов достаем из localStorage
    if (projectType.startsWith('custom-')) {
      const customTypesStr = localStorage.getItem('timetracker-custom-types');
      if (customTypesStr) {
        try {
          const customTypes = JSON.parse(customTypesStr);
          const customType = customTypes.find((t: any) => t.value === projectType);
          if (customType) {
            return customType.label;
          }
        } catch (e) {
          console.error('Error parsing custom types from localStorage:', e);
        }
      }
      return 'Пользовательский тип';
    }

    // Для стандартных типов используем предопределенные значения
    switch (projectType) {
      case 'development': return 'Веб-разработка';
      case 'design': return 'Дизайн';
      case 'marketing': return 'Маркетинг';
      case 'meeting': return 'Совещание';
      case 'other': return 'Другое';
      default: return 'Неизвестный тип';
    }
  }
}

export const reportService = new ReportService(); 