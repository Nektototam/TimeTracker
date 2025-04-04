import { NextRequest, NextResponse } from 'next/server';

const languages = ['ru', 'en', 'he']; // русский, английский, иврит
const defaultLanguage = 'ru';

// Проверяем, является ли путь публичным (не требующим префикса языка)
function isPublicRoute(path: string): boolean {
  const publicPaths = [
    '/api/',         // API маршруты
    '/_next/',       // Next.js ресурсы
    '/images/',      // Изображения
    '/fonts/',       // Шрифты
    '/favicon.ico',  // Фавикон
    '/sounds/',      // Звуки
    '/icons/',       // Иконки
    '/locales/',     // Файлы локализации
  ];
  
  return publicPaths.some(publicPath => path.startsWith(publicPath));
}

// Определяем язык из заголовков запроса
function getLanguageFromHeaders(request: NextRequest): string | null {
  const acceptLanguage = request.headers.get('accept-language');
  if (!acceptLanguage) return null;
  
  // Получаем предпочтительные языки из заголовка
  const userLanguages = acceptLanguage.split(',')
    .map(lang => {
      const [language, priority = '1'] = lang.trim().split(';q=');
      return { language: language.split('-')[0], priority: parseFloat(priority) };
    })
    .sort((a, b) => b.priority - a.priority)
    .map(item => item.language);
  
  // Ищем первый поддерживаемый язык
  for (const lang of userLanguages) {
    if (languages.includes(lang)) {
      return lang;
    }
  }
  
  return null;
}

// Определяем язык из куки
function getLanguageFromCookie(request: NextRequest): string | null {
  const cookie = request.cookies.get('NEXT_LOCALE');
  return cookie && languages.includes(cookie.value) ? cookie.value : null;
}

// Определяем, нужно ли установить RTL для HTML
function isRTL(language: string): boolean {
  return language === 'he'; // Иврит использует RTL
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Пропускаем публичные маршруты
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }
  
  // Определяем язык из cookie или заголовков
  const cookieLanguage = getLanguageFromCookie(request);
  const headerLanguage = getLanguageFromHeaders(request);
  const language = cookieLanguage || headerLanguage || defaultLanguage;
  
  // Создаем ответ, устанавливая куки с языком
  const response = NextResponse.next();
  
  // Устанавливаем cookie с выбранным языком
  response.cookies.set('NEXT_LOCALE', language, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 дней
  });
  
  // Добавляем заголовок X-Language для использования в компонентах
  response.headers.set('X-Language', language);
  
  return response;
}

// Указываем, для каких путей применять middleware
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images|fonts|favicon.ico|sounds|icons|locales).*)'],
}; 