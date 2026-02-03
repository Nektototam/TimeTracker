import { useState, useEffect } from 'react';
import { api, ApiTimeEntry } from '../lib/api';
import { TimeEntry } from '../types/supabase';

interface AddEntryParams {
  project_id: string;
  work_type_id?: string;
  start_time: Date;
  end_time: Date;
  duration: number;
  description?: string;
  time_limit?: number;
}

interface UseTimeEntriesReturn {
  entries: TimeEntry[];
  isLoading: boolean;
  error: Error | null;
  addTimeEntry: (entry: AddEntryParams) => Promise<TimeEntry | null>;
  updateTimeEntry: (id: string, entry: Partial<TimeEntry>) => Promise<TimeEntry | null>;
  deleteTimeEntry: (id: string) => Promise<boolean>;
  getTodayEntries: () => Promise<TimeEntry[]>;
  getEntriesByDateRange: (startDate: Date, endDate: Date) => Promise<TimeEntry[]>;
}

export function useTimeEntries(): UseTimeEntriesReturn {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Загрузка записей при инициализации хука
  useEffect(() => {
    async function fetchTimeEntries() {
      try {
        setIsLoading(true);
        const { items } = await api.timeEntries.list();
        setEntries(items.map(mapToTimeEntry));
      } catch (err) {
        console.error('Ошибка при загрузке записей времени:', err);
        setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchTimeEntries();
  }, []);

  function mapToTimeEntry(entry: ApiTimeEntry): TimeEntry {
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
        user_id: entry.project.userId,
        name: entry.project.name,
        color: entry.project.color,
        description: entry.project.description || undefined,
        status: entry.project.status,
        created_at: entry.project.createdAt,
        updated_at: entry.project.updatedAt
      } : undefined,
      work_type: entry.workType ? {
        id: entry.workType.id,
        project_id: entry.workType.projectId,
        name: entry.workType.name,
        color: entry.workType.color,
        description: entry.workType.description || undefined,
        status: entry.workType.status,
        time_goal_ms: entry.workType.timeGoalMs || undefined,
        created_at: entry.workType.createdAt,
        updated_at: entry.workType.updatedAt
      } : undefined
    };
  }

  // Добавление новой записи о времени
  async function addTimeEntry(entry: AddEntryParams): Promise<TimeEntry | null> {
    try {
      const payload = {
        projectId: entry.project_id,
        workTypeId: entry.work_type_id,
        startTime: new Date(entry.start_time).toISOString(),
        endTime: new Date(entry.end_time).toISOString(),
        durationMs: entry.duration,
        description: entry.description,
        timeLimitMs: entry.time_limit
      };

      const { item } = await api.timeEntries.create(payload);
      const mapped = mapToTimeEntry(item);
      setEntries(prev => [mapped, ...prev]);
      return mapped;
    } catch (err) {
      console.error('Ошибка при добавлении записи времени:', err);
      setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
      return null;
    }
  }

  // Обновление существующей записи
  async function updateTimeEntry(id: string, entry: Partial<TimeEntry>): Promise<TimeEntry | null> {
    try {
      const payload = {
        workTypeId: entry.work_type_id,
        startTime: entry.start_time ? new Date(entry.start_time).toISOString() : undefined,
        endTime: entry.end_time ? new Date(entry.end_time).toISOString() : undefined,
        durationMs: entry.duration,
        description: entry.description,
        timeLimitMs: entry.time_limit
      };

      const { item } = await api.timeEntries.update(id, payload);
      const mapped = mapToTimeEntry(item);
      setEntries(prev => prev.map(itemEntry =>
        itemEntry.id === id ? { ...itemEntry, ...mapped } : itemEntry
      ));
      return mapped;
    } catch (err) {
      console.error('Ошибка при обновлении записи времени:', err);
      setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
      return null;
    }
  }

  // Удаление записи
  async function deleteTimeEntry(id: string): Promise<boolean> {
    try {
      await api.timeEntries.delete(id);
      setEntries(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (err) {
      console.error('Ошибка при удалении записи времени:', err);
      setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
      return false;
    }
  }

  // Получение записей за сегодня
  async function getTodayEntries(): Promise<TimeEntry[]> {
    try {
      const { items } = await api.timeEntries.today();
      return items.map(mapToTimeEntry);
    } catch (err) {
      console.error('Ошибка при получении записей за сегодня:', err);
      setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
      return [];
    }
  }

  // Получение записей за период времени
  async function getEntriesByDateRange(startDate: Date, endDate: Date): Promise<TimeEntry[]> {
    try {
      const { items } = await api.timeEntries.list({
        from: startDate.toISOString(),
        to: endDate.toISOString()
      });
      return items.map(mapToTimeEntry);
    } catch (err) {
      console.error('Ошибка при получении записей за период:', err);
      setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
      return [];
    }
  }

  return {
    entries,
    isLoading,
    error,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    getTodayEntries,
    getEntriesByDateRange
  };
}
