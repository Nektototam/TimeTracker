import { useState, useEffect } from 'react';
import { api, ApiTimeEntry } from '../lib/api';
import { TimeEntry } from '../types/supabase';

interface UseTimeEntriesReturn {
  entries: TimeEntry[];
  isLoading: boolean;
  error: Error | null;
  addTimeEntry: (entry: Omit<TimeEntry, 'id' | 'created_at'>) => Promise<TimeEntry | null>;
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

  // Добавление новой записи о времени
  async function addTimeEntry(entry: Omit<TimeEntry, 'id' | 'created_at'>): Promise<TimeEntry | null> {
    try {
      const payload = {
        projectType: entry.project_type,
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
        projectType: entry.project_type,
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