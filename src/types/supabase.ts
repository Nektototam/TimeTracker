// Типы данных для работы с API

// Проект
export interface Project {
  id: string;
  user_id: string;
  name: string;
  color: string;
  description?: string;
  status: "active" | "archived";
  created_at?: string;
  updated_at?: string;
}

// Тип работы (внутри проекта)
export interface WorkType {
  id: string;
  project_id: string;
  name: string;
  color: string;
  description?: string;
  status: "active" | "archived";
  time_goal_ms?: number;
  created_at?: string;
  updated_at?: string;
}

// Запись о времени
export interface TimeEntry {
  id?: string;
  project_id: string;
  work_type_id?: string;
  start_time: string | Date;
  end_time: string | Date;
  duration: number; // Длительность в миллисекундах
  description?: string;
  created_at?: string;
  time_limit?: number; // Ограничение времени работы над задачей в миллисекундах
  // Связанные объекты
  project?: Project;
  work_type?: WorkType;
}

// Настройки пользователя
export interface UserSettings {
  id?: string;
  user_id: string;
  active_project_id?: string;
  pomodoro_work_time: number;
  pomodoro_rest_time: number;
  pomodoro_long_rest_time: number;
  auto_start: boolean;
  round_times: string;
  language: string;
  data_retention_period: number;
  created_at?: string;
  updated_at?: string;
}
