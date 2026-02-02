import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '../contexts/AuthContext';
import { TimerProvider } from '../contexts/TimerContext';
import { PomodoroProvider } from '../contexts/PomodoroContext';
import { LanguageProvider } from '../contexts/LanguageContext';

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
    <html suppressHydrationWarning lang="ru">
      <body>
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
