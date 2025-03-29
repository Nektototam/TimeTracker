import { supabase } from './supabase';

// Интерфейс для настроек, хранящихся в базе данных
export interface DBSettings {
  pomodoro_work_time: number;
  pomodoro_rest_time: number;
  pomodoro_long_rest_time: number;
  auto_start: boolean;
  round_times: string;
  language: string;
}

// Интерфейс для настроек, хранящихся локально
export interface LocalSettings {
  theme: string;
  timeFormat: string;
  soundNotifications: boolean;
  browserNotifications: boolean;
}

// Интерфейс для всех настроек
export interface AllSettings extends DBSettings, LocalSettings {}

// Настройки по умолчанию
const defaultDBSettings: DBSettings = {
  pomodoro_work_time: 25,
  pomodoro_rest_time: 5,
  pomodoro_long_rest_time: 15,
  auto_start: false,
  round_times: 'off',
  language: 'ru'
};

const defaultLocalSettings: LocalSettings = {
  theme: 'light',
  timeFormat: '24h',
  soundNotifications: true,
  browserNotifications: true
};

// Сервис для работы с настройками
class SettingsService {
  // Загружаем настройки из базы данных
  async loadDBSettings(): Promise<DBSettings> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) {
        console.error('Пользователь не авторизован');
        return defaultDBSettings;
      }
      
      const { data: settings, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Ошибка загрузки настроек из БД:', error);
        
        // Если настройки не найдены, создаем настройки по умолчанию
        if (error.code === 'PGRST116') {
          return await this.createDefaultDBSettings();
        }
        
        return defaultDBSettings;
      }
      
      if (!settings) {
        // Если настройки не найдены, создаем настройки по умолчанию
        return await this.createDefaultDBSettings();
      }
      
      return {
        pomodoro_work_time: settings.pomodoro_work_time,
        pomodoro_rest_time: settings.pomodoro_rest_time,
        pomodoro_long_rest_time: settings.pomodoro_long_rest_time,
        auto_start: settings.auto_start,
        round_times: settings.round_times,
        language: settings.language
      };
    } catch (error) {
      console.error('Ошибка загрузки настроек из БД:', error);
      return defaultDBSettings;
    }
  }
  
  // Создаем настройки по умолчанию в базе данных
  async createDefaultDBSettings(): Promise<DBSettings> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) {
        console.error('Пользователь не авторизован');
        return defaultDBSettings;
      }
      
      const { data, error } = await supabase
        .from('user_settings')
        .insert([{
          user_id: userId,
          ...defaultDBSettings
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Ошибка создания настроек по умолчанию:', error);
        return defaultDBSettings;
      }
      
      return data as DBSettings;
    } catch (error) {
      console.error('Ошибка создания настроек по умолчанию:', error);
      return defaultDBSettings;
    }
  }
  
  // Сохраняем настройки в базу данных
  async saveDBSettings(settings: DBSettings): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) {
        console.error('Пользователь не авторизован');
        return false;
      }
      
      const { error } = await supabase
        .from('user_settings')
        .update({
          pomodoro_work_time: settings.pomodoro_work_time,
          pomodoro_rest_time: settings.pomodoro_rest_time,
          pomodoro_long_rest_time: settings.pomodoro_long_rest_time,
          auto_start: settings.auto_start,
          round_times: settings.round_times,
          language: settings.language
        })
        .eq('user_id', userId);
      
      if (error) {
        // Если настройки не существуют, попробуем создать их
        if (error.code === 'PGRST116') {
          return await this.createAndSaveDBSettings(settings);
        }
        
        console.error('Ошибка сохранения настроек в БД:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка сохранения настроек в БД:', error);
      return false;
    }
  }
  
  // Создаем и сохраняем настройки в базу данных
  async createAndSaveDBSettings(settings: DBSettings): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) {
        console.error('Пользователь не авторизован');
        return false;
      }
      
      const { error } = await supabase
        .from('user_settings')
        .insert([{
          user_id: userId,
          ...settings
        }]);
      
      if (error) {
        console.error('Ошибка создания настроек в БД:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка создания настроек в БД:', error);
      return false;
    }
  }
  
  // Загружаем настройки из localStorage
  loadLocalSettings(): LocalSettings {
    try {
      const savedSettings = localStorage.getItem('timetracker_local_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        return {
          theme: settings.theme ?? defaultLocalSettings.theme,
          timeFormat: settings.timeFormat ?? defaultLocalSettings.timeFormat,
          soundNotifications: settings.soundNotifications ?? defaultLocalSettings.soundNotifications,
          browserNotifications: settings.browserNotifications ?? defaultLocalSettings.browserNotifications
        };
      }
    } catch (error) {
      console.error('Ошибка загрузки локальных настроек:', error);
    }
    
    return defaultLocalSettings;
  }
  
  // Сохраняем настройки в localStorage
  saveLocalSettings(settings: LocalSettings): boolean {
    try {
      localStorage.setItem('timetracker_local_settings', JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Ошибка сохранения локальных настроек:', error);
      return false;
    }
  }
  
  // Загружаем все настройки
  async loadAllSettings(): Promise<AllSettings> {
    const dbSettings = await this.loadDBSettings();
    const localSettings = this.loadLocalSettings();
    
    return {
      ...dbSettings,
      ...localSettings
    };
  }
  
  // Сохраняем все настройки
  async saveAllSettings(settings: AllSettings): Promise<boolean> {
    const dbSettings: DBSettings = {
      pomodoro_work_time: settings.pomodoro_work_time,
      pomodoro_rest_time: settings.pomodoro_rest_time,
      pomodoro_long_rest_time: settings.pomodoro_long_rest_time,
      auto_start: settings.auto_start,
      round_times: settings.round_times,
      language: settings.language
    };
    
    const localSettings: LocalSettings = {
      theme: settings.theme,
      timeFormat: settings.timeFormat,
      soundNotifications: settings.soundNotifications,
      browserNotifications: settings.browserNotifications
    };
    
    const dbSuccess = await this.saveDBSettings(dbSettings);
    const localSuccess = this.saveLocalSettings(localSettings);
    
    return dbSuccess && localSuccess;
  }
}

export const settingsService = new SettingsService(); 