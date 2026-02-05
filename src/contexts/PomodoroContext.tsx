'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  SECONDS_PER_MINUTE,
  MS_PER_SECOND,
  DEFAULT_POMODORO_WORK_MINUTES,
  DEFAULT_POMODORO_REST_MINUTES,
} from '../lib/constants/time';
import { usePomodoroPersistence, TimerMode } from '../hooks/usePomodoroPersistence';

interface PomodoroContextType {
  // Состояние таймера
  workDuration: number;
  restDuration: number;
  mode: TimerMode;
  isRunning: boolean;
  timeLeft: number;
  cycles: number;

  // Методы
  setWorkDuration: (minutes: number) => void;
  setRestDuration: (minutes: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  formatTime: (seconds: number) => string;
}

// Создание контекста с начальными значениями
const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

// Провайдер контекста
export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  // Persistence hook
  const persistence = usePomodoroPersistence();

  // Настройки таймера по умолчанию (в минутах)
  const [workDuration, setWorkDuration] = useState(DEFAULT_POMODORO_WORK_MINUTES);
  const [restDuration, setRestDuration] = useState(DEFAULT_POMODORO_REST_MINUTES);

  // Состояние таймера
  const [mode, setMode] = useState<TimerMode>('work');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(workDuration * SECONDS_PER_MINUTE);
  const [cycles, setCycles] = useState(0);

  // Ссылки на аудио элементы для сигналов
  const workCompleteSound = useRef<HTMLAudioElement | null>(null);
  const restCompleteSound = useRef<HTMLAudioElement | null>(null);

  // Refs для сохранения последних значений состояния (для cleanup)
  const stateRef = useRef({ workDuration, restDuration, mode, isRunning, timeLeft, cycles });

  // Обновляем ref при изменении состояния
  useEffect(() => {
    stateRef.current = { workDuration, restDuration, mode, isRunning, timeLeft, cycles };
  }, [workDuration, restDuration, mode, isRunning, timeLeft, cycles]);

  // Helper to save current state
  const saveCurrentState = useCallback((overrides: Partial<typeof stateRef.current> = {}) => {
    const current = { ...stateRef.current, ...overrides };
    persistence.saveState(persistence.createState(current));
  }, [persistence]);

  // Инициализация аудио и загрузка состояния при монтировании
  useEffect(() => {
    if (typeof window !== 'undefined') {
      workCompleteSound.current = new Audio('/sounds/work-complete.mp3');
      restCompleteSound.current = new Audio('/sounds/pomodoro-complete.mp3');

      // Заменяем на базовые звуки, если файлы не найдены
      workCompleteSound.current.onerror = () => {
        console.warn('Work complete sound not found, using default');
        if (workCompleteSound.current) {
          workCompleteSound.current = createBeepSound(800);
        }
      };

      restCompleteSound.current.onerror = () => {
        console.warn('Rest complete sound not found, using default');
        if (restCompleteSound.current) {
          restCompleteSound.current = createBeepSound(600);
        }
      };
    }

    // Загружаем сохраненное состояние
    const savedState = persistence.loadState();
    if (savedState) {
      if (savedState.isRunning) {
        setWorkDuration(savedState.workDuration);
        setRestDuration(savedState.restDuration);
        setMode(savedState.mode);
        setIsRunning(true);

        // Вычисляем оставшееся время с учетом прошедшего времени
        const elapsedSeconds = Math.floor((Date.now() - savedState.lastUpdated) / MS_PER_SECOND);
        const remainingTime = Math.max(0, savedState.timeLeft - elapsedSeconds);
        setTimeLeft(remainingTime);
        setCycles(savedState.cycles);
      } else {
        // Если таймер был на паузе, просто восстанавливаем состояние
        setWorkDuration(savedState.workDuration);
        setRestDuration(savedState.restDuration);
        setMode(savedState.mode);
        setTimeLeft(savedState.timeLeft);
        setCycles(savedState.cycles);
      }
    }

    // Очистка ресурсов при размонтировании
    return () => {
      // Сохраняем состояние при размонтировании, используя ref для актуальных значений
      const currentState = stateRef.current;
      persistence.saveState(persistence.createState(currentState));

      workCompleteSound.current = null;
      restCompleteSound.current = null;
    };
  }, [persistence]);

