-- Создание таблицы для записей о времени
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  project_type TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration BIGINT NOT NULL, -- длительность в миллисекундах
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_type ON time_entries(project_type);

-- Создание таблицы для настроек пользователя
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  work_duration INTEGER NOT NULL DEFAULT 25,
  rest_duration INTEGER NOT NULL DEFAULT 5,
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  notification_sound TEXT DEFAULT 'default',
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Индекс для быстрого поиска по user_id
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Триггер для автоматического обновления поля updated_at
CREATE OR REPLACE FUNCTION trigger_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON user_settings
FOR EACH ROW
EXECUTE FUNCTION trigger_update_timestamp();

-- Создание таблицы для пользовательских типов проектов
CREATE TABLE IF NOT EXISTS custom_project_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Индекс для быстрого поиска по user_id
CREATE INDEX IF NOT EXISTS idx_custom_project_types_user_id ON custom_project_types(user_id);

-- Правила безопасности RLS (Row Level Security)
-- Включаем RLS для всех таблиц
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_project_types ENABLE ROW LEVEL SECURITY;

-- Политики для time_entries
CREATE POLICY "Пользователи могут видеть только свои записи о времени"
ON time_entries FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Пользователи могут добавлять только свои записи о времени"
ON time_entries FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Пользователи могут изменять только свои записи о времени"
ON time_entries FOR UPDATE
USING (auth.uid()::text = user_id);

CREATE POLICY "Пользователи могут удалять только свои записи о времени"
ON time_entries FOR DELETE
USING (auth.uid()::text = user_id);

-- Политики для user_settings
CREATE POLICY "Пользователи могут видеть только свои настройки"
ON user_settings FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Пользователи могут добавлять только свои настройки"
ON user_settings FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Пользователи могут изменять только свои настройки"
ON user_settings FOR UPDATE
USING (auth.uid()::text = user_id);

-- Политики для custom_project_types
CREATE POLICY "Пользователи могут видеть только свои типы проектов"
ON custom_project_types FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Пользователи могут добавлять только свои типы проектов"
ON custom_project_types FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Пользователи могут изменять только свои типы проектов"
ON custom_project_types FOR UPDATE
USING (auth.uid()::text = user_id);

CREATE POLICY "Пользователи могут удалять только свои типы проектов"
ON custom_project_types FOR DELETE
USING (auth.uid()::text = user_id); 