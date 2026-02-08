# Skills для агентов проекта TimeTracker

## Оглавление

- [Базовые навыки](#базовые-навыки)
- [Frontend навыки](#frontend-навыки)
- [Backend навыки](#backend-навыки)
- [DevOps навыки](#devops-навыки)
- [Архитектурные навыки](#архитектурные-навыки)
- [Управление проектом](#управление-проектом)

---

## Базовые навыки

### Git Workflow

```bash
# Проверить статус
git status

# Создать новую ветку для фичи
git checkout -b feature/название-фичи

# Закоммитить изменения
git add .
git commit -m "feat: описание изменений"

# Синхронизация с main
git pull --rebase origin main

# Запушить изменения
git push origin feature/название-фичи
```

### BD (Beads) Issue Tracking

```bash
# Начать работу с bd
bd onboard

# Найти доступную работу
bd ready

# Посмотреть детали задачи
bd show <issue-id>

# Взять задачу в работу
bd update <issue-id> --status in_progress

# Закрыть задачу
bd close <issue-id>

# Синхронизировать с git
bd sync
```

### TypeScript

```typescript
// Строгая типизация
interface TimeEntry {
  id: string;
  projectId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  description?: string;
}

// Использование дженериков
function fetchData<T>(url: string): Promise<T> {
  return fetch(url).then((res) => res.json());
}

// Type guards
function isTimeEntry(obj: unknown): obj is TimeEntry {
  return (
    typeof obj === "object" && obj !== null && "id" in obj && "projectId" in obj
  );
}
```

---

## Frontend навыки

### Next.js App Router

```typescript
// app/dashboard/page.tsx - Server Component
export default async function DashboardPage() {
  const data = await fetchData(); // Fetch на сервере
  return <DashboardView data={data} />;
}

// app/dashboard/client-component.tsx - Client Component
'use client';
export default function ClientComponent() {
  const [state, setState] = useState();
  return <div>Interactive UI</div>;
}

// Layouts
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      {children}
    </div>
  );
}
```

### React Query

```typescript
// hooks/queries/useTimeEntries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useTimeEntries() {
  return useQuery({
    queryKey: ["timeEntries"],
    queryFn: fetchTimeEntries,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}

export function useAddTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addTimeEntry,
    onSuccess: () => {
      // Обновить кэш
      queryClient.invalidateQueries({ queryKey: ["timeEntries"] });
    },
  });
}
```

### Context API

```typescript
// contexts/TimerContext.tsx
'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

interface TimerContextType {
  isRunning: boolean;
  startTimer: () => void;
  stopTimer: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [isRunning, setIsRunning] = useState(false);

  return (
    <TimerContext.Provider value={{
      isRunning,
      startTimer: () => setIsRunning(true),
      stopTimer: () => setIsRunning(false),
    }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) throw new Error('useTimer must be used within TimerProvider');
  return context;
}
```

### Tailwind CSS

```typescript
// components/Button.tsx
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  children: ReactNode;
}

export function Button({ variant = 'primary', children }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-md font-medium transition-colors',
        {
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
          'bg-gray-200 text-gray-800 hover:bg-gray-300': variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
        }
      )}
    >
      {children}
    </button>
  );
}
```

### i18next Локализация

```typescript
// Использование переводов
'use client';
import { useTranslation } from 'react-i18next';

export function Component() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.description', { count: 5 })}</p>
    </div>
  );
}

// public/locales/ru/common.json
{
  "dashboard": {
    "title": "Панель управления",
    "description": "У вас {{count}} активных проектов"
  }
}
```

---

## Backend навыки

### Fastify API

```typescript
// apps/api/src/routes/timeEntries.ts
import { FastifyPluginAsync } from "fastify";
import { z } from "zod";

const timeEntriesRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/time-entries
  fastify.get("/", async (request, reply) => {
    const userId = request.user.id; // Из JWT
    const entries = await fastify.prisma.timeEntry.findMany({
      where: { userId },
      orderBy: { startTime: "desc" },
    });
    return entries;
  });

  // POST /api/time-entries
  const createSchema = z.object({
    projectId: z.string(),
    startTime: z.string().datetime(),
    description: z.string().optional(),
  });

  fastify.post("/", async (request, reply) => {
    const data = createSchema.parse(request.body);
    const entry = await fastify.prisma.timeEntry.create({
      data: {
        ...data,
        userId: request.user.id,
      },
    });
    return entry;
  });
};

export default timeEntriesRoutes;
```

### Prisma ORM

```typescript
// apps/api/prisma/schema.prisma
model TimeEntry {
  id          String   @id @default(uuid())
  userId      String
  projectId   String
  startTime   DateTime
  endTime     DateTime?
  duration    Int      @default(0)
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  project     Project  @relation(fields: [projectId], references: [id])
  user        User     @relation(fields: [userId], references: [id])

  @@index([userId, startTime])
}

// Миграции
// apps/api/prisma/migrations/...
```

```bash
# Создать миграцию
cd apps/api
npx prisma migrate dev --name add_time_entries

# Применить миграции
npx prisma migrate deploy

# Сгенерировать клиент
npx prisma generate

# Открыть Prisma Studio
npx prisma studio
```

### JWT авторизация

```typescript
// apps/api/src/plugins/auth.ts
import { FastifyPluginAsync } from "fastify";
import fastifyJwt from "@fastify/jwt";

export const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET!,
  });

  fastify.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: "Unauthorized" });
    }
  });
};

// Использование
fastify.get("/protected", {
  preHandler: [fastify.authenticate],
  handler: async (request, reply) => {
    return { user: request.user };
  },
});
```

### SQL запросы и миграции

```sql
-- sql/migrations/01_add_data_retention_period.sql
ALTER TABLE user_settings
ADD COLUMN data_retention_period INTEGER DEFAULT 90;

-- sql/functions/exec_sql.sql
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS TEXT AS $$
BEGIN
  EXECUTE sql_query;
  RETURN 'Success';
EXCEPTION
  WHEN OTHERS THEN
    RETURN SQLERRM;
END;
$$ LANGUAGE plpgsql;
```

---

## DevOps навыки

### Jest тестирование

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct variant class', () => {
    const { container } = render(<Button variant="danger">Delete</Button>);
    expect(container.firstChild).toHaveClass('bg-red-600');
  });
});
```

```bash
# Запустить тесты
npm test

# Режим watch
npm test -- --watch

# С покрытием
npm test -- --coverage

# Конкретный файл
npm test -- Button.test.tsx
```

### Environment Configuration

```bash
# .env.local (не коммитится)
NEXT_PUBLIC_API_URL=http://localhost:3001
DATABASE_URL=file:./dev.db
JWT_SECRET=your-secret-key

# .env.production
NEXT_PUBLIC_API_URL=https://api.timetracker.com
DATABASE_URL=postgresql://user:pass@railway.app:5432/db
```

```typescript
// Использование в коде
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const dbUrl = process.env.DATABASE_URL; // Только на сервере
```

### Build и Deploy

```bash
# Локальная разработка
npm run dev

# Production build
npm run build

# Запуск production
npm start

# Проверка перед деплоем
npm run lint
npm test
npm run build
```

### Task Runner (Taskfile)

```yaml
# Taskfile.yml
version: "3"

tasks:
  default:
    cmds:
      - task: dev

  dev:
    desc: Start development servers
    cmds:
      - npm run dev

  test:
    desc: Run all tests
    cmds:
      - npm test

  build:
    desc: Build for production
    cmds:
      - npm run build

  deploy:
    desc: Deploy to production
    deps: [build]
    cmds:
      - netlify deploy --prod
```

---

## Архитектурные навыки

### Code Review Checklist

- [ ] Код соответствует TypeScript строгим типам
- [ ] Добавлены необходимые тесты
- [ ] UI использует существующие компоненты
- [ ] API следует RESTful конвенциям
- [ ] Все тексты вынесены в i18next
- [ ] Tailwind классы используются правильно
- [ ] Performance оптимизирован (мемоизация, lazy loading)
- [ ] Обработка ошибок реализована
- [ ] Документация обновлена
- [ ] Нет console.log в продакшен коде

### Рефакторинг паттерны

```typescript
// ПЛОХО: Дублирование кода
function formatDate1(date: Date) {
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}
function formatDate2(date: Date) {
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

// ХОРОШО: Переиспользуемая функция
// lib/dateUtils.ts
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU").format(date);
}
```

### Performance Optimization

```typescript
// Мемоизация
import { useMemo, memo } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(() => {
    return data.map(/* тяжелые вычисления */);
  }, [data]);

  return <div>{processedData}</div>;
});

