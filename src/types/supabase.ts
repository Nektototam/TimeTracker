// Типы данных для работы с API (camelCase для соответствия JS/TS конвенциям)

// Проект
export interface Project {
  id: string;
  userId: string;
  name: string;
  color: string;
  description?: string;
  status: "active" | "archived";
  createdAt?: string;
  updatedAt?: string;
}

// Тип работы (внутри проекта)
export interface WorkType {
  id: string;
  projectId: string;
  name: string;
  color: string;
  description?: string;
  status: "active" | "archived";
  timeGoalMs?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Запись о времени
export interface TimeEntry {
  id?: string;
  projectId: string;
  workTypeId?: string;
  startTime: string | Date;
  endTime: string | Date;
  durationMs: number; // Длительность в миллисекундах
  description?: string;
  createdAt?: string;
  timeLimitMs?: number; // Ограничение времени работы над задачей в миллисекундах
  // Связанные объекты
  project?: Project;
  workType?: WorkType;
}

// Настройки пользователя
export interface UserSettings {
  id?: string;
  userId: string;
  activeProjectId?: string;
  pomodoroWorkTime: number;
  pomodoroRestTime: number;
  pomodoroLongRestTime: number;
  autoStart: boolean;
  roundTimes: string;
  language: string;
  dataRetentionPeriod: number;
  createdAt?: string;
  updatedAt?: string;
}
