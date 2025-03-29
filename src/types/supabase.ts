// Типы данных для работы с Supabase

// Запись о времени
export interface TimeEntry {
  id?: string; // Автоматически создается в Supabase
  user_id: string; // ID пользователя
  project_type: string; // Тип работы (development, design и т.д.)
  start_time: string | Date; // Время начала
  end_time: string | Date; // Время окончания
  duration: number; // Длительность в миллисекундах
  description?: string; // Описание
  created_at?: string; // Автоматически создается в Supabase
}

// Настройки пользователя
export interface UserSettings {
  id?: string;
  user_id: string;
  work_duration: number; // Длительность рабочего периода (помидора) в минутах
  rest_duration: number; // Длительность перерыва в минутах
  notifications_enabled: boolean; // Включены ли уведомления
  notification_sound: string; // Звук уведомления
  theme: string; // Тема оформления
  created_at?: string;
  updated_at?: string;
}

// Пользовательский тип работы
export interface CustomProjectType {
  id?: string;
  user_id: string;
  name: string; // Название типа
  created_at?: string;
}

// Тип для определения структуры базы данных Supabase
export interface Database {
  public: {
    Tables: {
      time_entries: {
        Row: TimeEntry;
        Insert: Omit<TimeEntry, 'id' | 'created_at'>;
        Update: Partial<Omit<TimeEntry, 'id' | 'created_at'>>;
      };
      user_settings: {
        Row: UserSettings;
        Insert: Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>>;
      };
      custom_project_types: {
        Row: CustomProjectType;
        Insert: Omit<CustomProjectType, 'id' | 'created_at'>;
        Update: Partial<Omit<CustomProjectType, 'id' | 'created_at'>>;
      };
    };
  };
} 