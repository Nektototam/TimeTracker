# Template: Новая фича

Используйте этот шаблон при разработке новой функциональности.

## Информация о фиче

**Название фичи**: [Краткое название]

**Описание**: [Что делает фича]

**Приоритет**: [ ] High [ ] Medium [ ] Low

**Тип**: [ ] Frontend [ ] Backend [ ] Full-stack [ ] Infrastructure

**Оценка времени**: [часы/дни]

## Требования

### Функциональные требования

- [ ] Требование 1
- [ ] Требование 2
- [ ] Требование 3

### Нефункциональные требования

- [ ] Производительность
- [ ] Доступность (a11y)
- [ ] Безопасность
- [ ] Мобильная адаптация

## Критерии приемки

- [ ] Критерий 1
- [ ] Критерий 2
- [ ] Критерий 3

## Технический план

### Backend (если нужно)

#### Модели данных

```typescript
// Prisma schema
model NewFeature {
  id        String   @id @default(uuid())
  userId    String
  name      String
  value     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### API эндпоинты

- [ ] `GET /api/features` - Получить список
- [ ] `GET /api/features/:id` - Получить по ID
- [ ] `POST /api/features` - Создать
- [ ] `PUT /api/features/:id` - Обновить
- [ ] `DELETE /api/features/:id` - Удалить

#### Миграции

- [ ] Создать миграцию: `npx prisma migrate dev --name add_feature`
- [ ] Применить миграцию: `npx prisma migrate deploy`

### Frontend

#### Компоненты

- [ ] `FeatureList.tsx` - Список фич
- [ ] `FeatureItem.tsx` - Элемент списка
- [ ] `FeatureForm.tsx` - Форма создания/редактирования
- [ ] `FeatureDetails.tsx` - Детальный просмотр

#### Hooks

- [ ] `useFeatures()` - Получение списка
- [ ] `useFeature(id)` - Получение по ID
- [ ] `useCreateFeature()` - Создание
- [ ] `useUpdateFeature()` - Обновление
- [ ] `useDeleteFeature()` - Удаление

#### Страницы

- [ ] `app/features/page.tsx` - Главная страница фичи
- [ ] `app/features/[id]/page.tsx` - Детальная страница

#### Локализация

- [ ] Добавить переводы в `public/locales/ru/common.json`
- [ ] Добавить переводы в `public/locales/en/common.json`
- [ ] Добавить переводы в `public/locales/he/common.json`

### Тестирование

#### Backend тесты

- [ ] Unit тесты API эндпоинтов
- [ ] Integration тесты с БД
- [ ] Тесты валидации

#### Frontend тесты

- [ ] Unit тесты компонентов
- [ ] Integration тесты с API
- [ ] E2E тесты (опционально)

## Workflow

### Шаг 1: Подготовка

```bash
# Создать issue
bd create "Feature: [название]"

# Взять в работу
bd update <issue-id> --status in_progress

# Создать ветку
git checkout -b feature/[название]
```

### Шаг 2: Backend разработка

```bash
cd apps/api

# 1. Обновить schema.prisma
# 2. Создать миграцию
npx prisma migrate dev --name add_feature_name

# 3. Создать эндпоинты в src/routes/
# 4. Добавить валидацию с Zod
# 5. Написать тесты
npm test

# 6. Запустить API
npm run dev
```

#### Чеклист Backend

- [ ] Prisma модели созданы
- [ ] Миграции применены
- [ ] API эндпоинты реализованы
- [ ] Валидация добавлена
- [ ] Авторизация настроена
- [ ] Тесты написаны и проходят
- [ ] API документирован

### Шаг 3: Frontend разработка

```bash
# В корне проекта

# 1. Создать типы в src/types/
# 2. Создать service в src/lib/
# 3. Создать hooks в src/hooks/queries/
# 4. Создать компоненты в src/components/
# 5. Создать страницы в src/app/
# 6. Добавить локализацию
# 7. Написать тесты
npm test

# 8. Запустить dev server
npm run dev
```

#### Чеклист Frontend

- [ ] TypeScript типы определены
- [ ] API клиент создан
- [ ] React Query hooks созданы
- [ ] Компоненты реализованы
- [ ] Страницы созданы
- [ ] Локализация добавлена
- [ ] Стили применены (Tailwind)
- [ ] Тесты написаны и проходят
- [ ] UI проверен в браузере

### Шаг 4: Интеграция и тестирование

```bash
# Запустить оба сервера
# Terminal 1: API
cd apps/api && npm run dev