// Lazy loading
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(
  () => import('./HeavyComponent'),
  { loading: () => <Spinner /> }
);

// React Query оптимизация
const { data } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  staleTime: 5 * 60 * 1000, // 5 минут
  cacheTime: 10 * 60 * 1000, // 10 минут
});
```

### Документирование

````typescript
/**
 * Создает новую запись времени
 *
 * @param projectId - ID проекта
 * @param startTime - Время начала в ISO формате
 * @param description - Опциональное описание
 * @returns Созданная запись времени
 * @throws {ValidationError} Если данные невалидны
 * @throws {AuthError} Если пользователь не авторизован
 *
 * @example
 * ```typescript
 * const entry = await createTimeEntry({
 *   projectId: '123',
 *   startTime: new Date().toISOString(),
 *   description: 'Работа над фичей'
 * });
 * ```
 */
export async function createTimeEntry(
  data: TimeEntryInput,
): Promise<TimeEntry> {
  // Implementation
}
````

---

## Управление проектом

### Landing the Plane процедура

При завершении сессии **ОБЯЗАТЕЛЬНО**:

```bash
# 1. Создать issue для оставшейся работы (если есть)
bd create "Название задачи" --description "Описание"

# 2. Запустить quality gates
npm run lint -- --fix
npx tsc --noEmit
npm test
npm run build  # Если менялся код

