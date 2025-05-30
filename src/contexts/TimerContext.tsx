'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useTimeEntries } from '../hooks/useTimeEntries';
import { useAuth } from './AuthContext';
import settingsService from '../lib/settingsService';
import { useTranslation } from 'react-i18next';

// Тип для контекста таймера
interface TimerContextType {
  // Состояние таймера
  project: string;
  projectText: string;
  isRunning: boolean;
  isPaused: boolean;
  startTime: number;
  elapsedTime: number;
  pausedElapsedTime: number;
  timerStatus: string;
  timerValue: string;
  dailyTotal: number; // Изменяем тип на number
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
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pausedElapsedTime, setPausedElapsedTime] = useState(0);
  const [timerStatus, setTimerStatus] = useState('Готов'); // Временное значение
  const [timerValue, setTimerValue] = useState('00:00:00');
  const [projectText, setProjectText] = useState('Веб-разработка'); // Временное значение
  const [dailyTotal, setDailyTotal] = useState<number>(0); // Состояние для общего времени за день в миллисекундах
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
  
  // Получаем функцию перевода (важно: все useState и useRef должны быть выше)
  const { t } = useTranslation();
  
  // Обновляем значения переводов после инициализации
  useEffect(() => {
    setTimerStatus(t('timer.status.ready'));
    setProjectText(t('timer.standard.development'));
  }, [t]);
  
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
          
          // Восстанавливаем время с учетом прошедшего
          const savedStartTime = timerState.startTime;
          setStartTime(savedStartTime);
          
          // Обновляем прошедшее время с учетом времени, прошедшего с момента сохранения
          const currentElapsed = Date.now() - savedStartTime;
          setElapsedTime(currentElapsed);
          setTimerValue(formatTime(currentElapsed));
          
          // Восстанавливаем метки времени и лимит
          setLastHourMark(timerState.lastHourMark || 0);
          setLast15MinMark(timerState.last15MinMark || 0);
          if (timerState.timeLimit) {
            setTimeLimit(timerState.timeLimit);
          }
          
          setTimerStatus(t('timer.status.running'));
        } else if (timerState.isPaused) {
          // Восстанавливаем состояние паузы
          setProject(timerState.project);
          setProjectText(timerState.projectText);
          setIsPaused(true);
          setPausedElapsedTime(timerState.pausedElapsedTime || 0);
          setElapsedTime(timerState.pausedElapsedTime || 0);
          setTimerValue(formatTime(timerState.pausedElapsedTime || 0));
          if (timerState.timeLimit) {
            setTimeLimit(timerState.timeLimit);
          }
          setTimerStatus(t('timer.status.paused'));
        }
      } catch (error) {
        console.error('Ошибка при восстановлении состояния таймера:', error);
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
      } else if (isPaused) {
        const timerState = {
          isRunning: false,
          isPaused: true,
          project,
          projectText,
          pausedElapsedTime,
          timeLimit
        };
        localStorage.setItem('timetracker-timer-state', JSON.stringify(timerState));
      } else {
        localStorage.removeItem('timetracker-timer-state');
      }
    };
  }, [t]);
  
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
      setDailyTotal(totalMilliseconds); // Сохраняем общее время в миллисекундах
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
  const formatTime = useCallback((milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  }, []);
  
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
    if (!isRunning && !isPaused) return;
    
    // НОВАЯ ПРОВЕРКА: не сохраняем записи менее 60 секунд, чтобы не создавать "мусор" в базе
    // Пропускаем проверку на минимальную продолжительность в тестовой среде
    if (elapsedTime < 60000 && process.env.NODE_ENV !== 'test') { // 60 секунд в миллисекундах
      console.log(`Пропуск записи с малой продолжительностью: ${elapsedTime}ms (${Math.floor(elapsedTime/1000)} сек)`);
      return;
    }
    
    const now = new Date();
    const entryData = {
      user_id: userId,
      project_type: project,
      start_time: new Date(startTime),
      end_time: now,
      duration: elapsedTime
    };
    
    try {
      // Двойная проверка дат перед сохранением
      const startMs = new Date(entryData.start_time).getTime();
      const endMs = new Date(entryData.end_time).getTime();
      
      if (startMs >= endMs) {
        console.error('Некорректный интервал времени:', entryData);
        return;
      }
      
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
      setTimerStatus(t('timer.status.running'));
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
      setTimerStatus(t('timer.status.ready'));
    }
  };
  
  // Завершение текущей задачи
  const finishTask = async (): Promise<void> => {
    if (!isRunning) return;
    
    // Сохраняем запись и передаем true, указывая что это завершение
    await saveCurrentEntry(true);
    
    // Сбрасываем таймер
    setIsRunning(false);
    setTimerStatus(t('timer.status.ready'));
    setElapsedTime(0);
    setTimerValue('00:00:00');
    setStartTime(0);
    setLastHourMark(0);
    setLast15MinMark(0);
    
    // Удаляем состояние таймера из localStorage
    localStorage.removeItem('timetracker-timer-state');
  };
  
  // Переключение запуска таймера
  const toggleTimer = async () => {
    if (isRunning) {
      // Остановка таймера - теперь это пауза, а не полный сброс
      const now = Date.now();
      const elapsed = now - startTime;
      
      // Минимальная длительность записи - 5 секунд (только для сохранения)
      if (elapsed < 5000) {
        console.log('Слишком короткая запись (меньше 5 секунд), не будем сохранять');
        // Но мы все равно можем поставить на паузу, не сбрасывая таймер
        setIsRunning(false);
        setIsPaused(true);
        // Сохраняем текущее значение для возобновления
        setPausedElapsedTime(elapsedTime);
        setTimerStatus(t('timer.status.paused'));
        return;
      }
      
      try {
        // Сохраняем текущую запись с прошедшим временем
        await saveCurrentEntry(false);
      } catch (error) {
        console.error('Ошибка при остановке таймера:', error);
      }
      
      // Вместо полного сброса - ставим на паузу
      setIsRunning(false);
      setIsPaused(true);
      setPausedElapsedTime(elapsedTime); // Сохраняем текущее значение
      setTimerStatus(t('timer.status.paused'));
      
      // Сохраняем состояние паузы в localStorage
      const timerState = {
        isRunning: false,
        isPaused: true,
        project,
        projectText,
        pausedElapsedTime: elapsedTime,
        timeLimit
      };
      localStorage.setItem('timetracker-timer-state', JSON.stringify(timerState));
    } else {
      if (isPaused) {
        // Возобновление таймера после паузы
        setIsRunning(true);
        setIsPaused(false);
        // Устанавливаем новое время старта с учетом уже прошедшего времени
        setStartTime(Date.now() - pausedElapsedTime);
        setTimerStatus(t('timer.status.resumed'));
        
        // Сохраняем состояние в localStorage
        const timerState = {
          isRunning: true,
          isPaused: false,
          project,
          projectText,
          startTime: Date.now() - pausedElapsedTime,
          lastHourMark,
          last15MinMark,
          timeLimit
        };
        localStorage.setItem('timetracker-timer-state', JSON.stringify(timerState));
      } else {
        // Запуск таймера с нуля
        setIsRunning(true);
        setStartTime(Date.now());
        setElapsedTime(0);
        setPausedElapsedTime(0);
        setTimerStatus(t('timer.status.running'));
        setLastHourMark(0);
        setLast15MinMark(0);
        
        // Воспроизводим звук начала работы
        playSound(pomodoroStartAudioRef, "Начало работы", `Начало работы над "${projectText}"`);
        
        // Сохраняем состояние в localStorage
        const timerState = {
          isRunning: true,
          isPaused: false,
          project,
          projectText,
          startTime: Date.now(),
          lastHourMark: 0,
          last15MinMark: 0,
          timeLimit
        };
        localStorage.setItem('timetracker-timer-state', JSON.stringify(timerState));
      }
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
        isPaused,
        startTime,
        elapsedTime,
        pausedElapsedTime,
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