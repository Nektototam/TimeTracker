import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserSettings } from '../types/supabase';

// Значения настроек по умолчанию
const DEFAULT_SETTINGS: Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  work_duration: 25, // 25 минут для рабочего периода
  rest_duration: 5, // 5 минут для перерыва
  notifications_enabled: true,
  notification_sound: 'default',
  theme: 'light'
};

interface UseUserSettingsReturn {
  settings: UserSettings | null;
  isLoading: boolean;
  error: Error | null;
  saveSettings: (settings: Partial<UserSettings>) => Promise<UserSettings | null>;
}

export function useUserSettings(userId: string): UseUserSettingsReturn {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Загрузка настроек при инициализации хука
  useEffect(() => {
    async function fetchUserSettings() {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Попытка получить настройки
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) throw new Error(error.message);
        
        if (data) {
          // Настройки найдены
          setSettings(data);
        } else {
          // Настроек нет, создаем новые
          const newSettings: Omit<UserSettings, 'id' | 'created_at' | 'updated_at'> = {
            ...DEFAULT_SETTINGS,
            user_id: userId
          };
          
          const { data: createdData, error: createError } = await supabase
            .from('user_settings')
            .insert([newSettings])
            .select()
            .single();
            
          if (createError) throw new Error(createError.message);
          
          setSettings(createdData);
        }
      } catch (err) {
        console.error('Ошибка при загрузке настроек пользователя:', err);
        setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserSettings();
  }, [userId]);

  // Сохранение настроек пользователя
  async function saveSettings(newSettings: Partial<UserSettings>): Promise<UserSettings | null> {
    if (!userId || !settings?.id) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .update(newSettings)
        .eq('id', settings.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      // Обновляем локальное состояние
      if (data) {
        setSettings(data);
      }
      
      return data;
    } catch (err) {
      console.error('Ошибка при сохранении настроек пользователя:', err);
      setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
      return null;
    }
  }

  return {
    settings,
    isLoading,
    error,
    saveSettings
  };
} 