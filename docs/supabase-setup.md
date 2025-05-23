# Настройка Supabase для TimeTracker

Этот документ содержит инструкции по настройке базы данных Supabase для приложения TimeTracker.

## Шаг 1: Создание проекта в Supabase

1. Перейдите на [app.supabase.com](https://app.supabase.com/) и войдите/зарегистрируйтесь
2. Нажмите на "New Project"
3. Введите название проекта (например, "timetracker")
4. Укажите безопасный пароль для базы данных
5. Выберите регион, ближайший к вашему местоположению
6. Нажмите "Create new project"

## Шаг 2: Настройка таблиц и правил безопасности

1. В проекте Supabase перейдите в раздел "SQL Editor"
2. Создайте новый запрос
3. Используйте SQL-скрипт из файла [`supabase-sql.md`](./supabase-sql.md)
4. Нажмите "Run" для выполнения SQL-скрипта

## Шаг 3: Настройка аутентификации

1. В Supabase перейдите в раздел "Authentication" -> "Providers"
2. Включите провайдеры аутентификации, которые вы хотите использовать (Email, Google и т.д.)
3. Для Email аутентификации можно настроить:
   - Confirm email (подтверждение email)
   - Enable auto confirm (автоматическое подтверждение, полезно для тестирования)

## Шаг 4: Получение API ключей

1. В Supabase перейдите в раздел "Settings" -> "API"
2. Скопируйте "URL" и "anon key"
3. Создайте в корне проекта файл `.env.local` на основе шаблона `.env.local.example`:

```
NEXT_PUBLIC_SUPABASE_URL=ваш_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_anon_key
```

## Шаг 5: Проверка работоспособности

1. Запустите приложение:
```bash
npm run dev
```

2. Проверьте, что данные сохраняются и загружаются из Supabase:
   - Запустите и остановите таймер на главной странице
   - Проверьте в Supabase (Table Editor -> time_entries), что запись добавилась

## Структура данных

### Таблица time_entries
Хранит записи о затраченном времени:
- id: уникальный идентификатор записи
- user_id: идентификатор пользователя
- project_type: тип проекта/работы
- start_time: время начала
- end_time: время окончания
- duration: длительность в миллисекундах
- description: описание (опционально)
- created_at: время создания записи

### Таблица user_settings
Хранит настройки пользователя:
- id: уникальный идентификатор
- user_id: идентификатор пользователя
- work_duration: длительность рабочего периода в минутах
- rest_duration: длительность перерыва в минутах
- notifications_enabled: включены ли уведомления
- notification_sound: звук уведомления
- theme: тема оформления
- created_at: время создания
- updated_at: время обновления

### Таблица custom_project_types
Хранит пользовательские типы проектов:
- id: уникальный идентификатор
- user_id: идентификатор пользователя
- name: название типа проекта
- created_at: время создания

## Правила безопасности (RLS)

В Supabase настроены политики безопасности на уровне строк (Row Level Security), которые обеспечивают:
- Пользователь может видеть, изменять и удалять только свои данные
- Информация о времени, настройки и типы проектов защищены от доступа других пользователей 