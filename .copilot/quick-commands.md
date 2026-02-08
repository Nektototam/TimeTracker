# Быстрые команды для агентов

Шпаргалка с наиболее часто используемыми командами для разных сценариев.

## 🚀 Быстрый старт

```bash
# Начать работу с проектом
bd onboard                    # Инициализировать bd
npm install                   # Установить зависимости
npm run dev                   # Запустить dev server

# Найти работу
bd ready                      # Посмотреть доступные задачи
bd show <id>                  # Детали задачи
bd update <id> --status in_progress  # Взять в работу
```

## 📋 BD (Beads) Commands

```bash
bd onboard                    # Начальная настройка
bd ready                      # Найти доступную работу
bd show <id>                  # Показать детали issue
bd update <id> --status in_progress  # Начать работу
bd update <id> --status done  # Пометить как выполненное
bd close <id>                 # Закрыть issue
bd sync                       # Синхронизация с git
bd create "Название" --description "Описание"  # Создать issue
```

## 🔧 Development

### Frontend

```bash
# Разработка
npm run dev                   # Dev server (http://localhost:3000)
npm run dev -- --port 3001    # Dev на другом порту

# Проверка
npm run lint                  # Проверить стиль кода
npm run lint -- --fix         # Исправить стиль кода
npx tsc --noEmit             # Проверить TypeScript типы
npm test                      # Запустить тесты
npm test -- --watch          # Тесты в watch mode
npm test -- --coverage       # Тесты с покрытием

# Сборка
npm run build                 # Production build
npm start                     # Запустить production
```

### Backend API

```bash
cd apps/api

# Разработка
npm run dev                   # API dev server (обычно :3001)

# База данных (Prisma)
npx prisma migrate dev        # Создать и применить миграцию
npx prisma migrate dev --name название  # С названием
npx prisma migrate deploy     # Применить миграции (production)
npx prisma generate           # Сгенерировать клиент
npx prisma studio             # GUI для БД (http://localhost:5555)
npx prisma db push            # Sync schema без миграции (dev only)
npx prisma db seed            # Заполнить БД тестовыми данными

# Проверка
npm test                      # API тесты
npm run lint                  # Линтер
```

## ✅ Quality Gates

### Pre-commit

```bash
# Быстрая проверка перед коммитом (в корне)
npm run lint -- --fix && npx tsc --noEmit && npm test

# Или по шагам:
npm run lint -- --fix         # 1. Фикс стиля
npx tsc --noEmit             # 2. Проверка типов
npm test                      # 3. Тесты

# Если менялся API:
cd apps/api && npm test && cd ../..
```

### Pre-push

```bash
# Полная проверка перед push
npm run lint && npx tsc --noEmit && npm test && npm run build

# Или используя Task:
task test                     # Если настроен Taskfile
```

## 🧪 Testing

```bash
# Все тесты
npm test                      # Запустить все тесты

# Конкретные тесты
npm test -- Component.test    # Один файл
npm test -- --watch          # Watch mode
npm test -- --coverage       # С покрытием
npm test -- --verbose        # Подробный вывод

# Фильтры
npm test -- --testNamePattern="should render"
npm test -- src/components   # Тесты в директории

# Отладка
npm test -- --runInBand      # Последовательно (для отладки)
npm test -- --detectOpenHandles  # Найти утечки

# Очистка
npm test -- --clearCache     # Очистить кэш Jest

# API тесты
cd apps/api && npm test
```

## 📦 Dependencies

```bash
# Установить зависимость
npm install package-name      # Prod dependency
npm install -D package-name   # Dev dependency

# Обновить
npm update                    # Обновить все (minor)
npm update package-name       # Обновить конкретный
npm outdated                  # Показать устаревшие

# Аудит безопасности
npm audit                     # Показать уязвимости
npm audit fix                # Автоматически исправить

# Очистка
rm -rf node_modules package-lock.json
npm install                   # Переустановка
```

## 🗄️ Database (Prisma)

```bash
cd apps/api

# Разработка
npx prisma migrate dev        # Создать миграцию
npx prisma migrate dev --name add_users
npx prisma db push            # Sync без миграции (dev)
npx prisma studio             # GUI браузер

# Production
npx prisma migrate deploy     # Применить миграции
npx prisma generate           # Обновить клиент

# Утилиты
npx prisma format             # Форматировать schema
npx prisma validate           # Валидировать schema
npx prisma db seed            # Seed данными

# Сброс (ОСТОРОЖНО!)
npx prisma migrate reset      # Удалить БД и пересоздать
```