# 3. Обновить статус issues
bd update <id> --status done
bd close <id>

# 4. PUSH TO REMOTE (ОБЯЗАТЕЛЬНО!)
git add .
git commit -m "feat: описание работы"
git pull --rebase
bd sync
git push
git status  # Должно показать "up to date with origin"

# 5. Очистка
git stash clear  # Если были stash
git remote prune origin  # Очистить удаленные ветки

# 6. Проверка
git status  # Все закоммичено и запушено

# 7. Передача контекста
# Оставить комментарий о проделанной работе и следующих шагах
```

### Планирование спринта

```bash
# Посмотреть доступные задачи
bd ready

# Создать задачи для спринта
bd create "Реализовать фичу X"
bd create "Исправить баг Y"
bd create "Написать тесты для Z"

# Установить приоритеты
bd update <id> --priority high

# Взять задачу в работу
bd update <id> --status in_progress

# После завершения
bd close <id>
```

### Стандарты коммитов

```bash
# Типы коммитов
feat: новая функциональность
fix: исправление бага
docs: документация
style: форматирование (не влияет на код)
refactor: рефакторинг
test: добавление тестов
chore: вспомогательные задачи (build, deps)

# Примеры
git commit -m "feat: add pomodoro timer component"
git commit -m "fix: correct time entry duration calculation"
git commit -m "docs: update API documentation"
git commit -m "test: add tests for TimerContext"
```

---

## Полезные команды

### Диагностика

```bash
# Проверить версии
node --version
npm --version

# Проверить зависимости
npm outdated

# Очистить кэш
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Проверить TypeScript
npx tsc --noEmit

# Проверить линтер
npm run lint
```

### Быстрая проверка качества

```bash
# Запустить все проверки
npm run lint && npx tsc --noEmit && npm test && npm run build

# Или использовать task
npx run-s lint type-check test build
```

### Отладка

```typescript
// Использовать console.log для отладки (удалить перед коммитом)
console.log('Debug:', { variable });

// React DevTools для отладки компонентов
// Chrome DevTools для отладки network запросов

// Prisma Studio для просмотра данных
cd apps/api && npx prisma studio
```

---

## Чек-лист для новой фичи

1. [ ] Создать issue в bd
2. [ ] Создать ветку feature/название
3. [ ] Спроектировать архитектуру (если сложная фича)
4. [ ] Реализовать backend (если нужно)
   - [ ] Добавить Prisma модели
   - [ ] Создать миграции
   - [ ] Реализовать API эндпоинты
   - [ ] Добавить валидацию Zod
5. [ ] Реализовать frontend
   - [ ] Создать компоненты
   - [ ] Добавить React Query hooks
   - [ ] Интегрировать с API
   - [ ] Добавить локализацию
6. [ ] Написать тесты
   - [ ] Unit тесты компонентов
   - [ ] Integration тесты API
   - [ ] E2E тесты (опционально)
7. [ ] Проверить качество
   - [ ] Запустить линтер
   - [ ] Проверить TypeScript
   - [ ] Запустить тесты
   - [ ] Проверить сборку
8. [ ] Обновить документацию
9. [ ] Создать PR (если применимо)
10. [ ] Закоммитить и запушить
11. [ ] Закрыть issue в bd
12. [ ] Landing the Plane процедура

---

## Troubleshooting

### Проблемы с зависимостями

```bash
# Удалить node_modules и переустановить
rm -rf node_modules package-lock.json
npm install

# Проверить конфликты
npm list --depth=0
```

### Проблемы с Prisma

```bash
# Пересоздать клиент
cd apps/api
npx prisma generate

# Сбросить БД (ОСТОРОЖНО!)
npx prisma migrate reset

# Применить миграции
npx prisma migrate deploy
```

### Проблемы с TypeScript

```bash
# Перезапустить сервер TypeScript в VS Code
# Ctrl+Shift+P -> TypeScript: Restart TS Server

# Проверить конфигурацию
npx tsc --showConfig

# Очистить кэш
rm -rf .next
```

### Проблемы с тестами

```bash
# Очистить кэш Jest
npm test -- --clearCache

# Запустить с подробным выводом
npm test -- --verbose

# Обновить снепшоты
npm test -- --updateSnapshot
```