# Terminal 2: Frontend
npm run dev

# Проверить интеграцию
# 1. Открыть браузер
# 2. Протестировать CRUD операции
# 3. Проверить обработку ошибок
# 4. Проверить локализацию
# 5. Проверить адаптивность
```

#### Чеклист интеграции

- [ ] API и Frontend взаимодействуют корректно
- [ ] CRUD операции работают
- [ ] Ошибки обрабатываются
- [ ] Локализация работает
- [ ] UI адаптивен
- [ ] Производительность приемлема

### Шаг 5: Quality Gates

```bash
# 1. Линтер
npm run lint -- --fix

# 2. TypeScript
npx tsc --noEmit

# 3. Тесты
npm test

# 4. Покрытие
npm test -- --coverage
# Цель: > 80%

# 5. Build
npm run build

# 6. Production тест
npm start
# Проверить в браузере
```

#### Quality Checklist

- [ ] Линтер без ошибок
- [ ] TypeScript без ошибок
- [ ] Все тесты проходят
- [ ] Покрытие > 80%
- [ ] Production build успешен
- [ ] Production работает корректно

### Шаг 6: Документация

- [ ] Обновить README.md (если нужно)
- [ ] Добавить JSDoc комментарии к функциям
- [ ] Добавить комментарии к сложному коду
- [ ] Обновить API документацию
- [ ] Создать changelog entry (если ведется)

### Шаг 7: Code Review (self-review)

#### Architecture Review

- [ ] Архитектура соответствует паттернам проекта
- [ ] Нет дублирования кода
- [ ] Код переиспользуемый
- [ ] Разделение ответственности соблюдено

#### Code Quality Review

- [ ] Код читаемый и понятный
- [ ] Имена переменных/функций осмысленные
- [ ] Нет магических чисел/строк
- [ ] Обработка edge cases

#### Security Review

- [ ] Валидация входных данных
- [ ] Авторизация проверяется
- [ ] Нет SQL injection
- [ ] Нет XSS уязвимостей

#### Performance Review

- [ ] Нет ненужных re-renders
- [ ] Запросы к БД оптимальны
- [ ] Нет memory leaks
- [ ] Lazy loading где нужно

### Шаг 8: Завершение

```bash
# 1. Финальный коммит
git add .
git commit -m "feat: добавлена фича [название]

- Реализован backend с API эндпоинтами
- Созданы React компоненты
- Добавлены тесты
- Обновлена документация
"

# 2. Синхронизация с main
git fetch origin
git rebase origin/main

# 3. Разрешить конфликты (если есть)
# 4. Запустить тесты после rebase
npm test

# 5. Push
git push origin feature/[название]

# 6. Создать PR (если используется)
# или merge в main

# 7. Закрыть issue
bd close <issue-id>

# 8. Landing the Plane
bd sync
git checkout main
git pull --rebase
git merge feature/[название]
git push
git status  # Проверить, что все чисто
```

## Post-deployment

### Мониторинг

- [ ] Проверить логи на ошибки
- [ ] Проверить метрики производительности
- [ ] Проверить отзывы пользователей

### Оптимизация (если нужна)

- [ ] Оптимизировать медленные запросы
- [ ] Улучшить UI/UX на основе фидбека
- [ ] Добавить недостающие тесты

## Заметки

[Добавьте сюда любые важные заметки, решения, или ссылки]

---

## Пример структуры файлов

```
apps/api/src/routes/features.ts
apps/api/src/__tests__/features.test.ts
src/types/feature.ts
src/lib/featureService.ts
src/hooks/queries/useFeatures.ts
src/components/FeatureList.tsx
src/components/FeatureItem.tsx
src/components/FeatureForm.tsx
src/components/__tests__/FeatureList.test.tsx
src/app/features/page.tsx
src/app/features/[id]/page.tsx
public/locales/ru/common.json (обновлен)
public/locales/en/common.json (обновлен)
```

## Полезные команды

```bash
# Быстрая проверка
npm run lint && npx tsc --noEmit && npm test

# Посмотреть покрытие
npm test -- --coverage

# Посмотреть БД
cd apps/api && npx prisma studio

# Запустить оба сервера
# В разных терминалах:
cd apps/api && npm run dev
npm run dev
```
