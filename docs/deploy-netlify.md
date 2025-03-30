# Руководство по развертыванию на Netlify

Данное руководство описывает процесс развертывания TimeTracker приложения на платформе Netlify.

## Предварительные требования

1. Аккаунт на [Netlify](https://www.netlify.com/)
2. Репозиторий на GitHub с проектом
3. Настроенный проект Supabase

## Шаг 1: Подготовка проекта для деплоя

1. Создайте новую ветку для деплоя:

```bash
git checkout -b deploy-netlify
```

2. Создайте файл `netlify.toml` в корне проекта со следующим содержимым:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment] 
  NODE_VERSION = "18"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

3. Убедитесь, что в файле `.env.example` указаны все необходимые переменные окружения:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Убедитесь, что `.env.local` добавлен в `.gitignore` для исключения секретных данных из репозитория.

5. Зафиксируйте изменения:

```bash
git add netlify.toml -f .env.example
git commit -m "Добавлены файлы конфигурации для Netlify"
```

6. Отправьте ветку в удаленный репозиторий:

```bash
git push -u origin deploy-netlify
```

## Шаг 2: Настройка проекта на Netlify

1. Войдите в свой аккаунт на [Netlify](https://www.netlify.com/).

2. Нажмите кнопку "Add new site" и выберите "Import an existing project".

3. Выберите GitHub как источник кода.

4. Найдите и выберите ваш репозиторий.

5. Выберите ветку `deploy-netlify` для деплоя.

6. Настройки сборки будут автоматически заполнены из файла `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `.next`

7. Добавьте переменные окружения в разделе "Environment variables":
   - `NEXT_PUBLIC_SUPABASE_URL` - ваш URL Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - ваш анонимный ключ Supabase

8. Нажмите "Deploy site".

## Шаг 3: Настройка Supabase для работы с Netlify

1. В вашей панели управления Supabase перейдите в раздел "Authentication" -> "URL Configuration".

2. Добавьте домен вашего сайта на Netlify (обычно `https://your-site-name.netlify.app`) в список разрешенных URL-адресов (Site URL).

3. Также добавьте его в раздел "Redirect URLs".

## Шаг 4: Проверка деплоя

1. После завершения деплоя Netlify предоставит URL вашего сайта (например, `https://your-site-name.netlify.app`).

2. Откройте URL и убедитесь, что приложение работает корректно.

3. Проверьте функциональность аутентификации и другие ключевые функции, использующие Supabase.

## Дополнительные настройки

### Настройка собственного домена

1. В панели управления Netlify перейдите в раздел "Domain settings".

2. Нажмите "Add custom domain" и следуйте инструкциям.

3. После настройки собственного домена не забудьте добавить его в настройки Supabase.

### Настройка непрерывного развертывания

По умолчанию Netlify настраивает непрерывное развертывание для выбранной ветки. При каждом коммите в эту ветку будет автоматически запускаться новый деплой.

### Переменные окружения для различных сред

Для разных сред (разработка, тестирование, продакшн) можно настроить разные переменные окружения в настройках деплоя Netlify. 