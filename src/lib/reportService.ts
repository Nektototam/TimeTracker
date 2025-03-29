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

// Интерфейс для диапазона дат
interface DateRange {
  start: Date;
  end: Date;
}

class ReportService {
  // Получение диапазона дат для отчета
  getDateRange(periodType: PeriodType, startCustom?: string, endCustom?: string): DateRange {
    const now = new Date();
    const start = new Date();
    const end = new Date();
    
    switch (periodType) {
      case 'week':
        // Начало текущей недели (понедельник)
        start.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        start.setHours(0, 0, 0, 0);
        
        // Конец текущей недели (воскресенье)
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
        
      case 'month':
        // Начало текущего месяца
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        
        // Конец текущего месяца
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
        break;
        
      case 'quarter':
        // Начало текущего квартала
        const currentQuarter = Math.floor(now.getMonth() / 3);
        start.setMonth(currentQuarter * 3);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        
        // Конец текущего квартала
        end.setMonth(currentQuarter * 3 + 3);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
        break;
        
      case 'custom':
        if (startCustom && endCustom) {
          return {
            start: new Date(startCustom),
            end: new Date(endCustom)
          };
        }
        // Если не указаны даты, используем текущую неделю по умолчанию
        start.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
    }
    
    return { start, end };
  }

  // Получение данных для отчета
  async getReportData(
    userId: string,
    period: PeriodType = 'week',
    startDate?: string,
    endDate?: string
  ): Promise<ReportData> {
    try {
      const { start, end } = this.getDateRange(period, startDate, endDate);
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', start.toISOString())
        .lte('end_time', end.toISOString())
        .order('start_time', { ascending: false });

      if (error) {
        throw new Error(`Ошибка при загрузке записей: ${error.message}`);
      }

      // Группируем записи по типу проекта
      const projectGroups: { [key: string]: TimeEntry[] } = {};
      let totalDuration = 0;

      if (data) {
        data.forEach(entry => {
          const projectType = entry.project_type;
          if (!projectGroups[projectType]) {
            projectGroups[projectType] = [];
          }
          projectGroups[projectType].push(entry);
          totalDuration += entry.duration;
        });
      }

      // Преобразуем группы в массив сводных данных
      const projectSummaries: ProjectSummary[] = [];
      
      // Собираем все промисы для получения названий проектов
      const projectNamePromises = Object.keys(projectGroups).map(async (projectType) => {
        const entries = projectGroups[projectType];
        const projectDuration = entries.reduce((sum, entry) => sum + entry.duration, 0);
        const percentage = totalDuration > 0 ? (projectDuration / totalDuration) * 100 : 0;
        
        // Асинхронно получаем название проекта
        const projectName = await this.getProjectName(projectType);
        
        return {
          project_type: projectType,
          project_name: projectName,
          total_duration: projectDuration,
          percentage: parseFloat(percentage.toFixed(1)),
          entries: entries
        };
      });
      
      // Ждем все промисы и сортируем результаты по убыванию длительности
      const resolvedSummaries = await Promise.all(projectNamePromises);
      projectSummaries.push(...resolvedSummaries.sort((a, b) => b.total_duration - a.total_duration));

      return {
        startDate: start,
        endDate: end,
        totalDuration,
        entries: data || [],
        projectSummaries
      };
    } catch (error) {
      console.error('Ошибка при получении данных отчета:', error);
      throw error;
    }
  }

  // Получение еженедельного отчета
  async getWeeklyReport(userId: string): Promise<ReportData> {
    return await this.getReportData(userId, 'week');
  }

  // Получение ежемесячного отчета
  async getMonthlyReport(userId: string): Promise<ReportData> {
    return await this.getReportData(userId, 'month');
  }

  // Получение квартального отчета
  async getQuarterlyReport(userId: string): Promise<ReportData> {
    return await this.getReportData(userId, 'quarter');
  }

  // Получение произвольного отчета за указанный период
  async getCustomReport(userId: string, startDate: string, endDate: string): Promise<ReportData> {
    return await this.getReportData(userId, 'custom', startDate, endDate);
  }

  // Получение названия проекта
  async getProjectName(projectType: string): Promise<string> {
    // Для стандартных типов используем предопределенные значения
    switch (projectType) {
      case 'development': return 'Веб-разработка';
      case 'design': return 'Дизайн';
      case 'marketing': return 'Маркетинг';
      case 'meeting': return 'Совещание';
      case 'other': return 'Другое';
    }

    // Если это не стандартный тип, ищем в пользовательских типах в БД
    try {
      const { data, error } = await supabase
        .from('custom_project_types')
        .select('name')
        .eq('id', projectType)
        .single();
      
      if (error) {
        console.error('Ошибка при загрузке типа проекта:', error);
        return 'Пользовательский тип';
      }
      
      if (data && data.name) {
        return data.name;
      }
    } catch (e) {
      console.error('Ошибка при получении названия типа проекта:', e);
    }
    
    return 'Неизвестный тип';
  }
}

// Экспортируем экземпляр сервиса
export const reportService = new ReportService(); 