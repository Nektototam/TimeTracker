import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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
        const { data, error } = await supabase
          .from('time_entries')
          .select('*')
          .order('start_time', { ascending: false });

        if (error) throw new Error(error.message);
        
        setEntries(data || []);
      } catch (err) {
        console.error('Ошибка при загрузке записей времени:', err);
        setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchTimeEntries();
  }, []);

  // Добавление новой записи о времени
  async function addTimeEntry(entry: Omit<TimeEntry, 'id' | 'created_at'>): Promise<TimeEntry | null> {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert([entry])
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      // Обновляем локальное состояние
      if (data) {
        setEntries(prev => [data, ...prev]);
      }
      
      return data;
    } catch (err) {
      console.error('Ошибка при добавлении записи времени:', err);
      setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
      return null;
    }
  }

  // Обновление существующей записи
  async function updateTimeEntry(id: string, entry: Partial<TimeEntry>): Promise<TimeEntry | null> {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .update(entry)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      // Обновляем локальное состояние
      if (data) {
        setEntries(prev => prev.map(item => 
          item.id === id ? { ...item, ...data } : item
        ));
      }
      
      return data;
    } catch (err) {
      console.error('Ошибка при обновлении записи времени:', err);
      setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
      return null;
    }
  }

  // Удаление записи
  async function deleteTimeEntry(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
      
      // Обновляем локальное состояние
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
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .gte('start_time', today.toISOString())
        .lt('start_time', tomorrow.toISOString())
        .order('start_time', { ascending: false });

      if (error) throw new Error(error.message);
      
      return data || [];
    } catch (err) {
      console.error('Ошибка при получении записей за сегодня:', err);
      setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
      return [];
    }
  }

  // Получение записей за период времени
  async function getEntriesByDateRange(startDate: Date, endDate: Date): Promise<TimeEntry[]> {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time', { ascending: false });

      if (error) throw new Error(error.message);
      
      return data || [];
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