'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTimeEntries } from '../hooks/useTimeEntries';
import { useAuth } from './AuthContext';
import { api } from '../lib/api';
import { useTranslation } from 'react-i18next';
import { useTimerPersistence, ProjectTimerState } from '../hooks/useTimerPersistence';
import { useTimerNotifications } from '../hooks/useTimerNotifications';
import {
  MS_PER_SECOND,
  MS_PER_HOUR,
  MS_PER_15_MINUTES,
  SECONDS_PER_MINUTE,
  SECONDS_PER_HOUR,
  MIN_ENTRY_DURATION_MS,
  QUICK_TOGGLE_THRESHOLD_MS,
  DEFAULT_TIMER_VALUE,
} from '../lib/constants/time';

// Re-export type for backward compatibility
export type { ProjectTimerState } from '../hooks/useTimerPersistence';

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

  // Используем хуки для persistence и notifications
  const persistence = useTimerPersistence();
  const notifications = useTimerNotifications();

  // Состояние таймера текущего проекта
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
  const [timerValue, setTimerValue] = useState(DEFAULT_TIMER_VALUE);
  const [dailyTotal, setDailyTotal] = useState<number>(0);
  const [lastHourMark, setLastHourMark] = useState(0);
  const [last15MinMark, setLast15MinMark] = useState(0);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);

  // Используем хук для работы с записями времени
  const { addTimeEntry, getTodayEntries } = useTimeEntries();

  // Получаем функцию перевода
  const { t } = useTranslation();

  // Форматирование времени
  const formatTime = useCallback((milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / MS_PER_SECOND);
    const hours = Math.floor(totalSeconds / SECONDS_PER_HOUR);
    const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
    const seconds = totalSeconds % SECONDS_PER_MINUTE;

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  }, []);

  // Обновляем значения переводов после инициализации
  useEffect(() => {
    setTimerStatus(t('timer.status.ready'));
  }, [t]);

  // Создание состояния для сохранения
  const createTimerState = useCallback((overrides: Partial<ProjectTimerState> = {}): ProjectTimerState => {
    return {
      isRunning,
      isPaused,
      startTime,
      elapsedTime,
      pausedElapsedTime,
      workTypeId,
      workTypeName,
      lastHourMark,
      last15MinMark,
      timeLimit,
      ...overrides,
    };
  }, [isRunning, isPaused, startTime, elapsedTime, pausedElapsedTime, workTypeId, workTypeName, lastHourMark, last15MinMark, timeLimit]);

  // Применение сохранённого состояния
  const applyTimerState = useCallback((savedState: ProjectTimerState | undefined) => {
    if (savedState) {
      if (savedState.isRunning && savedState.startTime > 0) {
        const currentElapsed = Date.now() - savedState.startTime;
        setIsRunning(true);
        setIsPaused(false);
        setStartTime(savedState.startTime);
        setElapsedTime(currentElapsed);
        setTimerValue(formatTime(currentElapsed));
        setTimerStatus(t('timer.status.running'));
      } else if (savedState.isPaused) {
        setIsRunning(false);
        setIsPaused(true);
        setStartTime(0);
        setElapsedTime(savedState.pausedElapsedTime);
        setPausedElapsedTime(savedState.pausedElapsedTime);
        setTimerValue(formatTime(savedState.pausedElapsedTime));
        setTimerStatus(t('timer.status.paused'));
      } else {
        resetTimerState();
      }

      setWorkTypeId(savedState.workTypeId);
      setWorkTypeName(savedState.workTypeName);
      setLastHourMark(savedState.lastHourMark);
      setLast15MinMark(savedState.last15MinMark);
      setTimeLimit(savedState.timeLimit);
    } else {
      resetTimerState();
    }
  }, [formatTime, t]);

  // Сброс состояния таймера
  const resetTimerState = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setStartTime(0);
    setElapsedTime(0);
    setPausedElapsedTime(0);
    setTimerValue(DEFAULT_TIMER_VALUE);
    setTimerStatus(t('timer.status.ready'));
    setWorkTypeId(null);
    setWorkTypeName('');
    setLastHourMark(0);
    setLast15MinMark(0);
    setTimeLimit(null);
  }, [t]);

  // Загрузка activeProjectId при старте и восстановление состояния таймера
  useEffect(() => {
    const loadActiveProject = async () => {
      if (!userId) return;
      try {
        const { settings } = await api.settings.get();
        if (settings.activeProjectId) {
          const activeProjectId = settings.activeProjectId;
          setProjectId(activeProjectId);

          const { item } = await api.projects.get(activeProjectId);
          setProjectName(item.name);

          const savedState = persistence.getProjectState(activeProjectId);
          applyTimerState(savedState);
        }
      } catch (err) {
        console.error('Ошибка при загрузке активного проекта:', err);
      }
    };
    loadActiveProject();
  }, [userId, applyTimerState, persistence]);

  // Загрузка базового времени за день
  const updateCompletedTimeTotal = useCallback(async () => {
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
  }, [userId, getTodayEntries]);

  useEffect(() => {
    if (userId) {
      updateCompletedTimeTotal();
    }
  }, [userId, updateCompletedTimeTotal]);

  // Сохранение текущей записи
  const saveCurrentEntry = useCallback(async (isFinishing: boolean = false): Promise<void> => {
    if (!isRunning && !isPaused) return;
    if (!projectId) {
      console.error('Не выбран проект для сохранения записи');
      return;
    }

    if (elapsedTime < MIN_ENTRY_DURATION_MS && process.env.NODE_ENV !== 'test') {
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
        notifications.notifyWorkComplete(projectName);
      }
    } catch (error) {
      console.error('Ошибка при сохранении записи:', error);
    }
  }, [isRunning, isPaused, projectId, elapsedTime, startTime, workTypeId, projectName, addTimeEntry, updateCompletedTimeTotal, notifications]);

  // Переключение между проектами
  const switchProject = useCallback(async (newProjectId: string, newProjectName: string): Promise<void> => {
    if (projectId === newProjectId) return;

    // Сохраняем запись времени если таймер работал
    if (isRunning && projectId) {
      await saveCurrentEntry();
    }

    // Сохраняем текущее состояние таймера для старого проекта
    if (projectId) {
      if (isRunning) {
        const pauseState = createTimerState({
          isRunning: false,
          isPaused: true,
          startTime: 0,
          pausedElapsedTime: elapsedTime,
        });
        persistence.saveProjectState(projectId, pauseState);
      } else {
        persistence.saveProjectState(projectId, createTimerState());
      }
    }

    // Переключаемся на новый проект
    setProjectId(newProjectId);
    setProjectName(newProjectName);

    // Загружаем состояние таймера для нового проекта
    const savedState = persistence.getProjectState(newProjectId);
    applyTimerState(savedState);

    // Активируем проект в API
    try {
      await api.projects.activate(newProjectId);
    } catch (err) {
      console.error('Ошибка при активации проекта:', err);
    }
  }, [projectId, isRunning, elapsedTime, saveCurrentEntry, createTimerState, persistence, applyTimerState]);

  // Завершение текущей задачи
  const finishTask = useCallback(async (): Promise<void> => {
    if (!isRunning && !isPaused) return;

    await saveCurrentEntry(true);

    setIsRunning(false);
    setIsPaused(false);
    setTimerStatus(t('timer.status.ready'));
    setElapsedTime(0);
    setPausedElapsedTime(0);
    setTimerValue(DEFAULT_TIMER_VALUE);
    setStartTime(0);
    setLastHourMark(0);
    setLast15MinMark(0);

    // Очищаем состояние таймера для этого проекта
    if (projectId) {
      persistence.clearProjectState(projectId);
    }
  }, [isRunning, isPaused, projectId, saveCurrentEntry, persistence, t]);

  // Переключение запуска таймера
  const toggleTimer = useCallback(async () => {
    if (!projectId) {
      console.error('Выберите проект перед запуском таймера');
      return;
    }

    if (isRunning) {
      const now = Date.now();
      const elapsed = now - startTime;

      if (elapsed < QUICK_TOGGLE_THRESHOLD_MS) {
        setIsRunning(false);
        setIsPaused(true);
        setPausedElapsedTime(elapsedTime);
        setTimerStatus(t('timer.status.paused'));
        persistence.saveProjectState(projectId, createTimerState({
          isRunning: false,
          isPaused: true,
          startTime: 0,
          pausedElapsedTime: elapsedTime,
        }));
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

      persistence.saveProjectState(projectId, createTimerState({
        isRunning: false,
        isPaused: true,
        startTime: 0,
        pausedElapsedTime: elapsedTime,
      }));
    } else {
      if (isPaused) {
        const newStartTime = Date.now() - pausedElapsedTime;
        setIsRunning(true);
        setIsPaused(false);
        setStartTime(newStartTime);
        setTimerStatus(t('timer.status.resumed'));

        persistence.saveProjectState(projectId, createTimerState({
          isRunning: true,
          isPaused: false,
          startTime: newStartTime,
          elapsedTime: pausedElapsedTime,
          pausedElapsedTime: 0,
        }));
      } else {
        const newStartTime = Date.now();
        setIsRunning(true);
        setStartTime(newStartTime);
        setElapsedTime(0);
        setPausedElapsedTime(0);
        setTimerStatus(t('timer.status.running'));
        setLastHourMark(0);
        setLast15MinMark(0);

        notifications.notifyWorkStart(projectName);

        persistence.saveProjectState(projectId, createTimerState({
          isRunning: true,
          isPaused: false,
          startTime: newStartTime,
          elapsedTime: 0,
          pausedElapsedTime: 0,
          lastHourMark: 0,
          last15MinMark: 0,
        }));
      }
    }
  }, [projectId, isRunning, isPaused, startTime, elapsedTime, pausedElapsedTime, projectName, saveCurrentEntry, createTimerState, persistence, notifications, t]);

  // Обновление таймера
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      const updateTimer = () => {
        const currentTime = Date.now();
        const newElapsedTime = currentTime - startTime;
        setElapsedTime(newElapsedTime);
        setTimerValue(formatTime(newElapsedTime));

        const elapsedTimeInHours = Math.floor(newElapsedTime / MS_PER_HOUR);
        const lastHourMarkInHours = Math.floor(lastHourMark / MS_PER_HOUR);

        if (elapsedTimeInHours > lastHourMarkInHours) {
          notifications.notifyHourMark(projectName, elapsedTimeInHours);
          setLastHourMark(elapsedTimeInHours * MS_PER_HOUR);
        }

        const elapsedTimeIn15Min = Math.floor(newElapsedTime / MS_PER_15_MINUTES);
        const last15MinMarkIn15Min = Math.floor(last15MinMark / MS_PER_15_MINUTES);

        if (elapsedTimeIn15Min > last15MinMarkIn15Min) {
          notifications.notify15MinMark(projectName, elapsedTimeIn15Min * 15);
          setLast15MinMark(elapsedTimeIn15Min * MS_PER_15_MINUTES);
        }

        if (timeLimit !== null && newElapsedTime >= timeLimit) {
          notifications.notifyTimeLimitReached(projectName);
          finishTask();
        }

        // Сохраняем состояние для текущего проекта
        if (projectId) {
          persistence.saveProjectState(projectId, {
            isRunning: true,
            isPaused: false,
            startTime,
            elapsedTime: newElapsedTime,
            pausedElapsedTime: 0,
            workTypeId,
            workTypeName,
            lastHourMark,
            last15MinMark,
            timeLimit,
          });
        }
      };

      interval = setInterval(updateTimer, MS_PER_SECOND);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, startTime, projectId, projectName, lastHourMark, last15MinMark, timeLimit, workTypeId, workTypeName, formatTime, notifications, persistence, finishTask]);

  const AudioElements = notifications.AudioElements;

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
      <AudioElements />
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
