-- Скрипт инициализации таблицы custom_project_types

-- Убедимся, что расширение для UUID доступно
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Создаем схему, если она еще не создана
CREATE SCHEMA IF NOT EXISTS public;

-- Удалим таблицу, если существует, для чистой установки
DROP TABLE IF EXISTS public.custom_project_types;

-- Создаем таблицу пользовательских типов проектов
CREATE TABLE public.custom_project_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Создаем индекс для быстрого поиска по пользователю
CREATE INDEX idx_custom_project_types_user_id ON public.custom_project_types(user_id);

-- Включаем Row Level Security
ALTER TABLE public.custom_project_types ENABLE ROW LEVEL SECURITY;

-- Создаем политики для доступа к записям
-- Просмотр: пользователь может видеть только свои типы проектов
DROP POLICY IF EXISTS "Users can view own project types" ON public.custom_project_types;
CREATE POLICY "Users can view own project types" 
ON public.custom_project_types 
FOR SELECT 
USING (
   user_id = (SELECT auth.uid())
);

-- Создание: пользователь может создавать только свои типы проектов
DROP POLICY IF EXISTS "Users can create own project types" ON public.custom_project_types;
CREATE POLICY "Users can create own project types" 
ON public.custom_project_types 
FOR INSERT 
WITH CHECK (
   user_id = (SELECT auth.uid())
);

-- Обновление: пользователь может обновлять только свои типы проектов
DROP POLICY IF EXISTS "Users can update own project types" ON public.custom_project_types;
CREATE POLICY "Users can update own project types" 
ON public.custom_project_types 
FOR UPDATE 
USING (
   user_id = (SELECT auth.uid())
);

-- Удаление: пользователь может удалять только свои типы проектов
DROP POLICY IF EXISTS "Users can delete own project types" ON public.custom_project_types;
CREATE POLICY "Users can delete own project types" 
ON public.custom_project_types 
FOR DELETE 
USING (
   user_id = (SELECT auth.uid())
);

-- Добавим комментарии для документации
COMMENT ON TABLE public.custom_project_types IS 'Пользовательские типы проектов для трекинга времени';
COMMENT ON COLUMN public.custom_project_types.id IS 'Уникальный идентификатор';
COMMENT ON COLUMN public.custom_project_types.user_id IS 'ID пользователя-владельца';
COMMENT ON COLUMN public.custom_project_types.name IS 'Название типа проекта';
COMMENT ON COLUMN public.custom_project_types.created_at IS 'Время создания';

-- Создаем триггер для обновления created_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.created_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp ON public.custom_project_types;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.custom_project_types
FOR EACH ROW
EXECUTE FUNCTION update_timestamp(); 