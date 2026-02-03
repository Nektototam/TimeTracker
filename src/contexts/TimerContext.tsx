'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useTimeEntries } from '../hooks/useTimeEntries';
import { useAuth } from './AuthContext';
import { api } from '../lib/api';
import { useTranslation } from 'react-i18next';

// Тип для контекста таймера
interface TimerContextType {
  // Состояние таймера
  projectId: string | null;
  projectName: string;
  workTypeId: string | null;
  workTypeName: string;
  isRunning: boolean;
  isPaused: boolean;
  startTime: number;
  elapsedTime: number;
  pausedElapsedTime: number;
  timerStatus: string;
  timerValue: string;
  dailyTotal: number;
  timeLimit: number | null;
  // Методы
  setProjectId: (projectId: string | null) => void;
  setProjectName: (name: string) => void;
  setWorkTypeId: (workTypeId: string | null) => void;
  setWorkTypeName: (name: string) => void;
  toggleTimer: () => Promise<void>;
  finishTask: () => Promise<void>;
  switchProject: (newProjectId: string, newProjectName: string) => Promise<void>;
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
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [workTypeId, setWorkTypeId] = useState<string | null>(null);
  const [workTypeName, setWorkTypeName] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pausedElapsedTime, setPausedElapsedTime] = useState(0);
  const [timerStatus, setTimerStatus] = useState('Готов');
  const [timerValue, setTimerValue] = useState('00:00:00');
  const [dailyTotal, setDailyTotal] = useState<number>(0);
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
  const { addTimeEntry, getTodayEntries } = useTimeEntries();

  // Получаем функцию перевода
  const { t } = useTranslation();

  // Обновляем значения переводов после инициализации
  useEffect(() => {
    setTimerStatus(t('timer.status.ready'));
  }, [t]);

  // Загрузка activeProjectId при старте
  useEffect(() => {
    async function loadActiveProject() {
      if (!userId) return;
      try {
        const { settings } = await api.settings.get();
        if (settings.activeProjectId) {
          setProjectId(settings.activeProjectId);
          // Загружаем информацию о проекте
          const { item } = await api.projects.get(settings.activeProjectId);
          setProjectName(item.name);
        }
      } catch (err) {
        console.error('Ошибка при загрузке активного проекта:', err);
      }
    }
    loadActiveProject();
  }, [userId]);

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
        if (timerState.isRunning) {
          setProjectId(timerState.projectId);
          setProjectName(timerState.projectName || '');
          setWorkTypeId(timerState.workTypeId || null);
          setWorkTypeName(timerState.workTypeName || '');
          setIsRunning(true);

          const savedStartTime = timerState.startTime;
          setStartTime(savedStartTime);

          const currentElapsed = Date.now() - savedStartTime;
          setElapsedTime(currentElapsed);
          setTimerValue(formatTime(currentElapsed));

          setLastHourMark(timerState.lastHourMark || 0);
          setLast15MinMark(timerState.last15MinMark || 0);
          if (timerState.timeLimit) {
            setTimeLimit(timerState.timeLimit);
          }

          setTimerStatus(t('timer.status.running'));
        } else if (timerState.isPaused) {
          setProjectId(timerState.projectId);
          setProjectName(timerState.projectName || '');
          setWorkTypeId(timerState.workTypeId || null);
          setWorkTypeName(timerState.workTypeName || '');
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
      if (isRunning) {
        const timerState = {
          isRunning,
          projectId,
          projectName,
          workTypeId,
          workTypeName,
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
          projectId,
          projectName,
          workTypeId,
          workTypeName,
          pausedElapsedTime,
          timeLimit
        };
        localStorage.setItem('timetracker-timer-state', JSON.stringify(timerState));
      } else {
        localStorage.removeItem('timetracker-timer-state');
      }
    };
  }, [t]);

  // Загрузка базового времени за день
  const updateCompletedTimeTotal = async () => {
    if (!userId) return;

    try {
      const todayEntries = await getTodayEntries();
      const totalMilliseconds = todayEntries.reduce(
        (total, entry) => total + entry.duration,
        0
      );
      setDailyTotal(totalMilliseconds);
    } catch (err) {
      console.error('Ошибка при загрузке времени завершенных задач:', err);
    }
  };

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

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/icons/timetracker-icon.png'
      });
    }
  };

  // Сохранение текущей записи
  const saveCurrentEntry = async (isFinishing: boolean = false): Promise<void> => {
    if (!isRunning && !isPaused) return;
    if (!projectId) {
      console.error('Не выбран проект для сохранения записи');
      return;
    }

    if (elapsedTime < 60000 && process.env.NODE_ENV !== 'test') {
      console.log(`Пропуск записи с малой продолжительностью: ${elapsedTime}ms`);
      return;
    }

    const now = new Date();
    const entryData = {
      project_id: projectId,
      work_type_id: workTypeId || undefined,
      start_time: new Date(startTime),
      end_time: now,
      duration: elapsedTime
    };

    try {
      const startMs = new Date(entryData.start_time).getTime();
      const endMs = new Date(entryData.end_time).getTime();

      if (startMs >= endMs) {
        console.error('Некорректный интервал времени:', entryData);
        return;
      }

      await addTimeEntry(entryData);

      if (isFinishing) {
        await updateCompletedTimeTotal();
        playSound(workCompleteAudioRef, "Задача завершена", `Вы завершили работу над "${projectName}"`);
      }
    } catch (error) {
      console.error('Ошибка при сохранении записи:', error);
    }
  };

  // Переключение между проектами
  const switchProject = async (newProjectId: string, newProjectName: string): Promise<void> => {
    if (projectId === newProjectId) return;

    await saveCurrentEntry();

    setProjectId(newProjectId);
    setProjectName(newProjectName);
    setWorkTypeId(null);
    setWorkTypeName('');

    setStartTime(Date.now());
    setElapsedTime(0);
    setTimerValue('00:00:00');
    setTimeLimit(null);

    // Активируем проект
    try {
      await api.projects.activate(newProjectId);
    } catch (err) {
      console.error('Ошибка при активации проекта:', err);
    }

    if (isRunning) {
      setTimerStatus(t('timer.status.running'));
      setLastHourMark(0);
      setLast15MinMark(0);

      playSound(pomodoroStartAudioRef, "Новая задача", `Начало работы над "${newProjectName}"`);

      const timerState = {
        isRunning,
        projectId: newProjectId,
        projectName: newProjectName,
        workTypeId: null,
        workTypeName: '',
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

    await saveCurrentEntry(true);

    setIsRunning(false);
    setTimerStatus(t('timer.status.ready'));
    setElapsedTime(0);
    setTimerValue('00:00:00');
    setStartTime(0);
    setLastHourMark(0);
    setLast15MinMark(0);

    localStorage.removeItem('timetracker-timer-state');
  };

  // Переключение запуска таймера
  const toggleTimer = async () => {
    if (!projectId) {
      console.error('Выберите проект перед запуском таймера');
      return;
    }

    if (isRunning) {
      const now = Date.now();
      const elapsed = now - startTime;

      if (elapsed < 5000) {
        setIsRunning(false);
        setIsPaused(true);
        setPausedElapsedTime(elapsedTime);
        setTimerStatus(t('timer.status.paused'));
        return;
      }

      try {
        await saveCurrentEntry(false);
      } catch (error) {
        console.error('Ошибка при остановке таймера:', error);
      }

      setIsRunning(false);
      setIsPaused(true);
      setPausedElapsedTime(elapsedTime);
      setTimerStatus(t('timer.status.paused'));

      const timerState = {
        isRunning: false,
        isPaused: true,
        projectId,
        projectName,
        workTypeId,
        workTypeName,
        pausedElapsedTime: elapsedTime,
        timeLimit
      };
      localStorage.setItem('timetracker-timer-state', JSON.stringify(timerState));
    } else {
      if (isPaused) {
        setIsRunning(true);
        setIsPaused(false);
        setStartTime(Date.now() - pausedElapsedTime);
        setTimerStatus(t('timer.status.resumed'));

        const timerState = {
          isRunning: true,
          isPaused: false,
          projectId,
          projectName,
          workTypeId,
          workTypeName,
          startTime: Date.now() - pausedElapsedTime,
          lastHourMark,
          last15MinMark,
          timeLimit
        };
        localStorage.setItem('timetracker-timer-state', JSON.stringify(timerState));
      } else {
        setIsRunning(true);
        setStartTime(Date.now());
        setElapsedTime(0);
        setPausedElapsedTime(0);
        setTimerStatus(t('timer.status.running'));
        setLastHourMark(0);
        setLast15MinMark(0);

        playSound(pomodoroStartAudioRef, "Начало работы", `Начало работы над "${projectName}"`);

        const timerState = {
          isRunning: true,
          isPaused: false,
          projectId,
          projectName,
          workTypeId,
          workTypeName,
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

    const hourInMs = 3600000;
    const elapsedTimeInHours = Math.floor(newElapsedTime / hourInMs);
    const lastHourMarkInHours = Math.floor(lastHourMark / hourInMs);

    if (elapsedTimeInHours > lastHourMarkInHours) {
      playSound(bigBenAudioRef, "Час работы", `Вы работаете над "${projectName}" уже ${elapsedTimeInHours} ч.`);
      setLastHourMark(elapsedTimeInHours * hourInMs);
    }

    const fifteenMinInMs = 900000;
    const elapsedTimeIn15Min = Math.floor(newElapsedTime / fifteenMinInMs);
    const last15MinMarkIn15Min = Math.floor(last15MinMark / fifteenMinInMs);

    if (elapsedTimeIn15Min > last15MinMarkIn15Min) {
      playSound(work15AudioRef, "15 минут работы", `Вы работаете над "${projectName}" ${elapsedTimeIn15Min * 15} минут`);
      setLast15MinMark(elapsedTimeIn15Min * fifteenMinInMs);
    }

    if (timeLimit !== null && newElapsedTime >= timeLimit) {
      playSound(workCompleteAudioRef, "Время истекло!", `Ограничение времени для "${projectName}" достигнуто`);
      finishTask();
    }

    const timerState = {
      isRunning,
      projectId,
      projectName,
      workTypeId,
      workTypeName,
      startTime,
      lastHourMark,
      last15MinMark,
      timeLimit
    };
    localStorage.setItem('timetracker-timer-state', JSON.stringify(timerState));
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(updateTimer, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, startTime]);

  return (
    <TimerContext.Provider
      value={{
        projectId,
        projectName,
        workTypeId,
        workTypeName,
        isRunning,
        isPaused,
        startTime,
        elapsedTime,
        pausedElapsedTime,
        timerStatus,
        timerValue,
        dailyTotal,
        timeLimit,
        setProjectId,
        setProjectName,
        setWorkTypeId,
        setWorkTypeName,
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