## 🌿 Git Workflow

### Базовые команды

```bash
# Проверка статуса
git status                    # Статус изменений
git diff                      # Что изменилось
git diff --staged            # Что в stage

# Коммит
git add .                     # Добавить все
git add file.ts              # Добавить файл
git commit -m "feat: описание"  # Коммит
git commit --amend           # Изменить последний коммит

# История
git log                       # История коммитов
git log --oneline            # Краткая история
git log --graph              # С графом
```

### Ветки

```bash
# Создание и переключение
git checkout -b feature/название  # Создать ветку
git checkout main             # Вернуться на main
git branch                    # Список веток
git branch -d feature/название  # Удалить ветку

# Слияние
git merge feature/название    # Влить ветку в текущую
git rebase main              # Rebase на main
```

### Синхронизация

```bash
# Pull (получить изменения)
git pull                      # Pull с merge
git pull --rebase            # Pull с rebase (предпочтительно)

# Push (отправить изменения)
git push                      # Push в текущую ветку
git push origin branch-name  # Push в конкретную ветку
git push --force-with-lease  # Force push (безопасно)

# Fetch
git fetch origin             # Получить все ветки
git fetch --prune            # Получить и очистить удаленные
```

### Stash

```bash
# Сохранить изменения
git stash                     # Сохранить в stash
git stash save "message"     # С сообщением
git stash -u                 # Включая untracked

# Восстановить
git stash list               # Список stash
git stash pop                # Применить и удалить
git stash apply              # Применить без удаления
git stash apply stash@{0}    # Конкретный stash

# Управление
git stash drop               # Удалить последний
git stash clear              # Очистить все
```

## 🏁 Landing the Plane

```bash
# Полный workflow завершения сессии

# 1. Создать issues для оставшейся работы
bd create "TODO: описание"

# 2. Quality gates
npm run lint -- --fix
npx tsc --noEmit
npm test
npm run build                 # Если код менялся

# 3. Коммит всех изменений
git add .
git commit -m "feat: описание работы"

# 4. Синхронизация
git pull --rebase origin main

# 5. BD sync
bd sync

# 6. Push (ОБЯЗАТЕЛЬНО!)
git push origin main

# 7. Проверка
git status                    # Должно быть "up to date"

# 8. Обновить issues
bd update <id> --status done
bd close <id>
```

## 🔍 Поиск в коде

```bash
# grep
grep -r "searchTerm" src/     # Рекурсивный поиск
grep -r "function" src/ --include="*.ts"  # Только .ts
grep -rn "TODO" src/         # С номерами строк
grep -ri "useEffect" src/    # Case-insensitive

# find (файлы)
find src/ -name "*.test.ts"  # Найти тестовые файлы
find src/ -type f -name "*Component*"  # Компоненты
find src/ -mtime -7          # Файлы за последнюю неделю

# Поиск в git истории
git log --all --grep="feature"  # Поиск в сообщениях
git log -p --all -S "functionName"  # Поиск в коде
git blame file.ts            # Кто и когда менял строки
```

## 🐛 Отладка

```bash
# Логи процессов
npm run dev 2>&1 | tee dev.log  # Сохранить логи в файл

# Node.js отладка
node --inspect-brk script.js  # С breakpoint
node --inspect script.js      # Без breakpoint

# TypeScript проверка
npx tsc --noEmit --pretty     # Красивый вывод
npx tsc --noEmit --listFiles  # Список проверяемых файлов

# Jest отладка
npm test -- --runInBand --verbose
node --inspect-brk node_modules/.bin/jest --runInBand

# Prisma отладка
DEBUG=* npx prisma migrate dev  # Все логи
DEBUG=prisma:* npm run dev      # Prisma логи в dev

# Build отладка
npm run build -- --debug      # Next.js debug build
```

## 🧹 Очистка

```bash
# Очистка кэшей
rm -rf .next                  # Next.js cache
rm -rf node_modules           # Node modules
rm -rf coverage               # Test coverage
npm cache clean --force       # npm cache

# Git очистка
git clean -fd                 # Удалить untracked файлы
git clean -fdx                # Включая ignored
git prune                     # Очистить объекты
git remote prune origin       # Очистить удаленные ветки

# Полная переустановка
rm -rf node_modules package-lock.json
npm install
```

