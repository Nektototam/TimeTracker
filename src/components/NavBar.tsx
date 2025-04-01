import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function NavBar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { currentLanguage } = useLanguage();
  
  // Используем объект с переводами вместо хука useTranslation
  const translations: Record<string, Record<string, string>> = {
    ru: {
      timer: 'Таймер',
      statistics: 'Статистика',
      reports: 'Отчеты',
      pomodoro: 'Помидор',
      settings: 'Настройки',
      logout: 'Выход'
    },
    en: {
      timer: 'Timer',
      statistics: 'Statistics',
      reports: 'Reports',
      pomodoro: 'Pomodoro',
      settings: 'Settings',
      logout: 'Logout'
    },
    he: {
      timer: 'טיימר',
      statistics: 'סטטיסטיקה',
      reports: 'דוחות',
      pomodoro: 'פומודורו',
      settings: 'הגדרות',
      logout: 'התנתק'
    }
  };
  
  // Функция для получения перевода
  const t = (key: string): string => {
    const lang = currentLanguage in translations ? currentLanguage : 'ru';
    const parts = key.split('.');
    if (parts.length === 2 && parts[0] === 'nav') {
      return translations[lang][parts[1]] || key;
    }
    return key;
  };
  
  // Иконки для навигации
  const icons = {
    timer: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    statistics: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 20V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 20V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 20V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    reports: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15.5 9.75H8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15.5 14.25H8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    pomodoro: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.5 14.25V16.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15.5 14.25V16.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 14.25V19.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19 15.25C19 18.56 16.31 21.25 13 21.25H11C7.69 21.25 5 18.56 5 15.25V13.75C5 10.44 7.69 7.75 11 7.75H13C16.31 7.75 19 10.44 19 13.75V15.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 7.75V2.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    settings: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12.88V11.12C2 10.08 2.85 9.22 3.9 9.22C5.71 9.22 6.45 7.94 5.54 6.37C5.02 5.47 5.33 4.3 6.24 3.78L7.97 2.79C8.76 2.32 9.78 2.6 10.25 3.39L10.36 3.58C11.26 5.15 12.74 5.15 13.65 3.58L13.76 3.39C14.23 2.6 15.25 2.32 16.04 2.79L17.77 3.78C18.68 4.3 18.99 5.47 18.47 6.37C17.56 7.94 18.3 9.22 20.11 9.22C21.15 9.22 22.01 10.07 22.01 11.12V12.88C22.01 13.92 21.16 14.78 20.11 14.78C18.3 14.78 17.56 16.06 18.47 17.63C18.99 18.54 18.68 19.7 17.77 20.22L16.04 21.21C15.25 21.68 14.23 21.4 13.76 20.61L13.65 20.42C12.75 18.85 11.27 18.85 10.36 20.42L10.25 20.61C9.78 21.4 8.76 21.68 7.97 21.21L6.24 20.22C5.33 19.7 5.02 18.53 5.54 17.63C6.45 16.06 5.71 14.78 3.9 14.78C2.85 14.78 2 13.92 2 12.88Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    logout: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.44 14.62L20 12.06L17.44 9.5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9.76001 12.06H19.93" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11.76 20C7.34001 20 3.76001 17 3.76001 12C3.76001 7 7.34001 4 11.76 4" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 flex justify-around items-center py-3 px-2 bg-white shadow-lg z-10 rounded-t-xl">
      <Link
        href="/"
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${pathname === "/" ? "text-primary" : "text-gray-500"}`}
      >
        <span className="nav-icon">{icons.timer}</span>
        <span className="text-xs mt-1 font-medium">{t('nav.timer')}</span>
      </Link>
      
      <Link
        href="/statistics"
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${pathname === "/statistics" ? "text-primary" : "text-gray-500"}`}
      >
        <span className="nav-icon">{icons.statistics}</span>
        <span className="text-xs mt-1 font-medium">{t('nav.statistics')}</span>
      </Link>
      
      <Link
        href="/reports"
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${pathname === "/reports" ? "text-primary" : "text-gray-500"}`}
      >
        <span className="nav-icon">{icons.reports}</span>
        <span className="text-xs mt-1 font-medium">{t('nav.reports')}</span>
      </Link>
      
      <Link
        href="/pomodoro"
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${pathname === "/pomodoro" ? "text-primary" : "text-gray-500"}`}
      >
        <span className="nav-icon">{icons.pomodoro}</span>
        <span className="text-xs mt-1 font-medium">{t('nav.pomodoro')}</span>
      </Link>
      
      <Link
        href="/settings"
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${pathname === "/settings" ? "text-primary" : "text-gray-500"}`}
      >
        <span className="nav-icon">{icons.settings}</span>
        <span className="text-xs mt-1 font-medium">{t('nav.settings')}</span>
      </Link>
      
      <button
        onClick={() => signOut()}
        className="flex flex-col items-center justify-center p-2 rounded-xl transition-all text-gray-500 hover:text-primary"
      >
        <span className="nav-icon">{icons.logout}</span>
        <span className="text-xs mt-1 font-medium">{t('nav.logout')}</span>
      </button>
    </nav>
  );
} 