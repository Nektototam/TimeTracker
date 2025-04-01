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
  
  return (
    <nav className="nav-bar">
      <Link
        href="/"
        className={`nav-item ${pathname === "/" ? "active" : ""}`}
      >
        <span className="nav-icon">⏱️</span>
        <span className="nav-text">{t('nav.timer')}</span>
      </Link>
      
      <Link
        href="/statistics"
        className={`nav-item ${pathname === "/statistics" ? "active" : ""}`}
      >
        <span className="nav-icon">📊</span>
        <span className="nav-text">{t('nav.statistics')}</span>
      </Link>
      
      <Link
        href="/reports"
        className={`nav-item ${pathname === "/reports" ? "active" : ""}`}
      >
        <span className="nav-icon">📝</span>
        <span className="nav-text">{t('nav.reports')}</span>
      </Link>
      
      <Link
        href="/pomodoro"
        className={`nav-item ${pathname === "/pomodoro" ? "active" : ""}`}
      >
        <span className="nav-icon">🍅</span>
        <span className="nav-text">{t('nav.pomodoro')}</span>
      </Link>
      
      <Link
        href="/settings"
        className={`nav-item ${pathname === "/settings" ? "active" : ""}`}
      >
        <span className="nav-icon">⚙️</span>
        <span className="nav-text">{t('nav.settings')}</span>
      </Link>
      
      <button
        onClick={() => signOut()}
        className="nav-item logout"
      >
        <span className="nav-icon">🚪</span>
        <span className="nav-text">{t('nav.logout')}</span>
      </button>
    </nav>
  );
} 