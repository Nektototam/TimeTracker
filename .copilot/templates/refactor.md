# Template: Рефакторинг

Используйте этот шаблон при рефакторинге существующего кода.

## Информация о рефакторинге

**Название**: [Что рефакторим]

**Причина рефакторинга**:

- [ ] Улучшение читаемости
- [ ] Повышение производительности
- [ ] Устранение дублирования
- [ ] Упрощение архитектуры
- [ ] Улучшение тестируемости
- [ ] Техдолг
- [ ] Другое: [описание]

**Приоритет**: [ ] High [ ] Medium [ ] Low

**Оценка времени**: [часы/дни]

**Риск**: [ ] Low [ ] Medium [ ] High

## Анализ текущего состояния

### Проблемы в текущем коде

1. Проблема 1: [описание]
   - Последствия: [как это влияет]
   - Файлы: `путь/к/файлу.ts`

2. Проблема 2: [описание]
   - Последствия: [как это влияет]
   - Файлы: `путь/к/файлу.ts`

### Затронутые компоненты

- [ ] `путь/к/компоненту1.ts` - [описание]
- [ ] `путь/к/компоненту2.ts` - [описание]
- [ ] `путь/к/компоненту3.ts` - [описание]

### Метрики (до рефакторинга)

- Количество строк кода: [число]
- Cyclomatic complexity: [число]
- Дублирование кода: [процент]
- Покрытие тестами: [процент]
- Performance baseline: [метрика]

## План рефакторинга

### Цели

1. Цель 1: [описание]
2. Цель 2: [описание]
3. Цель 3: [описание]

### Подход

**Стратегия**:

- [ ] Big bang (все сразу)
- [x] Incremental (постепенно)
- [ ] Strangler pattern (постепенная замена)

**Разбивка на шаги**:

1. **Шаг 1**: [название]
   - Действия: [описание]
   - Файлы: [список]
   - Риск: [Low/Medium/High]

2. **Шаг 2**: [название]
   - Действия: [описание]
   - Файлы: [список]
   - Риск: [Low/Medium/High]

3. **Шаг 3**: [название]
   - Действия: [описание]
   - Файлы: [список]
   - Риск: [Low/Medium/High]

### Безопасность

- [ ] Есть существующие тесты
- [ ] Покрытие достаточное (>70%)
- [ ] Есть резервная копия
- [ ] Можно откатить изменения
- [ ] Есть мониторинг

## Workflow

### Шаг 1: Подготовка

```bash
# Создать issue
bd create "Refactor: [описание]"

# Взять в работу
bd update <issue-id> --status in_progress

# Создать ветку
git checkout -b refactor/[название]

# Создать резервную копию (опционально)
git tag refactor-backup-$(date +%Y%m%d)
```

### Шаг 2: Обеспечить покрытие тестами

```bash
# Проверить текущее покрытие
npm test -- --coverage

# Цель: >80% для рефакторимого кода
```

#### Если покрытие недостаточное:

```bash
# Добавить тесты для текущего поведения
# Это critical - тесты предотвратят breaking changes!
```

```typescript
// Пример: добавление тестов перед рефакторингом
describe("ComponentToRefactor", () => {
  it("should maintain current behavior", () => {
    // Тест текущего поведения
    const result = componentFunction(input);
    expect(result).toBe(expectedOutput);
  });

  it("should handle edge cases", () => {
    // Тесты edge cases
  });
});
```

#### Чеклист подготовки

- [ ] Покрытие тестами >80%
- [ ] Все тесты проходят
- [ ] Документировано текущее поведение
- [ ] Создан baseline для сравнения

### Шаг 3: Рефакторинг (итеративно)

#### Iteration 1: [Название]

**Что делаем**: [Описание изменений]

**Файлы**:

- `путь/к/файлу1.ts`
- `путь/к/файлу2.ts`

```bash
# 1. Внести изменения
# Редактировать код

# 2. Запустить тесты
npm test -- --watch
# Тесты должны ПРОХОДИТЬ после каждого изменения!

# 3. Коммит
git add .
git commit -m "refactor: [описание итерации 1]"
```

**После изменений**:

- [ ] Тесты проходят
- [ ] TypeScript без ошибок
- [ ] Линтер без ошибок
- [ ] Поведение не изменилось

#### Iteration 2: [Название]

**Что делаем**: [Описание изменений]

**Файлы**:

- `путь/к/файлу3.ts`
- `путь/к/файлу4.ts`

```bash
# 1. Внести изменения
# 2. Запустить тесты
npm test

# 3. Коммит
git add .
git commit -m "refactor: [описание итерации 2]"
```

**После изменений**:

- [ ] Тесты проходят
- [ ] TypeScript без ошибок
- [ ] Линтер без ошибок
- [ ] Поведение не изменилось

#### Iteration N: [Название]

[Повторить для каждой итерации]

### Шаг 4: Примеры рефакторинга

#### Устранение дублирования