## 📊 Метрики и анализ

```bash
# Размер bundle
npm run build                 # В выводе показывает размеры

# Coverage
npm test -- --coverage        # Тестовое покрытие

# Dependencies
npm list --depth=0            # Список зависимостей
npm list package-name         # Дерево зависимости
npx depcheck                  # Неиспользуемые зависимости

# TypeScript
npx tsc --noEmit --listFiles  # Что проверяется
npx tsc --extendedDiagnostics # Детальная информация

# Code complexity (если установлен)
npx complexity src/**/*.ts    # Сложность кода
```

## 🚢 Deployment

```bash
# Netlify (Frontend)
netlify deploy                # Deploy preview
netlify deploy --prod        # Production deploy
netlify status               # Статус deployment

# Railway (API/Database)
# Обычно автоматический при push в main

# Manual production checks
npm run build                 # Build должен пройти
npm start                     # Проверка production локально
```

## 🔐 Environment Variables

```bash
# Локальная разработка
cp .env.example .env.local    # Создать .env.local
code .env.local              # Редактировать

# Переменные в коде
# Frontend (NEXT_PUBLIC_* доступны на клиенте)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Backend (доступны только на сервере)
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
```

## 💡 Useful One-Liners

```bash
# Найти большие файлы
find . -type f -size +1M

# Подсчитать строки кода
find src -name '*.ts' -o -name '*.tsx' | xargs wc -l

# Найти TODO
grep -rn "TODO" src/

# Удалить все node_modules
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

# Список изменений за последний день
git log --since="1 day ago" --oneline

# Кто чаще всего менял файл
git log --follow --format=%an file.ts | sort | uniq -c | sort -rn

# Размер репозитория
du -hs .git
```

## 📝 Commit Message Format

```bash
# Формат
<type>: <subject>

# Типы
feat:     # Новая фича
fix:      # Исправление бага
docs:     # Документация
style:    # Форматирование (без изменения логики)
refactor: # Рефакторинг
test:     # Тесты
chore:    # Вспомогательные задачи (deps, build, etc)

# Примеры
git commit -m "feat: add user authentication"
git commit -m "fix: correct timer calculation"
git commit -m "docs: update API documentation"
git commit -m "refactor: simplify state management"
git commit -m "test: add unit tests for Timer component"
git commit -m "chore: update dependencies"
```

## 🎯 Tasks (если используется Taskfile)

```bash
task                          # Список всех задач
task dev                      # Dev servers
task test                     # Запустить тесты
task build                    # Production build
task lint                     # Линтер
task clean                    # Очистка
```

## 🔧 VS Code Commands

```
Ctrl+Shift+P                  # Command Palette
Ctrl+P                        # Quick Open
Ctrl+Shift+F                  # Search in files
Ctrl+`                        # Toggle terminal
Ctrl+B                        # Toggle sidebar
F5                            # Start debugging

# TypeScript
Ctrl+Shift+P -> TypeScript: Restart TS Server

# Tasks
Ctrl+Shift+P -> Tasks: Run Task
```

## 📚 Documentation Links

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Prisma Docs](https://www.prisma.io/docs)
- [Fastify Docs](https://www.fastify.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

## 💾 Создать alias (опционально)

Добавьте в `~/.bashrc` или `~/.zshrc`:

```bash
# TimeTracker aliases
alias tt-dev="npm run dev"
alias tt-test="npm test"
alias tt-lint="npm run lint -- --fix"
alias tt-build="npm run build"
alias tt-check="npm run lint && npx tsc --noEmit && npm test"
alias tt-landing="npm run lint -- --fix && npx tsc --noEmit && npm test && git add . && git commit && git pull --rebase && bd sync && git push && git status"

# BD aliases
alias bdr="bd ready"
alias bds="bd show"
alias bdu="bd update"
alias bdc="bd close"
alias bdsy="bd sync"
```

Перезагрузите shell:

```bash
source ~/.bashrc  # или ~/.zshrc
```

Теперь можно использовать:

```bash
tt-dev      # вместо npm run dev
bdr         # вместо bd ready
tt-check    # полная проверка
```
