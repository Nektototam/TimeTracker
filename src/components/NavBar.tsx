import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';

interface NavBarProps {
  variant?: 'bottom' | 'sidebar';
  className?: string;
}

export default function NavBar({ variant = 'bottom', className }: NavBarProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { currentLanguage } = useLanguage();
  
  // Используем объект с переводами вместо хука useTranslation
  const translations: Record<string, Record<string, string>> = {
    ru: {
      dashboard: 'Главная',
      timer: 'Таймер',
      statistics: 'Статистика',
      reports: 'Отчеты',
      pomodoro: 'Помидор',
      settings: 'Настройки',
      logout: 'Выход'
    },
    en: {
      dashboard: 'Dashboard',
      timer: 'Timer',
      statistics: 'Statistics',
      reports: 'Reports',
      pomodoro: 'Pomodoro',
      settings: 'Settings',
      logout: 'Logout'
    },
    he: {
      dashboard: 'ראשי',
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

  // Улучшенные иконки навигации
  const navIcons = {
    dashboard: '🏠',
    timer: '⏱️',
    statistics: '📊',
    reports: '📋',
    pomodoro: '🍅',
    settings: '⚙️',
    logout: '🚪'
  };
  
  const navItems = [
    { key: 'dashboard', href: '/dashboard', icon: navIcons.dashboard, label: t('nav.dashboard') },
    { key: 'timer', href: '/timer', icon: navIcons.timer, label: t('nav.timer') },
    { key: 'statistics', href: '/statistics', icon: navIcons.statistics, label: t('nav.statistics') },
    { key: 'reports', href: '/reports', icon: navIcons.reports, label: t('nav.reports') },
    { key: 'pomodoro', href: '/pomodoro', icon: navIcons.pomodoro, label: t('nav.pomodoro') },
    { key: 'settings', href: '/settings', icon: navIcons.settings, label: t('nav.settings') },
  ];

  const isSidebar = variant === 'sidebar';

  return (
    <nav
      aria-label="Main navigation"
      data-variant={variant}
      className={cn(
        "border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80",
        isSidebar
          ? "sticky top-6 flex h-fit flex-col gap-2 rounded-2xl p-3 shadow-app-sm"
          : "fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between rounded-2xl p-2 shadow-app-lg",
        className
      )}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Button
            key={item.key}
            asChild
            variant="ghost"
            size={isSidebar ? 'md' : 'sm'}
            className={cn(
              "group gap-2 text-muted-foreground transition-colors",
              isSidebar
                ? "h-10 w-full justify-start rounded-xl px-3 text-sm"
                : "h-12 flex-1 flex-col justify-center rounded-xl px-2 text-[11px]",
              isActive && "bg-muted text-foreground font-semibold"
            )}
          >
            <Link href={item.href} aria-current={isActive ? 'page' : undefined}>
              <span className={cn("text-base", !isSidebar && "text-lg")}>{item.icon}</span>
              <span className={cn(isSidebar ? "text-sm" : "text-[11px]", "leading-tight")}>{item.label}</span>
            </Link>
          </Button>
        );
      })}

      <Button
        onClick={() => signOut()}
        variant="ghost"
        size={isSidebar ? 'md' : 'sm'}
        className={cn(
          "gap-2 text-destructive hover:text-destructive",
          isSidebar
            ? "h-10 w-full justify-start rounded-xl px-3"
            : "h-12 flex-1 flex-col justify-center rounded-xl px-2 text-[11px]"
        )}
      >
        <span className={cn("text-base", !isSidebar && "text-lg")}>{navIcons.logout}</span>
        <span className={cn(isSidebar ? "text-sm" : "text-[11px]", "leading-tight")}>{t('nav.logout')}</span>
      </Button>
    </nav>
  );
} 