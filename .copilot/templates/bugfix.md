# Template: Исправление бага

Используйте этот шаблон при исправлении багов.

## Информация о баге

**Название**: [Краткое описание бага]

**Приоритет**: [ ] Critical [ ] High [ ] Medium [ ] Low

**Затронутые области**: [ ] Frontend [ ] Backend [ ] Database [ ] Infrastructure

**Обнаружен в версии**: [версия]

**Среда**: [ ] Production [ ] Staging [ ] Development [ ] Local

## Описание бага

### Ожидаемое поведение

[Что должно происходить]

### Фактическое поведение

[Что происходит на самом деле]

### Шаги воспроизведения

1. Шаг 1
2. Шаг 2
3. Шаг 3

### Скриншоты/Логи

```
[Вставить логи ошибок или ссылки на скриншоты]
```

## Анализ

### Гипотеза о причине

[Предположение о том, что вызывает баг]

### Затронутые компоненты

- [ ] Компонент 1: `путь/к/файлу.ts`
- [ ] Компонент 2: `путь/к/файлу.ts`
- [ ] Компонент 3: `путь/к/файлу.ts`

### Связанные issues/PRs

- Issue #[номер]
- PR #[номер]

## Workflow

### Шаг 1: Подготовка

```bash
# Создать issue
bd create "Bug: [описание]"

# Взять в работу
bd update <issue-id> --status in_progress

# Создать ветку
git checkout -b fix/[название-бага]
```

### Шаг 2: Воспроизведение

```bash
# Запустить dev сервер
npm run dev

# Или оба сервера, если full-stack баг
cd apps/api && npm run dev  # Terminal 1
npm run dev                  # Terminal 2
```

#### Чеклист воспроизведения

- [ ] Баг воспроизведен локально
- [ ] Шаги воспроизведения подтверждены
- [ ] Определено точное место возникновения
- [ ] Собраны логи/traceback

### Шаг 3: Написать failing test

```bash
# Создать или обновить тест, который ПАДАЕТ из-за бага
# Это предотвратит регрессию в будущем
```

#### Frontend test example

```typescript
// src/components/__tests__/BuggyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { BuggyComponent } from '../BuggyComponent';

describe('BuggyComponent', () => {
  it('should handle edge case correctly', () => {
    // Этот тест должен ПАДАТЬ до исправления
    render(<BuggyComponent value={null} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });
});
```

#### Backend test example

```typescript
// apps/api/src/__tests__/buggyRoute.test.ts
import { describe, it, expect } from "@jest/globals";
import { build } from "../app";

describe("Buggy Route", () => {
  it("should handle missing parameter", async () => {
    const app = await build();

    // Этот тест должен ПАДАТЬ до исправления
    const response = await app.inject({
      method: "GET",
      url: "/api/resource",
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toHaveProperty("error");
  });
});
```

```bash
# Запустить тест - должен упасть
npm test -- BuggyComponent.test.tsx
```

#### Чеклист тестирования

- [ ] Failing test написан
- [ ] Тест падает с той же ошибкой, что и баг
- [ ] Тест изолирован (не зависит от других тестов)

### Шаг 4: Диагностика

#### Поиск причины

```bash
# Найти код, связанный с багом
grep -r "функция_или_компонент" src/

# Или использовать semantic search в VS Code
# Ctrl+Shift+F
```

#### Отладка

```typescript
// Временно добавить логирование
console.log("DEBUG: variable value:", variable);
console.log("DEBUG: entering function with args:", args);

// Или использовать debugger
debugger;
```

```bash
# Проверить типы TypeScript
npx tsc --noEmit

# Проверить линтер
npm run lint
```

#### Анализ кода

- [ ] Найден код, вызывающий баг
- [ ] Понята причина бага
- [ ] Оценено влияние на другие части системы
- [ ] Проверены edge cases

### Шаг 5: Исправление

#### Варианты решения

**Вариант 1**: [Описание]

- Плюсы:
- Минусы:

**Вариант 2**: [Описание]

- Плюсы:
- Минусы:

**Выбранное решение**: Вариант [номер]

#### Реализация

```typescript
// Пример исправления (Frontend)
// БЫЛО:
function buggyFunction(data: any) {
  return data.property.value; // Ошибка: data.property может быть undefined
}

// СТАЛО:
function fixedFunction(data: Data | undefined): string {
  if (!data?.property) {
    return "default value";
  }
  return data.property.value;
}
```

```typescript
// Пример исправления (Backend)
// БЫЛО:
fastify.get("/api/resource/:id", async (request, reply) => {
  const resource = await prisma.resource.findUnique({
    where: { id: request.params.id },
  });
  return resource.data; // Ошибка: resource может быть null
});

// СТАЛО:
fastify.get("/api/resource/:id", async (request, reply) => {
  const resource = await prisma.resource.findUnique({
    where: { id: request.params.id },
  });

  if (!resource) {
    return reply.status(404).send({ error: "Resource not found" });
  }

  return resource.data;
});
```

#### Чеклист исправления

- [ ] Код исправлен
- [ ] Минимальные изменения (не рефакторинг всего)
- [ ] TypeScript типы корректны
- [ ] Edge cases обработаны

### Шаг 6: Проверка исправления

