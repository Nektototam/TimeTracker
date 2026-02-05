"use client";

import { ReactNode } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { TimerProvider } from '../contexts/TimerContext';
import { PomodoroProvider } from '../contexts/PomodoroContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ToastProvider } from '../contexts/ToastContext';
import { ToastContainer } from './ui/Toast';
import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <LanguageProvider>
              <TimerProvider>
                <PomodoroProvider>
                  {children}
                  <ToastContainer />
                </PomodoroProvider>
              </TimerProvider>
            </LanguageProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
