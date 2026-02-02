# Задачи и этапы (Backlog)

## Этап 1 — Бэкенд

- [ ] Утвердить схему БД и тип авторизации
- [ ] Создать prisma/schema.prisma
- [ ] Миграции для всех таблиц
- [ ] Базовый Fastify сервер
- [ ] Auth endpoints
- [ ] CRUD для time_entries
- [ ] CRUD для user_settings
- [ ] CRUD для custom_project_types
- [ ] Reports endpoint
- [ ] Rate-limit и валидация

## Этап 2 — Frontend

- [ ] Заменить supabase-js на API client
- [ ] Обновить AuthContext
- [ ] Реальные настройки
- [ ] Перевести отчеты на API
- [ ] Мигрировать UI на Shadcn (без кастомных компонентов)

## Этап 3 — Инфраструктура

- [ ] Railway: Postgres + Web
- [ ] Cron job на очистку данных
- [ ] Документация деплоя

## Этап 4 — Качество

- [ ] Тесты API (unit + integration)
- [ ] Базовые e2e сценарии (smoke)
- [ ] Набор метрик и логов
