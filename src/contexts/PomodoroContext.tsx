'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

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
  const [workDuration, setWorkDuration] = useState(25);
  const [restDuration, setRestDuration] = useState(5);
  
  // Состояние таймера
  const [mode, setMode] = useState<TimerMode>('work');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(workDuration * 60); // в секундах
  const [cycles, setCycles] = useState(0);
  
  // Ссылки на аудио элементы для сигналов
  const workCompleteSound = useRef<HTMLAudioElement | null>(null);
  const restCompleteSound = useRef<HTMLAudioElement | null>(null);
  
  // Инициализация аудио при монтировании компонента
  useEffect(() => {
    if (typeof window !== 'undefined') {
      workCompleteSound.current = new Audio('/sounds/work-complete.mp3');
      restCompleteSound.current = new Audio('/sounds/rest-complete.mp3');
      
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
    const savedPomodoro = localStorage.getItem('timetracker-pomodoro-state');
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
          const elapsedSeconds = Math.floor((Date.now() - pomodoroState.lastUpdated) / 1000);
          const remainingTime = Math.max(0, pomodoroState.timeLeft - elapsedSeconds);
          
          if (remainingTime <= 0) {
            // Если время истекло, переключаем режим
            handleTimerComplete();
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
      const pomodoroState = {
        workDuration,
        restDuration,
        mode,
        isRunning,
        timeLeft,
        cycles,
        lastUpdated: Date.now()
      };
      
      localStorage.setItem('timetracker-pomodoro-state', JSON.stringify(pomodoroState));
      
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
          localStorage.setItem('timetracker-pomodoro-state', JSON.stringify(pomodoroState));
          
          return newTime;
        });
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Переключение между режимами работы и отдыха
      handleTimerComplete();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, workDuration, restDuration, cycles]);
  
  // Обработка окончания таймера и переход к следующему режиму
  const handleTimerComplete = () => {
    if (mode === 'work') {
      // Работа завершена, переход к отдыху
      if (workCompleteSound.current) {
        workCompleteSound.current.play().catch(e => console.error('Failed to play work complete sound:', e));
      }
      setMode('rest');
      setTimeLeft(restDuration * 60);
      // Увеличиваем счетчик циклов только после завершения работы
      setCycles(prevCycles => prevCycles + 1);
    } else {
      // Отдых завершен, переход к работе
      if (restCompleteSound.current) {
        restCompleteSound.current.play().catch(e => console.error('Failed to play rest complete sound:', e));
      }
      setMode('work');
      setTimeLeft(workDuration * 60);
    }
    
    // Показываем уведомление
    showNotification();
    
    // Обновляем состояние в localStorage
    const pomodoroState = {
      workDuration,
      restDuration,
      mode: mode === 'work' ? 'rest' : 'work',
      isRunning,
      timeLeft: mode === 'work' ? restDuration * 60 : workDuration * 60,
      cycles: mode === 'work' ? cycles + 1 : cycles,
      lastUpdated: Date.now()
    };
    localStorage.setItem('timetracker-pomodoro-state', JSON.stringify(pomodoroState));
  };
  
  // Показ браузерного уведомления при поддержке
  const showNotification = () => {
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
  };
  
  // Форматирование времени в формат MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
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
    localStorage.setItem('timetracker-pomodoro-state', JSON.stringify(pomodoroState));
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
    localStorage.setItem('timetracker-pomodoro-state', JSON.stringify(pomodoroState));
  };
  
  const resetTimer = () => {
    setIsRunning(false);
    setMode('work');
    setTimeLeft(workDuration * 60);
    setCycles(0);
    
    // Сохраняем состояние в localStorage
    const pomodoroState = {
      workDuration,
      restDuration,
      mode: 'work',
      isRunning: false,
      timeLeft: workDuration * 60,
      cycles: 0,
      lastUpdated: Date.now()
    };
    localStorage.setItem('timetracker-pomodoro-state', JSON.stringify(pomodoroState));
  };
  
  // Методы для изменения настроек
  const updateWorkDuration = (minutes: number) => {
    if (!isNaN(minutes) && minutes > 0) {
      setWorkDuration(minutes);
      if (mode === 'work' && !isRunning) {
        setTimeLeft(minutes * 60);
      }
      
      // Обновляем состояние в localStorage
      const pomodoroState = {
        workDuration: minutes,
        restDuration,
        mode,
        isRunning,
        timeLeft: mode === 'work' && !isRunning ? minutes * 60 : timeLeft,
        cycles,
        lastUpdated: Date.now()
      };
      localStorage.setItem('timetracker-pomodoro-state', JSON.stringify(pomodoroState));
    }
  };
  
  const updateRestDuration = (minutes: number) => {
    if (!isNaN(minutes) && minutes > 0) {
      setRestDuration(minutes);
      if (mode === 'rest' && !isRunning) {
        setTimeLeft(minutes * 60);
      }
      
      // Обновляем состояние в localStorage
      const pomodoroState = {
        workDuration,
        restDuration: minutes,
        mode,
        isRunning,
        timeLeft: mode === 'rest' && !isRunning ? minutes * 60 : timeLeft,
        cycles,
        lastUpdated: Date.now()
      };
      localStorage.setItem('timetracker-pomodoro-state', JSON.stringify(pomodoroState));
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