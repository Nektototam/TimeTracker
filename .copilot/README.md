# .copilot - Настройки агентов для TimeTracker

Данная директория содержит конфигурацию агентов и навыки (skills) для эффективной работы над проектом TimeTracker.

## Структура

```
.copilot/
├── README.md           # Этот файл
├── agents.yml          # Конфигурация агентов и их ролей
├── skills.md           # Навыки и команды для работы
├── workflows.md        # Типовые рабочие процессы
└── templates/          # Шаблоны для разных типов задач
    ├── feature.md
    ├── bugfix.md
    ├── refactor.md
    └── review.md
```

## Файлы

### agents.yml

Определяет роли агентов:

- **Frontend Developer** - React, Next.js, TypeScript, Tailwind
- **Backend Developer** - API, Prisma, Database, JWT
- **DevOps & QA Engineer** - Testing, CI/CD, Deployment
- **Software Architect** - Architecture, Code Review, Tech Decisions
- **Product Manager** - Issue tracking, Planning, Progress tracking

Каждый агент имеет:

- Области экспертизы
- Зоны ответственности
- Пути к коду, с которым работает
- Команды для выполнения

### skills.md

Подробное руководство по навыкам:

- **Базовые навыки** - Git, BD (beads), TypeScript
- **Frontend навыки** - Next.js, React Query, Context API, Tailwind, i18next
- **Backend навыки** - Fastify, Prisma, JWT, SQL
- **DevOps навыки** - Jest, Environment, Build & Deploy
- **Архитектурные навыки** - Code Review, Рефакторинг, Performance, Документирование
- **Управление проектом** - Landing the Plane, Planning, Commit Standards

### workflows.md

Пошаговые инструкции для типовых сценариев:

- Ежедневная разработка
- Новая фича
- Исправление бага
- Рефакторинг
- Обновление зависимостей
- Релиз

Каждый workflow содержит точные команды и чеклисты.

## Как использовать

### Для агентов AI

Агенты должны:

1. Прочитать `agents.yml` для определения своей роли
2. Использовать `skills.md` как справочник команд
3. Следовать процессам из `workflows.md`
4. Применять шаблоны из `templates/` для задач

### Для разработчиков

Разработчики могут:

1. Понять структуру проектов через `agents.yml`
2. Найти нужные команды в `skills.md`
3. Следовать проверенным процессам из `workflows.md`
4. Использовать чеклисты для проверки работы

## Ключевые правила

### Landing the Plane (ОБЯЗАТЕЛЬНО!)

При завершении любой сессии работы:

```bash
# 1. Создать issues для оставшейся работы
bd create "TODO: описание"

# 2. Quality gates
npm run lint -- --fix
npx tsc --noEmit
npm test
npm run build  # если менялся код

# 3. Обновить issues
bd close <id>

# 4. PUSH (ОБЯЗАТЕЛЬНО!)
git add .
git commit -m "feat: описание"
git pull --rebase
bd sync
git push
git status  # MUST show "up to date with origin"
```

**КРИТИЧНО**: Работа НЕ закончена, пока `git push` не выполнен успешно!

### Качество кода

Всегда проверять перед коммитом:

- ✅ `npm run lint -- --fix` - Линтер
- ✅ `npx tsc --noEmit` - TypeScript типы
- ✅ `npm test` - Тесты
- ✅ `npm run build` - Production сборка

### BD (Beads) Issue Tracking

Использовать bd для всех задач:

```bash
bd onboard              # Старт
bd ready                # Найти работу
bd show <id>            # Детали
bd update <id> --status in_progress  # Взять в работу
bd close <id>           # Закрыть
bd sync                 # Синхронизация с git
```

## Специализированные агенты

### Frontend Agent

Работает с:

- `src/app/**` - Next.js pages
- `src/components/**` - React компоненты
- `src/hooks/**` - Custom hooks
- `src/contexts/**` - React contexts

Команды:

```bash
npm run dev             # Dev server
npm test -- components  # Тесты компонентов
npx tsc --noEmit       # Проверка типов
```

### Backend Agent

Работает с:

- `apps/api/**` - Fastify API
- `sql/**` - SQL скрипты
- `db-init.sql` - Инициализация БД

Команды:

```bash
cd apps/api
npm run dev                    # API server
npx prisma migrate dev         # Миграции
npx prisma generate            # Генерация клиента
npx prisma studio              # GUI для БД
```

### DevOps Agent

Работает с:

- `.github/workflows/**` - CI/CD
- `scripts/**` - Скрипты автоматизации
- `netlify.toml` - Деплой конфигурация

Команды:

```bash
npm test -- --coverage         # Тесты с покрытием
npm run build                  # Production build
netlify deploy --prod          # Деплой
```

## Workflows

### Новая фича

1. `bd create "Feature: название"`
2. `git checkout -b feature/название`
3. Разработка (backend → frontend)
4. Тесты
5. Quality gates
6. Landing the Plane

### Исправление бага

1. `bd create "Bug: описание"`
2. `git checkout -b fix/название`
3. Воспроизвести баг
4. Написать failing test
5. Исправить
6. Проверить регрессию
7. Landing the Plane

### Code Review

1. Проверить архитектуру
2. Проверить стиль кода
3. Проверить тесты
4. Проверить документацию
5. Запустить quality gates
6. Одобрить или запросить изменения

## Чеклисты

### Pre-commit

- [ ] Линтер пройден
- [ ] TypeScript без ошибок
- [ ] Тесты проходят
- [ ] Нет console.log

### Pre-push

- [ ] Pre-commit пройден
- [ ] Build успешен
- [ ] bd sync выполнен
- [ ] Issues обновлены

### Pre-release

- [ ] Все задачи закрыты
- [ ] Full Check пройден
- [ ] Production протестирован
- [ ] Документация актуальна

## Troubleshooting

### Проблемы с зависимостями

```bash
rm -rf node_modules package-lock.json
npm install
```

### Проблемы с Prisma

```bash
cd apps/api
npx prisma generate
```

### Проблемы с TypeScript

```bash
# В VS Code: Ctrl+Shift+P -> TypeScript: Restart TS Server
rm -rf .next
```

### Проблемы с тестами

```bash
npm test -- --clearCache
```

## Полезные ссылки

- [AGENTS.md](../AGENTS.md) - Основные инструкции для агентов
- [docs/engineering-rules.md](../docs/engineering-rules.md) - Инженерные правила
- [docs/project-management.md](../docs/project-management.md) - Управление проектом
- [README.md](../README.md) - Основная документация проекта

## Обновление конфигурации

При внесении изменений в конфигурацию агентов:

1. Обновить соответствующий файл
2. Протестировать с агентом
3. Документировать изменения
4. Коммитить с префиксом `docs:`

```bash
git commit -m "docs: update agent configuration"
```

## Feedback

Если нашли улучшения для конфигурации агентов:

1. Создать issue в bd
2. Описать проблему/улучшение
3. Предложить решение
4. Обсудить с командой