```bash
# 1. Запустить failing test - теперь должен проходить
npm test -- BuggyComponent.test.tsx

# 2. Запустить ВСЕ тесты - проверить регрессию
npm test

# 3. Вручную воспроизвести баг - должно быть исправлено
npm run dev
# Повторить шаги воспроизведения
```

#### Regression checklist

- [ ] Исходный баг исправлен
- [ ] Ранее написанный тест проходит
- [ ] Все другие тесты проходят
- [ ] Нет новых багов
- [ ] Связанная функциональность работает

### Шаг 7: Дополнительные тесты

```bash
# Добавить больше тестов для edge cases
```

#### Тесты для добавления

- [ ] Тест для null/undefined
- [ ] Тест для пустых значений
- [ ] Тест для граничных значений
- [ ] Тест для неожиданных типов
- [ ] Тест для асинхронных ошибок

### Шаг 8: Очистка

```typescript
// Удалить все console.log
// Удалить все debugger
// Удалить временный код
```

#### Чеклист очистки

- [ ] Удалены console.log
- [ ] Удалены debugger
- [ ] Удален временный/отладочный код
- [ ] Код отформатирован

### Шаг 9: Quality Gates

```bash
# 1. Линтер
npm run lint -- --fix

# 2. TypeScript
npx tsc --noEmit

# 3. Тесты
npm test

# 4. Build
npm run build

# 5. Production тест (опционально)
npm start
```

#### Quality checklist

- [ ] Линтер без ошибок
- [ ] TypeScript без ошибок
- [ ] Все тесты проходят
- [ ] Build успешен

### Шаг 10: Документация

- [ ] Обновить комментарии в коде
- [ ] Добавить JSDoc (если нужно)
- [ ] Обновить README (если нужно)
- [ ] Документировать решение (в issue)

### Шаг 11: Code Review (self)

#### Bug Fix Review Checklist

- [ ] Исправлен корневой причина, а не симптом
- [ ] Минимальные изменения в коде
- [ ] Добавлены тесты для предотвращения регрессии
- [ ] Все edge cases обработаны
- [ ] Нет новых багов
- [ ] Производительность не ухудшилась
- [ ] Код читаемый

### Шаг 12: Завершение

```bash
# 1. Финальный коммит
git add .
git commit -m "fix: исправлен баг [описание]

Проблема: [краткое описание проблемы]
Решение: [краткое описание решения]
Closes #[issue-id]
"

# 2. Синхронизация с main
git fetch origin
git rebase origin/main

# 3. Запустить тесты после rebase
npm test

# 4. Push
git push origin fix/[название]

# 5. Создать PR (если используется)
# или merge в main

# 6. Закрыть issue
bd close <issue-id>

# 7. Landing the Plane
bd sync
git checkout main
git pull --rebase
git merge fix/[название]
git push
```

## Верификация исправления

### Production Verification (после деплоя)

- [ ] Баг не воспроизводится в production
- [ ] Мониторинг не показывает новых ошибок
- [ ] Логи чистые
- [ ] Метрики в норме

### Post-fix review

- [ ] Проанализировать, почему баг возник
- [ ] Можно ли предотвратить подобные баги в будущем?
- [ ] Нужны ли дополнительные тесты?
- [ ] Нужно ли улучшить процесс разработки?

## Lessons Learned

### Что пошло не так?

[Анализ того, как баг попал в код]

### Как предотвратить в будущем?

- [ ] Добавить больше тестов
- [ ] Улучшить type safety
- [ ] Добавить валидацию
- [ ] Улучшить code review процесс
- [ ] Другое: [описание]

## Заметки

[Любые дополнительные заметки, ссылки, идеи]

---

## Типичные категории багов

### Null/Undefined errors

```typescript
// Использовать optional chaining
const value = data?.property?.value ?? "default";

// Использовать nullish coalescing
const result = maybeNull ?? defaultValue;

// Type guards
if (!data) return;
```

### Type errors

```typescript
// Строгая типизация
interface Data {
  id: string;
  value: number;
}

function processData(data: Data): void {
  // TypeScript поймает ошибки типов
}
```

### Async/Promise errors

```typescript
// Всегда обрабатывать ошибки
try {
  const result = await asyncOperation();
} catch (error) {
  console.error("Error:", error);
  // Обработка ошибки
}
```

### React state/lifecycle errors

```typescript
// Использовать useEffect правильно
useEffect(() => {
  let isMounted = true;

  fetchData().then((data) => {
    if (isMounted) {
      setData(data);
    }
  });

  return () => {
    isMounted = false;
  };
}, []);
```

### API/Database errors

```typescript
// Валидация входных данных
const schema = z.object({
  id: z.string().uuid(),
  value: z.number().positive(),
});

const data = schema.parse(input);
```

## Полезные команды

```bash
# Поиск в коде
grep -r "ошибка" src/

# Поиск в истории git (если баг был внесен недавно)
git log -p --all -- path/to/file.ts

# Посмотреть, когда строка была изменена
git blame path/to/file.ts

# Запустить конкретный тест
npm test -- путь/к/тесту

# Запустить тесты в watch mode
npm test -- --watch

# Проверить TypeScript
npx tsc --noEmit --pretty
```