  // Создание простого звукового сигнала, если файлы не найдены
  const createBeepSound = (frequency: number): HTMLAudioElement => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);

      return new Audio();
    } catch (e) {
      console.error('Failed to create beep sound:', e);
      return new Audio();
    }
  };

  // Форматирование времени в формат MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / SECONDS_PER_MINUTE);
    const secs = seconds % SECONDS_PER_MINUTE;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Показ браузерного уведомления при поддержке
  const showNotification = useCallback(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(mode === 'work' ? 'Время отдохнуть!' : 'Время работать!', {
          body: mode === 'work'
            ? `Вы завершили ${cycles + 1}-й рабочий период. Отдохните ${restDuration} минут.`
            : `Отдых завершен. Начните новый ${workDuration}-минутный рабочий период.`,
          icon: '/icons/pomodoro-icon.png'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, [mode, cycles, restDuration, workDuration]);

  // Обработка окончания таймера и переход к следующему режиму
  const handleTimerComplete = useCallback(() => {
    const newMode = mode === 'work' ? 'rest' : 'work';
    const newTimeLeft = mode === 'work' ? restDuration * SECONDS_PER_MINUTE : workDuration * SECONDS_PER_MINUTE;
    const newCycles = mode === 'work' ? cycles + 1 : cycles;

    if (mode === 'work') {
      if (workCompleteSound.current) {
        workCompleteSound.current.play().catch(e => console.error('Failed to play work complete sound:', e));
      }
    } else {
      if (restCompleteSound.current) {
        restCompleteSound.current.play().catch(e => console.error('Failed to play rest complete sound:', e));
      }
    }

    setMode(newMode);
    setTimeLeft(newTimeLeft);
    if (mode === 'work') {
      setCycles(prevCycles => prevCycles + 1);
    }

    showNotification();

    saveCurrentState({
      mode: newMode,
      timeLeft: newTimeLeft,
      cycles: newCycles,
    });
  }, [mode, restDuration, workDuration, cycles, showNotification, saveCurrentState]);

  // Обновление состояния таймера при запуске/остановке
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          const newTime = prevTime - 1;
          saveCurrentState({ timeLeft: newTime });
          return newTime;
        });
      }, MS_PER_SECOND);
    } else if (isRunning && timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, handleTimerComplete, saveCurrentState]);

  // Управление таймером
  const startTimer = useCallback(() => {
    setIsRunning(true);
    saveCurrentState({ isRunning: true });
  }, [saveCurrentState]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    saveCurrentState({ isRunning: false });
  }, [saveCurrentState]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setMode('work');
    setTimeLeft(workDuration * SECONDS_PER_MINUTE);
    setCycles(0);

    saveCurrentState({
      isRunning: false,
      mode: 'work',
      timeLeft: workDuration * SECONDS_PER_MINUTE,
      cycles: 0,
    });
  }, [workDuration, saveCurrentState]);

  // Методы для изменения настроек
  const updateWorkDuration = useCallback((minutes: number) => {
    if (!isNaN(minutes) && minutes > 0) {
      setWorkDuration(minutes);
      const newTimeLeft = mode === 'work' && !isRunning ? minutes * SECONDS_PER_MINUTE : timeLeft;
      if (mode === 'work' && !isRunning) {
        setTimeLeft(newTimeLeft);
      }

      saveCurrentState({
        workDuration: minutes,
        timeLeft: newTimeLeft,
      });
    }
  }, [mode, isRunning, timeLeft, saveCurrentState]);

  const updateRestDuration = useCallback((minutes: number) => {
    if (!isNaN(minutes) && minutes > 0) {
      setRestDuration(minutes);
      const newTimeLeft = mode === 'rest' && !isRunning ? minutes * SECONDS_PER_MINUTE : timeLeft;
      if (mode === 'rest' && !isRunning) {
        setTimeLeft(newTimeLeft);
      }

      saveCurrentState({
        restDuration: minutes,
        timeLeft: newTimeLeft,
      });
    }
  }, [mode, isRunning, timeLeft, saveCurrentState]);

  // Возвращаем провайдер контекста
  return (
    <PomodoroContext.Provider
      value={{
        workDuration,
        restDuration,
        mode,
        isRunning,
        timeLeft,
        cycles,
        setWorkDuration: updateWorkDuration,
        setRestDuration: updateRestDuration,
        startTimer,
        pauseTimer,
        resetTimer,
        formatTime
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}

// Хук для использования контекста таймера Помидора
export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
}
