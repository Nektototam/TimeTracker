'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

// Toast types
export type ToastType = 'error' | 'success' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface ShowToastOptions {
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (options: ShowToastOptions) => string;
  dismissToast: (id: string) => void;
}

const DEFAULT_DURATION = 5000;

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastIdCounter = 0;
const generateId = () => `toast-${++toastIdCounter}`;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const dismissToast = useCallback((id: string) => {
    // Clear timer if exists
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((options: ShowToastOptions): string => {
    const id = generateId();
    const duration = options.duration ?? DEFAULT_DURATION;

    const newToast: Toast = {
      id,
      type: options.type,
      message: options.message,
      duration,
    };

    setToasts((prev) => [...prev, newToast]);

    // Set auto-dismiss timer
    if (duration > 0) {
      const timer = setTimeout(() => {
        dismissToast(id);
      }, duration);
      timersRef.current.set(id, timer);
    }

    return id;
  }, [dismissToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
