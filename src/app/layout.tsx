import './globals.css';
import type { Metadata } from 'next';
import { Providers } from '../components/Providers';

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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
