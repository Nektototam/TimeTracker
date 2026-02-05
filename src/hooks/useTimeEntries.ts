import { useState, useEffect, useCallback, useRef } from 'react';
import { api, ApiTimeEntry } from '../lib/api';
import { TimeEntry } from '../types/supabase';
import { useApiError } from './useApiError';

interface AddEntryParams {
  projectId: string;
  workTypeId?: string;
  startTime: Date;
  endTime: Date;
  durationMs: number;
  description?: string;
  timeLimitMs?: number;
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
  const { handleError } = useApiError();

  // Ref to track if initial fetch has already shown error
  const initialFetchErrorShown = useRef(false);

  // Загрузка записей при инициализации хука
  useEffect(() => {
    async function fetchTimeEntries() {
      try {
        setIsLoading(true);
        const { items } = await api.timeEntries.list();
        setEntries(items.map(mapToTimeEntry));
        initialFetchErrorShown.current = false;
      } catch (err) {
        console.error('Ошибка при загрузке записей времени:', err);
        const errorObj = err instanceof Error ? err : new Error('Неизвестная ошибка');
        setError(errorObj);
        // Show toast only once for initial fetch
        if (!initialFetchErrorShown.current) {
          handleError(errorObj);
          initialFetchErrorShown.current = true;
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchTimeEntries();
  }, [handleError]);

  function mapToTimeEntry(entry: ApiTimeEntry): TimeEntry {
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
        userId: entry.project.userId,
        name: entry.project.name,
        color: entry.project.color,
        description: entry.project.description || undefined,
        status: entry.project.status,
        createdAt: entry.project.createdAt,
        updatedAt: entry.project.updatedAt
      } : undefined,
      workType: entry.workType ? {
        id: entry.workType.id,
        projectId: entry.workType.projectId,
        name: entry.workType.name,
        color: entry.workType.color,
        description: entry.workType.description || undefined,
        status: entry.workType.status,
        timeGoalMs: entry.workType.timeGoalMs || undefined,
        createdAt: entry.workType.createdAt,
        updatedAt: entry.workType.updatedAt
      } : undefined
    };
  }

  // Добавление новой записи о времени
  const addTimeEntry = useCallback(async (entry: AddEntryParams): Promise<TimeEntry | null> => {
    try {
      const payload = {
        projectId: entry.projectId,
        workTypeId: entry.workTypeId,
        startTime: new Date(entry.startTime).toISOString(),
        endTime: new Date(entry.endTime).toISOString(),
        durationMs: entry.durationMs,
        description: entry.description,
        timeLimitMs: entry.timeLimitMs
      };

      const { item } = await api.timeEntries.create(payload);
      const mapped = mapToTimeEntry(item);
      setEntries(prev => [mapped, ...prev]);
      return mapped;
    } catch (err) {
      console.error('Ошибка при добавлении записи времени:', err);
      const errorObj = err instanceof Error ? err : new Error('Неизвестная ошибка');
      setError(errorObj);
      handleError(errorObj);
      return null;
    }
  }, [handleError]);

  // Обновление существующей записи
  const updateTimeEntry = useCallback(async (id: string, entry: Partial<TimeEntry>): Promise<TimeEntry | null> => {
    try {
      const payload = {
        workTypeId: entry.workTypeId,
        startTime: entry.startTime ? new Date(entry.startTime).toISOString() : undefined,
        endTime: entry.endTime ? new Date(entry.endTime).toISOString() : undefined,
        durationMs: entry.durationMs,
        description: entry.description,
        timeLimitMs: entry.timeLimitMs
      };

      const { item } = await api.timeEntries.update(id, payload);
      const mapped = mapToTimeEntry(item);
      setEntries(prev => prev.map(itemEntry =>
        itemEntry.id === id ? { ...itemEntry, ...mapped } : itemEntry
      ));
      return mapped;
    } catch (err) {
      console.error('Ошибка при обновлении записи времени:', err);
      const errorObj = err instanceof Error ? err : new Error('Неизвестная ошибка');
      setError(errorObj);
      handleError(errorObj);
      return null;
    }
  }, [handleError]);

  // Удаление записи
  const deleteTimeEntry = useCallback(async (id: string): Promise<boolean> => {
    try {
      await api.timeEntries.delete(id);
      setEntries(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (err) {
      console.error('Ошибка при удалении записи времени:', err);
      const errorObj = err instanceof Error ? err : new Error('Неизвестная ошибка');
      setError(errorObj);
      handleError(errorObj);
      return false;
    }
  }, [handleError]);

  // Получение записей за сегодня
  const getTodayEntries = useCallback(async (): Promise<TimeEntry[]> => {
    try {
      const { items } = await api.timeEntries.today();
      return items.map(mapToTimeEntry);
    } catch (err) {
      console.error('Ошибка при получении записей за сегодня:', err);
      const errorObj = err instanceof Error ? err : new Error('Неизвестная ошибка');
      setError(errorObj);
      handleError(errorObj);
      return [];
    }
  }, [handleError]);

  // Получение записей за период времени
  const getEntriesByDateRange = useCallback(async (startDate: Date, endDate: Date): Promise<TimeEntry[]> => {
    try {
      const { items } = await api.timeEntries.list({
        from: startDate.toISOString(),
        to: endDate.toISOString()
      });
      return items.map(mapToTimeEntry);
    } catch (err) {
      console.error('Ошибка при получении записей за период:', err);
      const errorObj = err instanceof Error ? err : new Error('Неизвестная ошибка');
      setError(errorObj);
      handleError(errorObj);
      return [];
    }
  }, [handleError]);

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
