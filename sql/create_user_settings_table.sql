-- Удаляем таблицу, если она существует
DROP TABLE IF EXISTS public.user_settings;

-- Создание таблицы настроек пользователя
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pomodoro_work_time INTEGER NOT NULL DEFAULT 25,
  pomodoro_rest_time INTEGER NOT NULL DEFAULT 5,
  pomodoro_long_rest_time INTEGER NOT NULL DEFAULT 15,
  auto_start BOOLEAN NOT NULL DEFAULT false,
  round_times TEXT NOT NULL DEFAULT 'off',
  language TEXT NOT NULL DEFAULT 'ru',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Создаем функцию для проверки авторизации (версия для UUID)
CREATE OR REPLACE FUNCTION check_user_auth(check_user_id UUID) 
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id TEXT;
BEGIN
  -- Получаем текущий ID пользователя из контекста JWT
  current_user_id := current_setting('request.jwt.claims', true)::json->>'sub';
  
  -- Проверяем соответствие текущего пользователя и проверяемого ID 
  RETURN current_user_id = check_user_id::TEXT;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем функцию для проверки авторизации (версия для TEXT)
CREATE OR REPLACE FUNCTION check_user_auth(check_user_id TEXT) 
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id TEXT;
BEGIN
  -- Получаем текущий ID пользователя из контекста JWT
  current_user_id := current_setting('request.jwt.claims', true)::json->>'sub';
  
  -- Проверяем соответствие текущего пользователя и проверяемого ID 
  RETURN current_user_id = check_user_id;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Политики безопасности RLS (Row Level Security)
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Удаляем существующие политики, если они есть
DROP POLICY IF EXISTS "Users can read their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;

-- Пробуем применить явное приведение типов в политиках
-- Политика на чтение: пользователь может видеть только свои настройки
CREATE POLICY "Users can read their own settings"
ON public.user_settings
FOR SELECT
USING (check_user_auth(user_id::TEXT));

-- Политика на обновление: пользователь может обновлять только свои настройки
CREATE POLICY "Users can update their own settings"
ON public.user_settings
FOR UPDATE
USING (check_user_auth(user_id::TEXT));

-- Политика на создание: пользователь может создавать настройки только для себя
CREATE POLICY "Users can insert their own settings"
ON public.user_settings
FOR INSERT
WITH CHECK (check_user_auth(user_id::TEXT));

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Индекс для быстрого поиска по user_id
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- Комментарии к таблице и полям
COMMENT ON TABLE public.user_settings IS 'Хранит настройки пользователей, синхронизируемые между устройствами';
COMMENT ON COLUMN public.user_settings.pomodoro_work_time IS 'Длительность рабочего периода в минутах';
COMMENT ON COLUMN public.user_settings.pomodoro_rest_time IS 'Длительность периода отдыха в минутах';
COMMENT ON COLUMN public.user_settings.pomodoro_long_rest_time IS 'Длительность длинного отдыха в минутах';
COMMENT ON COLUMN public.user_settings.auto_start IS 'Автоматически начинать следующий период';
COMMENT ON COLUMN public.user_settings.round_times IS 'Округление времени (off, 5min, 10min, 15min)';
COMMENT ON COLUMN public.user_settings.language IS 'Язык интерфейса (ru, en)'; 