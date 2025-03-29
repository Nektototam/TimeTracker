'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useTimeEntries } from '../hooks/useTimeEntries';
import { useAuth } from './AuthContext';

// Тип для контекста таймера
interface TimerContextType {
  // Состояние таймера
  project: string;
  projectText: string;
  isRunning: boolean;
  startTime: number;
  elapsedTime: number;
  timerStatus: string;
  timerValue: string;
  dailyTotal: string;
  // Методы
  setProject: (project: string) => void;
  setProjectText: (text: string) => void;
  toggleTimer: () => Promise<void>;
  formatTime: (milliseconds: number) => string;
}

// Создание контекста с начальными значениями
const TimerContext = createContext<TimerContextType | undefined>(undefined);

// Провайдер контекста
export function TimerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id || '';
  
  // Состояние таймера
  const [project, setProject] = useState('development');
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerStatus, setTimerStatus] = useState('Готов');
  const [timerValue, setTimerValue] = useState('00:00:00');
  const [projectText, setProjectText] = useState('Веб-разработка');
  const [dailyTotal, setDailyTotal] = useState('00:00:00');
  const [lastHourMark, setLastHourMark] = useState(0);
  
  // Ref для аудио элементов
  const workCompleteAudioRef = useRef<HTMLAudioElement | null>(null);
  const bigBenAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Используем хук для работы с записями времени
  const { entries, isLoading, error, addTimeEntry, getTodayEntries } = useTimeEntries();
  
  // Инициализация аудио элементов
  useEffect(() => {
    workCompleteAudioRef.current = new Audio('/sounds/work-complete.mp3');
    bigBenAudioRef.current = new Audio('/sounds/big-ben-chime.mp3');
    
    // Проверяем, есть ли сохраненное состояние таймера в localStorage
    const savedTimer = localStorage.getItem('timetracker-timer-state');
    if (savedTimer) {
      try {
        const timerState = JSON.parse(savedTimer);
        // Проверяем, что таймер был запущен
        if (timerState.isRunning) {
          setProject(timerState.project);
          setProjectText(timerState.projectText);
          setIsRunning(true);
          setStartTime(timerState.startTime);
          setElapsedTime(Date.now() - timerState.startTime);
          setTimerStatus('Идет отсчет');
          setLastHourMark(timerState.lastHourMark || 0);
        }
      } catch (err) {
        console.error('Ошибка при загрузке состояния таймера:', err);
      }
    }
    
    return () => {
      // Сохраняем состояние таймера при размонтировании компонента
      if (isRunning) {
        const timerState = {
          isRunning,
          project,
          projectText,
          startTime,
          lastHourMark
        };
        localStorage.setItem('timetracker-timer-state', JSON.stringify(timerState));
      } else {
        localStorage.removeItem('timetracker-timer-state');
      }
    };
  }, []);
  
  // Загрузка суммарного времени за день при монтировании компонента
  useEffect(() => {
    async function loadDailyTotal() {
      try {
        const todayEntries = await getTodayEntries();
        
        // Считаем общую длительность
        const totalMilliseconds = todayEntries.reduce(
          (total, entry) => total + entry.duration, 
          0
        );
        
        setDailyTotal(formatTime(totalMilliseconds));
      } catch (err) {
        console.error('Ошибка при загрузке суммарного времени за день:', err);
      }
    }
    
    if (userId) {
      loadDailyTotal();
    }
  }, [getTodayEntries, userId]);
  
  // Форматирование времени
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };
  
  // Воспроизведение звука Биг Бен
  const playBigBenSound = () => {
    if (bigBenAudioRef.current) {
      bigBenAudioRef.current.currentTime = 0;
      bigBenAudioRef.current.play().catch(err => {
        console.error('Ошибка воспроизведения звука Биг Бен:', err);
      });
    }
  };
  
  // Обновление таймера
  const updateTimer = () => {
    const currentTime = Date.now();
    const newElapsedTime = currentTime - startTime;
    setElapsedTime(newElapsedTime);
    setTimerValue(formatTime(newElapsedTime));
    
    // Проверяем, прошел ли час с момента старта или последнего часового сигнала
    const hourInMs = 3600000; // 1 час в миллисекундах
    const elapsedTimeInHours = Math.floor(newElapsedTime / hourInMs);
    const lastHourMarkInHours = Math.floor(lastHourMark / hourInMs);
    
    if (elapsedTimeInHours > lastHourMarkInHours) {
      // Прошел час, воспроизводим звук Биг Бен
      playBigBenSound();
      setLastHourMark(elapsedTimeInHours * hourInMs);
    }
    
    // Сохраняем состояние таймера в localStorage
    const timerState = {
      isRunning,
      project,
      projectText,
      startTime,
      lastHourMark
    };
    localStorage.setItem('timetracker-timer-state', JSON.stringify(timerState));
  };
  
  // Запуск и остановка таймера
  const toggleTimer = async () => {
    if (isRunning) {
      // Остановка таймера
      setIsRunning(false);
      setTimerStatus('Приостановлен');
      
      // Сохраняем запись в БД
      const now = new Date();
      const entryData = {
        user_id: userId,
        project_type: project,
        start_time: new Date(startTime),
        end_time: now,
        duration: elapsedTime
      };
      
      try {
        await addTimeEntry(entryData);
        
        // Воспроизводим звук завершения работы
        if (workCompleteAudioRef.current) {
          workCompleteAudioRef.current.currentTime = 0;
          workCompleteAudioRef.current.play().catch(err => {
            console.error('Ошибка воспроизведения звука завершения работы:', err);
          });
        }
        
        // Обновляем суммарное время за день
        const todayEntries = await getTodayEntries();
        const totalMilliseconds = todayEntries.reduce(
          (total, entry) => total + entry.duration, 
          0
        );
        setDailyTotal(formatTime(totalMilliseconds));
        
        // Удаляем состояние таймера из localStorage
        localStorage.removeItem('timetracker-timer-state');
      } catch (err) {
        console.error('Ошибка при сохранении записи:', err);
      }
    } else {
      // Запуск таймера
      const now = Date.now();
      if (elapsedTime === 0) {
        setStartTime(now);
        setLastHourMark(0); // Сбрасываем метку последнего часа
      } else {
        setStartTime(now - elapsedTime);
        // Сохраняем последнюю отметку часа
      }
      
      setIsRunning(true);
      setTimerStatus('Идет отсчет');
      
      // Сохраняем состояние таймера в localStorage
      const timerState = {
        isRunning: true,
        project,
        projectText,
        startTime: now - elapsedTime,
        lastHourMark: elapsedTime === 0 ? 0 : lastHourMark
      };
      localStorage.setItem('timetracker-timer-state', JSON.stringify(timerState));
    }
  };
  
  // Обновление таймера при запуске
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(updateTimer, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime]);
  
  // Возвращаем провайдер контекста
  return (
    <TimerContext.Provider
      value={{
        project,
        projectText,
        isRunning,
        startTime,
        elapsedTime,
        timerStatus,
        timerValue,
        dailyTotal,
        setProject,
        setProjectText,
        toggleTimer,
        formatTime
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

// Хук для использования контекста таймера
export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
} 