'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useTimeEntries } from '../hooks/useTimeEntries';
import { useAuth } from './AuthContext';
import settingsService from '../lib/settingsService';

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
  timeLimit: number | null;
  // Методы
  setProject: (project: string) => void;
  setProjectText: (text: string) => void;
  toggleTimer: () => Promise<void>;
  finishTask: () => Promise<void>;
  switchProject: (newProject: string, newProjectText: string) => Promise<void>;
  formatTime: (milliseconds: number) => string;
  setTimeLimit: (minutes: number | null) => void;
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
  const [last15MinMark, setLast15MinMark] = useState(0);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  
  // Ref для аудио элементов
  const workCompleteAudioRef = useRef<HTMLAudioElement>(null);
  const bigBenAudioRef = useRef<HTMLAudioElement>(null);
  const work15AudioRef = useRef<HTMLAudioElement>(null);
  const pomodoroStartAudioRef = useRef<HTMLAudioElement>(null);
  const pomodoroCompleteAudioRef = useRef<HTMLAudioElement>(null);
  
  // Используем хук для работы с записями времени
  const { entries, isLoading, error, addTimeEntry, getTodayEntries } = useTimeEntries();
  
  // Инициализация аудио элементов и загрузка сохраненного состояния
  useEffect(() => {
    workCompleteAudioRef.current = new Audio('/sounds/work-complete.mp3');
    bigBenAudioRef.current = new Audio('/sounds/work-complete.mp3');
    work15AudioRef.current = new Audio('/sounds/work-15.mp3');
    pomodoroStartAudioRef.current = new Audio('/sounds/pomodoro-start.mp3');
    pomodoroCompleteAudioRef.current = new Audio('/sounds/pomodoro-complete.mp3');
    
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
          setLast15MinMark(timerState.last15MinMark || 0);
          setTimeLimit(timerState.timeLimit || null);
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
          lastHourMark,
          last15MinMark,
          timeLimit
        };
        localStorage.setItem('timetracker-timer-state', JSON.stringify(timerState));
      } else {
        localStorage.removeItem('timetracker-timer-state');
      }
    };
  }, []);
  
  // Загрузка базового времени за день (все завершенные задачи)
  const updateCompletedTimeTotal = async () => {
    if (!userId) return;
    
    try {
      console.log('Загрузка времени завершенных задач...');
      const todayEntries = await getTodayEntries();
      
      // Считаем общую длительность всех завершенных записей
      const totalMilliseconds = todayEntries.reduce(
        (total, entry) => total + entry.duration, 
        0
      );
      
      console.log(`Время завершенных задач: ${formatTime(totalMilliseconds)}`);
      setDailyTotal(formatTime(totalMilliseconds));
    } catch (err) {
      console.error('Ошибка при загрузке времени завершенных задач:', err);
    }
  };
  
  // Загружаем время завершенных задач при монтировании и когда меняется userId
  useEffect(() => {
    if (userId) {
      updateCompletedTimeTotal();
    }
  }, [userId]);
  
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
  
  // Воспроизведение звука с визуальным уведомлением
  const playSound = (audioRef: React.RefObject<HTMLAudioElement | null>, title: string, message: string) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.error(`Ошибка воспроизведения звука ${title}:`, err);
      });
    }
    
    // Визуальное уведомление
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/icons/timetracker-icon.png'
      });
    }
  };
  
  // Сохранение текущей записи и обновление суммарного времени
  const saveCurrentEntry = async (isFinishing: boolean = false): Promise<void> => {
    // Если таймер не запущен или нет прошедшего времени, ничего не делаем
    if (!isRunning || elapsedTime === 0) return;
    
    const now = new Date();
    const entryData = {
      user_id: userId,
      project_type: project,
      start_time: new Date(startTime),
      end_time: now,
      duration: elapsedTime
    };
    
    try {
      // Сохраняем запись в БД
      await addTimeEntry(entryData);
      
      // После сохранения записи обновляем общее время завершенных задач
      // ТОЛЬКО если задача завершается полностью (не пауза)
      if (isFinishing) {
        await updateCompletedTimeTotal();
        // Воспроизводим звук завершения работы
        playSound(workCompleteAudioRef, "Задача завершена", `Вы завершили работу над "${projectText}"`);
      }
    } catch (error) {
      console.error('Ошибка при сохранении записи:', error);
    }
  };
  
  // Переключение между проектами
  const switchProject = async (newProject: string, newProjectText: string): Promise<void> => {
    // Если текущий проект совпадает с новым, ничего не делаем
    if (project === newProject) return;
    
    // Сохраняем текущую запись, если таймер запущен
    await saveCurrentEntry();
    
    // Обновляем проект
    setProject(newProject);
    setProjectText(newProjectText);
    
    // Сбрасываем таймер и ограничение времени
    setStartTime(Date.now());
    setElapsedTime(0);
    setTimerValue('00:00:00');
    setTimeLimit(null);
    
    // Если таймер был запущен, продолжаем отсчет для нового проекта
    if (isRunning) {
      setTimerStatus('Идет отсчет');
      setLastHourMark(0);
      setLast15MinMark(0);
      
      // Воспроизводим звук начала работы над проектом
      playSound(pomodoroStartAudioRef, "Новая задача", `Начало работы над "${newProjectText}"`);
      
      // Сохраняем состояние таймера в localStorage с новым проектом
      const timerState = {
        isRunning,
        project: newProject,
        projectText: newProjectText,
        startTime: Date.now(),
        lastHourMark: 0,
        last15MinMark: 0,
        timeLimit: null
      };
      localStorage.setItem('timetracker-timer-state', JSON.stringify(timerState));
    } else {
      setTimerStatus('Готов');
    }
  };
  
  // Завершение текущей задачи
  const finishTask = async (): Promise<void> => {
    if (!isRunning) return;
    
    // Сохраняем запись и передаем true, указывая что это завершение
    await saveCurrentEntry(true);
    
    // Сбрасываем таймер
    setIsRunning(false);
    setTimerStatus('Готов');
    setElapsedTime(0);
    setTimerValue('00:00:00');
    setStartTime(0);
    setLastHourMark(0);
    setLast15MinMark(0);
    
    // Удаляем состояние таймера из localStorage
    localStorage.removeItem('timetracker-timer-state');
  };
  
  // Запуск и остановка таймера
  const toggleTimer = async () => {
    if (isRunning) {
      // Остановка таймера (пауза)
      setIsRunning(false);
      setTimerStatus('Приостановлен');
      
      // Сохраняем запись без обновления счетчика (передаем false)
      await saveCurrentEntry(false);
      
      // Удаляем состояние таймера из localStorage
      localStorage.removeItem('timetracker-timer-state');
    } else {
      // Запуск таймера
      const now = Date.now();
      
      if (elapsedTime === 0) {
        setStartTime(now);
        setLastHourMark(0); // Сбрасываем метку последнего часа
        setLast15MinMark(0); // Сбрасываем метку 15 минут
        
        // Воспроизводим звук начала работы
        playSound(pomodoroStartAudioRef, "Старт", `Начало работы над "${projectText}"`);
      } else {
        setStartTime(now - elapsedTime);
        // Сохраняем последние отметки времени
      }
      
      setIsRunning(true);
      setTimerStatus('Идет отсчет');
      
      // Сохраняем состояние таймера в localStorage
      const timerState = {
        isRunning: true,
        project,
        projectText,
        startTime: now - elapsedTime,
        lastHourMark: elapsedTime === 0 ? 0 : lastHourMark,
        last15MinMark: elapsedTime === 0 ? 0 : last15MinMark,
        timeLimit
      };
      localStorage.setItem('timetracker-timer-state', JSON.stringify(timerState));
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
      playSound(bigBenAudioRef, "Час работы", `Вы работаете над "${projectText}" уже ${elapsedTimeInHours} ч.`);
      setLastHourMark(elapsedTimeInHours * hourInMs);
    }
    
    // Проверяем 15-минутные интервалы
    const fifteenMinInMs = 900000; // 15 минут в миллисекундах
    const elapsedTimeIn15Min = Math.floor(newElapsedTime / fifteenMinInMs);
    const last15MinMarkIn15Min = Math.floor(last15MinMark / fifteenMinInMs);
    
    if (elapsedTimeIn15Min > last15MinMarkIn15Min) {
      // Прошло 15 минут, воспроизводим звук
      playSound(work15AudioRef, "15 минут работы", `Вы работаете над "${projectText}" ${elapsedTimeIn15Min * 15} минут`);
      setLast15MinMark(elapsedTimeIn15Min * fifteenMinInMs);
    }
    
    // Проверка на превышение лимита времени
    if (timeLimit !== null && newElapsedTime >= timeLimit) {
      playSound(workCompleteAudioRef, "Время истекло!", `Ограничение времени для "${projectText}" достигнуто`);
      finishTask();
    }
    
    // Сохраняем состояние таймера в localStorage
    const timerState = {
      isRunning,
      project,
      projectText,
      startTime,
      lastHourMark,
      last15MinMark,
      timeLimit
    };
    localStorage.setItem('timetracker-timer-state', JSON.stringify(timerState));
  };
  
  // Обновление таймера при запуске
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      console.log('Запуск интервала обновления таймера');
      // Интервал для обновления основного таймера
      interval = setInterval(updateTimer, 1000);
    }
    
    return () => {
      if (interval) {
        console.log('Очистка интервала обновления таймера');
        clearInterval(interval);
      }
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
        timeLimit,
        setProject,
        setProjectText,
        toggleTimer,
        finishTask,
        switchProject,
        formatTime,
        setTimeLimit
      }}
    >
      {children}
      <audio ref={workCompleteAudioRef} src="/sounds/work-complete.mp3" />
      <audio ref={bigBenAudioRef} src="/sounds/work-complete.mp3" />
      <audio ref={work15AudioRef} src="/sounds/work-15.mp3" />
      <audio ref={pomodoroStartAudioRef} src="/sounds/pomodoro-start.mp3" />
      <audio ref={pomodoroCompleteAudioRef} src="/sounds/pomodoro-complete.mp3" />
    </TimerContext.Provider>
  );
}

// Хук для использования контекста таймера
export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer должен использоваться внутри TimerProvider');
  }
  return context;
} 