```typescript
// БЫЛО: Дублирование кода
function processDataA(data: Data) {
  const validated = validateData(data);
  const transformed = transformData(validated);
  const formatted = formatData(transformed);
  return formatted;
}

function processDataB(data: Data) {
  const validated = validateData(data);
  const transformed = transformData(validated);
  const formatted = formatData(transformed);
  return formatted;
}

// СТАЛО: Переиспользуемая функция
function processData(data: Data, options: ProcessOptions) {
  const validated = validateData(data);
  const transformed = transformData(validated, options);
  const formatted = formatData(transformed);
  return formatted;
}

function processDataA(data: Data) {
  return processData(data, { type: "A" });
}

function processDataB(data: Data) {
  return processData(data, { type: "B" });
}
```

#### Извлечение функций

```typescript
// БЫЛО: Большая функция
function handleSubmit(data: FormData) {
  // Валидация (20 строк)
  if (!data.name) throw new Error("Name required");
  if (!data.email) throw new Error("Email required");
  // ... еще 15 строк валидации

  // Трансформация (30 строк)
  const transformed = {
    name: data.name.trim(),
    email: data.email.toLowerCase(),
    // ... еще 25 строк трансформации
  };

  // Сохранение (20 строк)
  await db.save(transformed);
  // ... еще 15 строк
}

// СТАЛО: Разбито на функции
function validateFormData(data: FormData): void {
  if (!data.name) throw new Error("Name required");
  if (!data.email) throw new Error("Email required");
  // Вся валидация в одной функции
}

function transformFormData(data: FormData): TransformedData {
  return {
    name: data.name.trim(),
    email: data.email.toLowerCase(),
    // Вся трансформация в одной функции
  };
}

async function saveFormData(data: TransformedData): Promise<void> {
  await db.save(data);
  // Вся логика сохранения в одной функции
}

async function handleSubmit(data: FormData): Promise<void> {
  validateFormData(data);
  const transformed = transformFormData(data);
  await saveFormData(transformed);
}
```

#### Упрощение условий

```typescript
// БЫЛО: Сложные вложенные условия
function canUserEdit(user: User, resource: Resource): boolean {
  if (user) {
    if (user.role === "admin") {
      return true;
    } else {
      if (resource) {
        if (resource.ownerId === user.id) {
          if (!resource.locked) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

// СТАЛО: Early returns
function canUserEdit(user: User, resource: Resource): boolean {
  if (!user || !resource) return false;
  if (user.role === "admin") return true;
  if (resource.ownerId !== user.id) return false;
  if (resource.locked) return false;
  return true;
}
```

#### Улучшение типов

```typescript
// БЫЛО: Слабые типы
function processItem(item: any): any {
  return {
    id: item.id,
    name: item.name,
    value: item.value * 2,
  };
}

// СТАЛО: Строгие типы
interface Item {
  id: string;
  name: string;
  value: number;
}

interface ProcessedItem {
  id: string;
  name: string;
  value: number;
}

function processItem(item: Item): ProcessedItem {
  return {
    id: item.id,
    name: item.name,
    value: item.value * 2,
  };
}
```

#### React компоненты

```typescript
// БЫЛО: Большой компонент
function ComplexComponent() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('asc');

  useEffect(() => {
    // 50 строк логики
  }, []);

  const handleClick = () => {
    // 30 строк логики
  };

  const processData = () => {
    // 40 строк логики
  };

  return (
    <div>
      {/* 100 строк JSX */}
    </div>
  );
}

// СТАЛО: Разделенные компоненты и хуки
// Custom hook
function useDataManagement() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('asc');

  useEffect(() => {
    // Логика загрузки
  }, []);

  return { data, filter, setFilter, sort, setSort };
}

// Подкомпонент
function DataList({ data }: { data: Item[] }) {
  return (
    <ul>
      {data.map(item => <DataItem key={item.id} item={item} />)}
    </ul>
  );
}

// Главный компонент
function ComplexComponent() {
  const { data, filter, setFilter, sort, setSort } = useDataManagement();

  return (
    <div>
      <FilterControls filter={filter} onFilterChange={setFilter} />
      <SortControls sort={sort} onSortChange={setSort} />
      <DataList data={data} />
    </div>
  );
}
```

### Шаг 5: Проверка после каждой итерации

```bash
# После КАЖДОГО изменения:

# 1. TypeScript
npx tsc --noEmit

# 2. Линтер
npm run lint

# 3. Тесты
npm test

# 4. Вручную проверить в браузере (если UI)
npm run dev
```

#### Чеклист после каждой итерации

- [ ] Тесты проходят (все!)
- [ ] TypeScript без ошибок
- [ ] Линтер без ошибок
- [ ] Функциональность не сломана
- [ ] Производительность не ухудшилась
- [ ] Коммит сделан

### Шаг 6: Финальная проверка

```bash
# 1. Все тесты
npm test

# 2. Покрытие
npm test -- --coverage
# Должно быть >= начального

# 3. Build
npm run build

# 4. Production test
npm start
# Вручную проверить
```

#### Метрики (после рефакторинга)

- Количество строк кода: [число] (изменение: [+/-]%)
- Cyclomatic complexity: [число] (изменение: [+/-]%)
- Дублирование кода: [процент] (изменение: [+/-]%)
- Покрытие тестами: [процент] (изменение: [+/-]%)
- Performance: [метрика] (изменение: [+/-]%)

