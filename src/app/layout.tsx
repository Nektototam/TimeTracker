import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../contexts/AuthContext';
import { TimerProvider } from '../contexts/TimerContext';
import { PomodoroProvider } from '../contexts/PomodoroContext';
import { LanguageProvider } from '../contexts/LanguageContext';

// Настраиваем шрифт Inter с расширенным набором весов
const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'TimeTracker',
  description: 'Приложение для отслеживания рабочего времени',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="ru" className={inter.variable}>
      <body className={inter.className}>
        <AuthProvider>
          <LanguageProvider>
            <TimerProvider>
              <PomodoroProvider>
                {children}
              </PomodoroProvider>
            </TimerProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
