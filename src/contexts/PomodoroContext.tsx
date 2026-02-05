'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  SECONDS_PER_MINUTE,
  MS_PER_SECOND,
  POMODORO_STATE_STORAGE_KEY,
  DEFAULT_POMODORO_WORK_MINUTES,
  DEFAULT_POMODORO_REST_MINUTES,
} from '../lib/constants/time';

// Типы для таймера Помидора
type TimerMode = 'work' | 'rest';

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
  // Настройки таймера по умолчанию (в минутах)
  const [workDuration, setWorkDuration] = useState(DEFAULT_POMODORO_WORK_MINUTES);
  const [restDuration, setRestDuration] = useState(DEFAULT_POMODORO_REST_MINUTES);

  // Состояние таймера
  const [mode, setMode] = useState<TimerMode>('work');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(workDuration * SECONDS_PER_MINUTE); // в секундах
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
  
  // Инициализация аудио при монтировании компонента
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
    
    // Проверяем, есть ли сохраненное состояние таймера в localStorage
    const savedPomodoro = localStorage.getItem(POMODORO_STATE_STORAGE_KEY);
    if (savedPomodoro) {
      try {
        const pomodoroState = JSON.parse(savedPomodoro);
        
        // Восстанавливаем состояние, если таймер был запущен
        if (pomodoroState.isRunning) {
          setWorkDuration(pomodoroState.workDuration);
          setRestDuration(pomodoroState.restDuration);
          setMode(pomodoroState.mode);
          setIsRunning(true);
          
          // Вычисляем оставшееся время с учетом прошедшего времени
          const elapsedSeconds = Math.floor((Date.now() - pomodoroState.lastUpdated) / MS_PER_SECOND);
          const remainingTime = Math.max(0, pomodoroState.timeLeft - elapsedSeconds);
          
          if (remainingTime <= 0) {
            // Если время истекло, устанавливаем 0 - второй useEffect обработает completion
            setTimeLeft(0);
          } else {
            setTimeLeft(remainingTime);
          }
          
          setCycles(pomodoroState.cycles);
        } else {
          // Если таймер был на паузе, просто восстанавливаем состояние
          setWorkDuration(pomodoroState.workDuration);
          setRestDuration(pomodoroState.restDuration);
          setMode(pomodoroState.mode);
          setTimeLeft(pomodoroState.timeLeft);
          setCycles(pomodoroState.cycles);
        }
      } catch (err) {
        console.error('Ошибка при загрузке состояния таймера Помидора:', err);
      }
    }
    
    // Очистка ресурсов при размонтировании
    return () => {
      // Сохраняем состояние таймера при размонтировании компонента
      // Используем ref для получения актуальных значений
      const currentState = stateRef.current;
      const pomodoroState = {
        workDuration: currentState.workDuration,
        restDuration: currentState.restDuration,
        mode: currentState.mode,
        isRunning: currentState.isRunning,
        timeLeft: currentState.timeLeft,
        cycles: currentState.cycles,
        lastUpdated: Date.now()
      };

      localStorage.setItem(POMODORO_STATE_STORAGE_KEY, JSON.stringify(pomodoroState));

      workCompleteSound.current = null;
      restCompleteSound.current = null;
    };
  }, []);
  
  // Создание простого звукового сигнала, если файлы не найдены
  const createBeepSound = (frequency: number): HTMLAudioElement => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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

      // Создаем фиктивный аудио элемент для совместимости с API
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
    if (mode === 'work') {
      // Работа завершена, переход к отдыху
      if (workCompleteSound.current) {
        workCompleteSound.current.play().catch(e => console.error('Failed to play work complete sound:', e));
      }
      setMode('rest');
      setTimeLeft(restDuration * SECONDS_PER_MINUTE);
      // Увеличиваем счетчик циклов только после завершения работы
      setCycles(prevCycles => prevCycles + 1);
    } else {
      // Отдых завершен, переход к работе
      if (restCompleteSound.current) {
        restCompleteSound.current.play().catch(e => console.error('Failed to play rest complete sound:', e));
      }
      setMode('work');
      setTimeLeft(workDuration * SECONDS_PER_MINUTE);
    }

    // Показываем уведомление
    showNotification();

    // Обновляем состояние в localStorage
    const pomodoroState = {
      workDuration,
      restDuration,
      mode: mode === 'work' ? 'rest' : 'work',
      isRunning,
      timeLeft: mode === 'work' ? restDuration * SECONDS_PER_MINUTE : workDuration * SECONDS_PER_MINUTE,
      cycles: mode === 'work' ? cycles + 1 : cycles,
      lastUpdated: Date.now()
    };
    localStorage.setItem(POMODORO_STATE_STORAGE_KEY, JSON.stringify(pomodoroState));
  }, [mode, restDuration, workDuration, isRunning, cycles, showNotification]);

  // Обновление состояния таймера при запуске/остановке
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          const newTime = prevTime - 1;

          // Сохраняем текущее состояние в localStorage
          const pomodoroState = {
            workDuration,
            restDuration,
            mode,
            isRunning,
            timeLeft: newTime,
            cycles,
            lastUpdated: Date.now()
          };
          localStorage.setItem(POMODORO_STATE_STORAGE_KEY, JSON.stringify(pomodoroState));

          return newTime;
        });
      }, MS_PER_SECOND);
    } else if (isRunning && timeLeft === 0) {
      // Переключение между режимами работы и отдыха
      handleTimerComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, workDuration, restDuration, cycles, handleTimerComplete]);
  
  // Управление таймером
  const startTimer = () => {
    setIsRunning(true);
    
    // Сохраняем состояние в localStorage
    const pomodoroState = {
      workDuration,
      restDuration,
      mode,
      isRunning: true,
      timeLeft,
      cycles,
      lastUpdated: Date.now()
    };
    localStorage.setItem(POMODORO_STATE_STORAGE_KEY, JSON.stringify(pomodoroState));
  };
  
  const pauseTimer = () => {
    setIsRunning(false);
    
    // Сохраняем состояние в localStorage
    const pomodoroState = {
      workDuration,
      restDuration,
      mode,
      isRunning: false,
      timeLeft,
      cycles,
      lastUpdated: Date.now()
    };
    localStorage.setItem(POMODORO_STATE_STORAGE_KEY, JSON.stringify(pomodoroState));
  };
  
  const resetTimer = () => {
    setIsRunning(false);
    setMode('work');
    setTimeLeft(workDuration * SECONDS_PER_MINUTE);
    setCycles(0);
    
    // Сохраняем состояние в localStorage
    const pomodoroState = {
      workDuration,
      restDuration,
      mode: 'work',
      isRunning: false,
      timeLeft: workDuration * SECONDS_PER_MINUTE,
      cycles: 0,
      lastUpdated: Date.now()
    };
    localStorage.setItem(POMODORO_STATE_STORAGE_KEY, JSON.stringify(pomodoroState));
  };
  
  // Методы для изменения настроек
  const updateWorkDuration = (minutes: number) => {
    if (!isNaN(minutes) && minutes > 0) {
      setWorkDuration(minutes);
      if (mode === 'work' && !isRunning) {
        setTimeLeft(minutes * SECONDS_PER_MINUTE);
      }
      
      // Обновляем состояние в localStorage
      const pomodoroState = {
        workDuration: minutes,
        restDuration,
        mode,
        isRunning,
        timeLeft: mode === 'work' && !isRunning ? minutes * SECONDS_PER_MINUTE : timeLeft,
        cycles,
        lastUpdated: Date.now()
      };
      localStorage.setItem(POMODORO_STATE_STORAGE_KEY, JSON.stringify(pomodoroState));
    }
  };
  
  const updateRestDuration = (minutes: number) => {
    if (!isNaN(minutes) && minutes > 0) {
      setRestDuration(minutes);
      if (mode === 'rest' && !isRunning) {
        setTimeLeft(minutes * SECONDS_PER_MINUTE);
      }
      
      // Обновляем состояние в localStorage
      const pomodoroState = {
        workDuration,
        restDuration: minutes,
        mode,
        isRunning,
        timeLeft: mode === 'rest' && !isRunning ? minutes * SECONDS_PER_MINUTE : timeLeft,
        cycles,
        lastUpdated: Date.now()
      };
      localStorage.setItem(POMODORO_STATE_STORAGE_KEY, JSON.stringify(pomodoroState));
    }
  };
  
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