#### Сравнение до/после

| Метрика      | До  | После | Изменение |
| ------------ | --- | ----- | --------- |
| Строки кода  |     |       |           |
| Complexity   |     |       |           |
| Дублирование |     |       |           |
| Покрытие     |     |       |           |
| Performance  |     |       |           |

### Шаг 7: Документация

````typescript
// Обновить комментарии
/**
 * Обрабатывает данные пользователя
 *
 * @param data - Входные данные
 * @param options - Опции обработки
 * @returns Обработанные данные
 *
 * @example
 * ```typescript
 * const result = processData(input, { validate: true });
 * ```
 */
function processData(data: Data, options: Options): ProcessedData {
  // Implementation
}
````

#### Документация чеклист

- [ ] JSDoc обновлены
- [ ] Комментарии к сложной логике
- [ ] README обновлен (если нужно)
- [ ] Миграционное руководство (если breaking changes)

### Шаг 8: Code Review (self)

#### Рефакторинг Review Checklist

**Цели достигнуты**:

- [ ] Код стал читабельнее
- [ ] Дублирование устранено
- [ ] Сложность снижена
- [ ] Тестируемость улучшена

**Качество**:

- [ ] Никакие тесты не сломаны
- [ ] Поведение не изменилось
- [ ] Производительность не ухудшилась
- [ ] Нет новых багов

**Архитектура**:

- [ ] Разделение ответственности соблюдено
- [ ] SOLID принципы соблюдены
- [ ] Код переиспользуемый
- [ ] Зависимости минимальны

**Документация**:

- [ ] Код документирован
- [ ] Изменения описаны
- [ ] Миграция понятна (если нужна)

### Шаг 9: Завершение

```bash
# 1. Финальный коммит (если есть изменения)
git add .
git commit -m "refactor: завершен рефакторинг [описание]

Изменения:
- Улучшение 1
- Улучшение 2
- Улучшение 3

Метрики:
- Complexity: X -> Y (-Z%)
- Duplication: A -> B (-C%)
- Test coverage: D -> E (+F%)
"

# 2. Синхронизация с main
git fetch origin
git rebase origin/main

# 3. Проверка после rebase
npm test

# 4. Push
git push origin refactor/[название]

# 5. Создать PR (если используется)

# 6. Закрыть issue
bd close <issue-id>

# 7. Landing the Plane
bd sync
git checkout main
git pull --rebase
git merge refactor/[название]
git push
```

## Рефакторинг паттерны

### Extract Method

Когда: Функция слишком большая или делает много вещей

```typescript
// Извлечь часть логики в отдельную функцию
```

### Extract Variable

Когда: Сложное выражение

```typescript
// БЫЛО
if (user.role === "admin" || (user.role === "editor" && user.verified)) {
  // ...
}

// СТАЛО
const canEdit =
  user.role === "admin" || (user.role === "editor" && user.verified);
if (canEdit) {
  // ...
}
```

### Rename

Когда: Непонятные имена

```typescript
// БЫЛО: data, tmp, x
// СТАЛО: userData, temporaryResult, userCount
```

### Introduce Parameter Object

Когда: Много параметров

```typescript
// БЫЛО
function create(name: string, email: string, age: number, city: string) {}

// СТАЛО
interface UserData {
  name: string;
  email: string;
  age: number;
  city: string;
}
function create(userData: UserData) {}
```

### Replace Conditional with Polymorphism

Когда: Большой switch/if-else

```typescript
// БЫЛО
function getPrice(type: string): number {
  switch (type) {
    case "basic":
      return 10;
    case "premium":
      return 20;
    case "enterprise":
      return 50;
  }
}

// СТАЛО
interface PricingTier {
  getPrice(): number;
}

class BasicTier implements PricingTier {
  getPrice() {
    return 10;
  }
}

class PremiumTier implements PricingTier {
  getPrice() {
    return 20;
  }
}
```

## Best Practices

### Рефакторинг заповеди

1. **Малые шаги** - Изменять по чуть-чуть
2. **Тесты всегда зеленые** - После каждого изменения
3. **Один коммит - одно изменение** - Легко откатить
4. **Документировать причины** - Почему, а не как
5. **Измерять результаты** - Метрики до/после
6. **Не добавлять фичи** - Только рефакторинг
7. **Иметь резервную копию** - Можно откатиться

### Когда НЕ рефакторить

- [ ] Нет тестов и нельзя добавить
- [ ] Код работает и не меняется
- [ ] Deadline близко
- [ ] Код скоро будет удален
- [ ] Риск слишком высокий

### Red flags

Остановитесь, если:

- Тесты начали падать
- Появились новые баги
- Производительность ухудшилась
- Рефакторинг затянулся
- Потеряна цель

## Заметки

[Любые дополнительные заметки]

---

## Полезные ресурсы

- [Refactoring Guru](https://refactoring.guru/)
- [Martin Fowler - Refactoring](https://martinfowler.com/books/refactoring.html)
- [Clean Code - Robert Martin](https://www.goodreads.com/book/show/3735293-clean-code)
