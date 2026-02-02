# Проектирование бэкенда (Fastify + Prisma)

Цель: заменить Supabase на собственный API и Postgres в Railway, сохранив функционал приложения.

## 1) Схема БД (предложение)

### users

- id (uuid, pk)
- email (text, unique, not null)
- password_hash (text, not null)
- created_at (timestamptz)
- updated_at (timestamptz)

### sessions (если сессии)

- id (uuid, pk)
- user_id (uuid, fk -> users.id)
- refresh_token (text, unique)
- user_agent (text)
- ip_address (text)
- expires_at (timestamptz)
- created_at (timestamptz)

### time_entries

- id (uuid, pk)
- user_id (uuid, fk -> users.id)
- project_type (text, not null)
- start_time (timestamptz, not null)
- end_time (timestamptz, not null)
- duration_ms (int, not null)
- description (text, nullable)
- time_limit_ms (int, nullable)
- created_at (timestamptz)

### user_settings

- id (uuid, pk)
- user_id (uuid, fk -> users.id, unique)
- pomodoro_work_time (int, default 25)
- pomodoro_rest_time (int, default 5)
- pomodoro_long_rest_time (int, default 15)
- auto_start (boolean, default false)
- round_times (text, default 'off')
- language (text, default 'ru')
- data_retention_period (int, default 3)
- created_at (timestamptz)
- updated_at (timestamptz)

### custom_project_types

- id (uuid, pk)
- user_id (uuid, fk -> users.id)
- name (text, not null)
- created_at (timestamptz)

Индексы:

- time_entries(user_id, start_time)
- custom_project_types(user_id, name)

## 2) API (REST) — минимальный набор

### Auth

- POST /auth/register
- POST /auth/login
- POST /auth/logout
- GET /auth/me
- POST /auth/refresh

### Time entries

- GET /time-entries?from=&to=
- POST /time-entries
- PATCH /time-entries/:id
- DELETE /time-entries/:id
- GET /time-entries/today

### Reports

- GET /reports?period=week|month|quarter&from=&to=

### Settings

- GET /settings
- PUT /settings
- POST /settings/cleanup

### Project types

- GET /project-types
- POST /project-types
- PATCH /project-types/:id
- DELETE /project-types/:id

## 3) Технические решения

- Fastify + pino (логирование)
- Prisma ORM + Migrate
- Zod (валидация DTO)
- Cookie-сессии или JWT (предпочтительно refresh-токены)

## 4) Следующие шаги

1) Утвердить схему БД и подход к auth (sessions vs JWT).
2) Сгенерировать prisma/schema.prisma и миграции.
3) Создать skeleton API (Fastify) и подключить Prisma.
4) Перевести frontend на API-клиент.
