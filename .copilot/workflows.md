# Workflows для проекта TimeTracker

Типовые рабочие процессы и сценарии для агентов.

## Оглавление

- [Ежедневная разработка](#ежедневная-разработка)
- [Новая фича](#новая-фича)
- [Исправление бага](#исправление-бага)
- [Рефакторинг](#рефакторинг)
- [Обновление зависимостей](#обновление-зависимостей)
- [Релиз](#релиз)

---

## Ежедневная разработка

### Начало рабочего дня

```bash
# 1. Синхронизация с репозиторием
git checkout main
git pull --rebase origin main

# 2. Проверить задачи
bd ready
bd show <issue-id>

# 3. Взять задачу в работу
bd update <issue-id> --status in_progress

# 4. Создать ветку (если нужно)
git checkout -b feature/название-задачи

# 5. Установить зависимости (если были изменения)
npm install

# 6. Запустить dev сервер
npm run dev
```

### В процессе работы

```bash
# Частые коммиты
git add .
git commit -m "feat: промежуточный прогресс"

# Проверка качества
npm run lint
npx tsc --noEmit
npm test

# Синхронизация с главной веткой (периодически)
git fetch origin
git rebase origin/main
```

### Конец рабочего дня (Landing the Plane)

```bash
# 1. Создать issues для незавершенной работы
bd create "TODO: доделать фичу X"

# 2. Запустить quality gates
npm run lint -- --fix
npx tsc --noEmit
npm test
npm run build

# 3. Закоммитить все изменения
git add .
git commit -m "feat: описание сделанного"

# 4. Синхронизация и push
git pull --rebase origin main
bd sync
git push origin feature/название

# 5. Обновить статус задач
bd update <issue-id> --status done
bd close <issue-id>

# 6. Проверка
git status  # Должно быть чисто

# 7. Документирование
# Оставить комментарий в issue о прогрессе
```

---

## Новая фича

### Фаза 1: Планирование

```bash
# 1. Создать issue
bd create "Реализовать фичу: название" \
  --description "Описание фичи, требования, критерии приемки"

# 2. Взять в работу
bd update <issue-id> --status in_progress

# 3. Создать ветку
git checkout -b feature/название-фичи

# 4. Изучить код
# - Найти связанные компоненты
# - Проверить API эндпоинты
# - Посмотреть похожие фичи
```

### Фаза 2: Backend (если нужно)

```bash
# 1. Обновить Prisma схему
cd apps/api
# Отредактировать prisma/schema.prisma

# 2. Создать миграцию
npx prisma migrate dev --name add_feature_name

# 3. Сгенерировать Prisma клиент
npx prisma generate

# 4. Создать API эндпоинты
# - apps/api/src/routes/featureName.ts
# - Реализовать CRUD операции
# - Добавить валидацию Zod
# - Добавить авторизацию

# 5. Написать тесты для API
# - apps/api/src/__tests__/featureName.test.ts

# 6. Запустить API
npm run dev

# 7. Проверить в Postman или через curl
curl -X GET http://localhost:3001/api/feature
```

### Фаза 3: Frontend

```bash
# 1. Создать типы
# src/types/featureName.ts
export interface Feature {
  id: string;
  name: string;
  // ...
}

# 2. Создать API клиент
# src/lib/featureService.ts
export async function getFeatures(): Promise<Feature[]> {
  // Реализация
}

# 3. Создать React Query хук
# src/hooks/queries/useFeatures.ts
export function useFeatures() {
  return useQuery({
    queryKey: ['features'],
    queryFn: getFeatures,
  });
}

# 4. Создать компоненты
# src/components/FeatureList.tsx
# src/components/FeatureItem.tsx
# src/components/FeatureForm.tsx

# 5. Добавить страницу (если нужна)
# src/app/features/page.tsx

# 6. Добавить локализацию
# public/locales/ru/common.json
# public/locales/en/common.json

# 7. Написать тесты
# src/components/__tests__/FeatureList.test.tsx
npm test -- FeatureList.test.tsx

# 8. Проверить в браузере
npm run dev
# Открыть http://localhost:3000/features
```

### Фаза 4: Проверка качества

```bash
# 1. Запустить линтер
npm run lint -- --fix

# 2. Проверить TypeScript
npx tsc --noEmit

# 3. Запустить все тесты
npm test

# 4. Проверить покрытие
npm test -- --coverage

# 5. Проверить сборку
npm run build

# 6. Запустить production локально
npm start
# Проверить, что все работает
```

### Фаза 5: Документирование

```bash
# 1. Обновить README (если нужно)
# 2. Добавить комментарии в код
# 3. Обновить docs/ (если нужно)
# 4. Добавить changelog (если ведется)
```

### Фаза 6: Завершение

```bash
# 1. Финальный коммит
git add .
git commit -m "feat: добавлена фича название"

# 2. Синхронизация с main
git fetch origin
git rebase origin/main

# 3. Push
git push origin feature/название

# 4. Создать PR (если используется)
# или merge в main

# 5. Закрыть issue
bd close <issue-id>

# 6. Landing the Plane
bd sync
git push origin main
git status
```

---

## Исправление бага

### Фаза 1: Воспроизведение

```bash
# 1. Создать issue
bd create "Bug: описание бага" \
  --description "Шаги воспроизведения, ожидаемое и фактическое поведение"

# 2. Взять в работу
bd update <issue-id> --status in_progress

# 3. Создать ветку
git checkout -b fix/название-бага

# 4. Воспроизвести баг
# - Следовать шагам из issue
# - Понять, где ломается

# 5. Добавить failing test
# Написать тест, который падает из-за бага
npm test -- --watch
```

### Фаза 2: Диагностика

```bash
# 1. Найти код, вызывающий баг
# - Использовать grep
grep -r "функция" src/

# - Использовать semantic search
# Найти связанные файлы

# 2. Понять причину
# - Добавить console.log для отладки
# - Использовать debugger
# - Проверить типы TypeScript

# 3. Спланировать исправление
# - Минимальное изменение
# - Не ломать существующую функциональность
```

### Фаза 3: Исправление

```bash
# 1. Внести изменения
# Исправить код

# 2. Проверить, что тест проходит
npm test

# 3. Проверить регрессию
npm test  # Все тесты должны пройти

# 4. Проверить в браузере
npm run dev
# Вручную проверить исправление
```

### Фаза 4: Завершение

```bash
# 1. Удалить console.log
# 2. Проверить качество
npm run lint -- --fix
npx tsc --noEmit
npm test

# 3. Коммит
git add .
git commit -m "fix: исправлен баг с описанием"

# 4. Push и закрытие issue
git push origin fix/название
bd close <issue-id>

# 5. Landing the Plane
```

---

## Рефакторинг

### Подготовка

```bash
# 1. Создать issue
bd create "Refactor: описание рефакторинга"

# 2. Создать ветку
git checkout -b refactor/название

# 3. Убедиться, что есть тесты
npm test -- --coverage
# Покрытие должно быть достаточным

# 4. Если тестов нет - добавить
# Написать тесты для текущего поведения
```

### Рефакторинг

```bash
# 1. Выполнить рефакторинг
# - Маленькими шагами
# - После каждого шага запускать тесты

# 2. Проверять тесты после каждого изменения
npm test -- --watch

# 3. Коммитить часто
git add .
git commit -m "refactor: шаг 1"
# ... продолжать

# 4. Обновить документацию
# Если изменились публичные API
```

### Проверка

```bash
# 1. Все тесты должны проходить
npm test

# 2. Поведение не изменилось
# Вручную проверить в браузере

# 3. TypeScript без ошибок
npx tsc --noEmit

# 4. Линтер
npm run lint

# 5. Build
npm run build
```

---

## Обновление зависимостей

### Проверка устаревших пакетов

```bash
# 1. Проверить устаревшие
npm outdated

# 2. Создать issue
bd create "Chore: обновить зависимости"

# 3. Создать ветку
git checkout -b chore/update-deps
```

### Обновление

```bash
# 1. Обновить patch версии (безопасно)
npm update

# 2. Обновить minor версии (обычно безопасно)
npm update --depth 3

# 3. Обновить major версии (осторожно!)
npm install package@latest

# 4. Проверить breaking changes
# Читать CHANGELOG каждого пакета

# 5. Запустить тесты
npm test

# 6. Проверить в браузере
npm run dev

# 7. Проверить build
npm run build
```

### Проблемы

```bash
# Если что-то сломалось:

# 1. Откатить
git checkout package.json package-lock.json
npm install

# 2. Обновлять по одному пакету
npm install package1@latest
npm test
# Если прошло - коммит
git add .
git commit -m "chore: update package1"

# 3. Следующий пакет
npm install package2@latest
npm test
# И так далее
```

---

## Релиз

### Подготовка

```bash
# 1. Убедиться, что все задачи закрыты
bd ready
# Не должно быть in_progress

# 2. Синхронизация
git checkout main
git pull --rebase origin main

# 3. Проверить статус
git status
# Должно быть чисто
```

### Pre-release проверки

```bash
# 1. Запустить Full Check
npm run lint
npx tsc --noEmit
npm test -- --coverage
npm run build

# 2. Проверить production локально
npm start
# Тестировать вручную основные функции

# 3. Проверить документацию
# README.md актуален?
# docs/ обновлены?
```

### Релиз

```bash
# 1. Обновить версию (если используется)
# npm version patch|minor|major

# 2. Создать тег
git tag -a v1.0.0 -m "Release version 1.0.0"

# 3. Push с тегами
git push origin main --tags

# 4. Deploy
# Netlify автоматически деплоит, или
netlify deploy --prod

# Railway автоматически деплоит API
```

### Post-release

```bash
# 1. Проверить production
# Открыть production URL
# Тестировать основные функции

# 2. Мониторинг ошибок
# Проверить логи
# Проверить метрики

# 3. Документировать релиз
# Создать CHANGELOG (если ведется)
# Обновить GitHub release notes
```

---

## Чеклисты

### Daily Checklist

- [ ] Синхронизация с main
- [ ] Проверка задач в bd
- [ ] Запуск dev сервера
- [ ] Частые коммиты
- [ ] Landing the Plane в конце дня

### Pre-commit Checklist

- [ ] Линтер без ошибок
- [ ] TypeScript без ошибок
- [ ] Тесты проходят
- [ ] Нет console.log
- [ ] Комментарии обновлены

### Pre-push Checklist

- [ ] Pre-commit прошел
- [ ] Build успешен
- [ ] bd sync выполнен
- [ ] Все issues обновлены

### Pre-release Checklist

- [ ] Все задачи закрыты
- [ ] Full Check прошел
- [ ] Production build протестирован локально
- [ ] Документация актуальна
- [ ] Breaking changes документированы
- [ ] Миграции БД готовы (если есть)

---

## Tips & Tricks

### Быстрые команды

```bash
# Алиасы в .bashrc или .zshrc
alias nrd="npm run dev"
alias nrt="npm test"
alias nrl="npm run lint -- --fix"
alias nrb="npm run build"

alias bdr="bd ready"
alias bds="bd sync"

# Функция для быстрого Landing the Plane
function landing() {
  npm run lint -- --fix && \
  npx tsc --noEmit && \
  npm test && \
  git add . && \
  git commit -m "$1" && \
  git pull --rebase && \
  bd sync && \
  git push && \
  git status
}

# Использование:
# landing "feat: добавлена новая фича"
```

### VS Code Tasks

Используйте встроенные tasks из `.vscode/tasks.json`:

- `Ctrl+Shift+P` -> `Tasks: Run Task`
- Выбрать нужную задачу

### Git Hooks

Можно настроить pre-commit hook:

```bash
# .git/hooks/pre-commit
#!/bin/sh
npm run lint && npx tsc --noEmit && npm test
```

### Watch режимы

```bash
# TypeScript watch
npx tsc --noEmit --watch

# Tests watch
npm test -- --watch

# Dev server (автоматический)
npm run dev
```
