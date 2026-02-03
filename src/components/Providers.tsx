"use client";

import { ReactNode } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { TimerProvider } from '../contexts/TimerContext';
import { PomodoroProvider } from '../contexts/PomodoroContext';
import { LanguageProvider } from '../contexts/LanguageContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <TimerProvider>
          <PomodoroProvider>
            {children}
          </PomodoroProvider>
        </TimerProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
