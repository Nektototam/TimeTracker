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
      
      // Получаем записи времени
      console.log('Запрашиваем записи с фильтром продолжительности > 59 секунд');
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', start.toISOString())
        .lte('end_time', end.toISOString())
        .gt('duration', 59) // Требуем минимальную продолжительность 60 секунд (1 минута)
        .order('start_time', { ascending: false });

      if (error) {
        console.error('Ошибка запроса:', error);
        throw new Error(`Ошибка при загрузке записей: ${error.message}`);
      }

      // Логирование полученных данных
      console.log(`Получено записей из БД: ${data?.length || 0}`);
      
      // Создаем новую переменную для отфильтрованных данных вместо переназначения константы
      let entriesForProcessing = data || [];
      
      if (entriesForProcessing.length > 0) {
        // Проверяем, есть ли записи с близкой к нулю продолжительностью (менее минуты)
        const problematicEntries = entriesForProcessing.filter(entry => {
          // Проверка по продолжительности в секундах
          if (entry.duration < 60) {
            return true;
          }
          
          // Проверка разницы между временными метками (минимум 60 секунд)
          const startTime = new Date(entry.start_time).getTime();
          const endTime = new Date(entry.end_time).getTime();
          const diffInSeconds = (endTime - startTime) / 1000;
          
          // Если разница менее 60 секунд - считаем проблемной записью
          return diffInSeconds < 60;
        });
        
        console.log(`Записей с проблемной продолжительностью: ${problematicEntries.length}`);
        if (problematicEntries.length > 0) {
          console.log('Примеры проблемных записей:');
          problematicEntries.slice(0, 3).forEach(entry => {
            const startTime = new Date(entry.start_time);
            const endTime = new Date(entry.end_time);
            const diffMs = endTime.getTime() - startTime.getTime();
            console.log(`ID: ${entry.id}, Начало: ${entry.start_time}, Конец: ${entry.end_time}, Длительность: ${entry.duration}, Разница: ${diffMs}мс (${diffMs/1000}с)`);
          });
        }
        
        // Улучшенная фильтрация с учетом малых различий во времени
        entriesForProcessing = entriesForProcessing.filter(entry => {
          // Проверка минимальной продолжительности в секундах (из базы данных)
          if (entry.duration < 60) {
            return false;
          }
          
          // Проверка реальной разницы между метками времени (с учетом возможной погрешности)
          const startTime = new Date(entry.start_time).getTime();
          const endTime = new Date(entry.end_time).getTime();
          const diffInSeconds = (endTime - startTime) / 1000;
          
          return diffInSeconds >= 60; // Минимум 60 секунд реальной разницы
        });
        
        console.log(`После улучшенной фильтрации осталось: ${entriesForProcessing.length}`);
      }
      
      // Группируем записи по типу проекта
      const projectGroups: { [key: string]: TimeEntry[] } = {};
      let totalDuration = 0;

      if (entriesForProcessing.length > 0) {
        entriesForProcessing.forEach(entry => {
          const projectType = entry.project_type;
          if (!projectGroups[projectType]) {
            projectGroups[projectType] = [];
          }
          projectGroups[projectType].push(entry);
          totalDuration += entry.duration;
        });
      }
      
      // Соберем все уникальные типы проектов
      const projectTypes = Object.keys(projectGroups);
      
      // Получаем все имена пользовательских типов проектов из базы данных
      const customTypes = projectTypes.filter(type => 
        type !== 'development' && 
        type !== 'design' && 
        type !== 'marketing' && 
        type !== 'meeting' && 
        type !== 'other'
      );
      
      // Если есть пользовательские типы, загружаем их имена
      let customTypeNames: { [key: string]: string } = {};
      
      if (customTypes.length > 0) {
        const { data: customTypesData } = await supabase
          .from('custom_project_types')
          .select('id, name')
          .in('id', customTypes);
          
        if (customTypesData) {
          customTypesData.forEach(item => {
            customTypeNames[item.id] = item.name;
          });
        }
      }
      
      // Создаем сводки по проектам
      const projectSummaries: ProjectSummary[] = projectTypes.map(projectType => {
        const entries = projectGroups[projectType];
        const projectDuration = entries.reduce((sum, entry) => sum + entry.duration, 0);
        const percentage = totalDuration > 0 ? (projectDuration / totalDuration) * 100 : 0;
        
        // Определяем название проекта
        let projectName = 'Неизвестный тип';
        
        // Для стандартных типов
        switch (projectType) {
          case 'development': projectName = 'Веб-разработка'; break;
          case 'design': projectName = 'Дизайн'; break;
          case 'marketing': projectName = 'Маркетинг'; break;
          case 'meeting': projectName = 'Совещание'; break;
          case 'other': projectName = 'Другое'; break;
        }
        
        // Для пользовательских типов
        if (customTypeNames[projectType]) {
          projectName = customTypeNames[projectType];
        }
        
        return {
          project_type: projectType,
          project_name: projectName,
          total_duration: projectDuration,
          percentage: parseFloat(percentage.toFixed(1)),
          entries
        };
      });
      
      // Сортируем по убыванию длительности
      projectSummaries.sort((a, b) => b.total_duration - a.total_duration);

      return {
        startDate: start,
        endDate: end,
        totalDuration,
        entries: entriesForProcessing,
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