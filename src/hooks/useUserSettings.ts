import { useState, useEffect } from 'react';
import settingsService, { DBSettings } from '../lib/settingsService';

interface UseUserSettingsReturn {
  settings: DBSettings | null;
  isLoading: boolean;
  error: Error | null;
  saveSettings: (settings: Partial<DBSettings>) => Promise<DBSettings | null>;
}

export function useUserSettings(userId: string): UseUserSettingsReturn {
  const [settings, setSettings] = useState<DBSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Загрузка настроек при инициализации хука
  useEffect(() => {
    async function fetchUserSettings() {
      try {
        setIsLoading(true);
        const loaded = await settingsService.loadDBSettings();
        setSettings(loaded);
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
  async function saveSettings(newSettings: Partial<DBSettings>): Promise<DBSettings | null> {
    try {
      if (!settings) {
        return null;
      }

      const merged = { ...settings, ...newSettings };
      const ok = await settingsService.saveDBSettings(merged);
      if (ok) {
        setSettings(merged);
        return merged;
      }
      return null;
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