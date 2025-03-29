import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../contexts/AuthContext';
import { TimerProvider } from '../contexts/TimerContext';

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="ru">
      <body className={inter.className}>
        <AuthProvider>
          <TimerProvider>
            {children}
          </TimerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
