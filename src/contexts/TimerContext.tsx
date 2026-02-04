'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useTimeEntries } from '../hooks/useTimeEntries';
import { useAuth } from './AuthContext';
import { api } from '../lib/api';
import { useTranslation } from 'react-i18next';

// Тип для состояния таймера одного проекта
interface ProjectTimerState {
  isRunning: boolean;
  isPaused: boolean;
  startTime: number;
  elapsedTime: number;
  pausedElapsedTime: number;
  workTypeId: string | null;
  workTypeName: string;
  lastHourMark: number;
  last15MinMark: number;
  timeLimit: number | null;
}

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

// Ключ для хранения состояний таймеров всех проектов
const TIMER_STATES_KEY = 'timetracker-project-timers';

// Функции для работы с localStorage
function loadProjectTimerStates(): Record<string, ProjectTimerState> {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(TIMER_STATES_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveProjectTimerStates(states: Record<string, ProjectTimerState>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TIMER_STATES_KEY, JSON.stringify(states));
}

function getDefaultTimerState(): ProjectTimerState {
  return {
    isRunning: false,
    isPaused: false,
    startTime: 0,
    elapsedTime: 0,
    pausedElapsedTime: 0,
    workTypeId: null,
    workTypeName: '',
    lastHourMark: 0,
    last15MinMark: 0,
    timeLimit: null,
  };
}

// Провайдер контекста
export function TimerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id || '';

  // Храним состояния таймеров для всех проектов
  const projectTimerStatesRef = useRef<Record<string, ProjectTimerState>>(loadProjectTimerStates());

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

  // Форматирование времени (определяем рано для использования в useEffect)
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

  // Обновляем значения переводов после инициализации
  useEffect(() => {
    setTimerStatus(t('timer.status.ready'));
  }, [t]);

  // Загрузка activeProjectId при старте и восстановление состояния таймера
  useEffect(() => {
    async function loadActiveProject() {
      if (!userId) return;
      try {
        const { settings } = await api.settings.get();
        if (settings.activeProjectId) {
          const activeProjectId = settings.activeProjectId;
          setProjectId(activeProjectId);

          // Загружаем информацию о проекте
          const { item } = await api.projects.get(activeProjectId);
          setProjectName(item.name);

          // Загружаем состояние таймера для этого проекта
          const savedState = projectTimerStatesRef.current[activeProjectId];
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
              setElapsedTime(savedState.pausedElapsedTime);
              setPausedElapsedTime(savedState.pausedElapsedTime);
              setTimerValue(formatTime(savedState.pausedElapsedTime));
              setTimerStatus(t('timer.status.paused'));
            }

            setWorkTypeId(savedState.workTypeId);
            setWorkTypeName(savedState.workTypeName);
            setLastHourMark(savedState.lastHourMark);
            setLast15MinMark(savedState.last15MinMark);
            setTimeLimit(savedState.timeLimit);
          }
        }
      } catch (err) {
        console.error('Ошибка при загрузке активного проекта:', err);
      }
    }
    loadActiveProject();
  }, [userId, formatTime, t]);

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

  // Сохранить текущее состояние таймера для проекта
  const saveCurrentTimerState = useCallback((forProjectId: string) => {
    if (!forProjectId) return;

    const currentState: ProjectTimerState = {
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
    };

    projectTimerStatesRef.current[forProjectId] = currentState;
    saveProjectTimerStates(projectTimerStatesRef.current);
  }, [isRunning, isPaused, startTime, elapsedTime, pausedElapsedTime, workTypeId, workTypeName, lastHourMark, last15MinMark, timeLimit]);

  // Загрузить состояние таймера для проекта
  const loadTimerStateForProject = useCallback((forProjectId: string) => {
    const savedState = projectTimerStatesRef.current[forProjectId];

    if (savedState) {
      // Если таймер был запущен, нужно пересчитать elapsed time
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
        // Таймер остановлен
        setIsRunning(false);
        setIsPaused(false);
        setStartTime(0);
        setElapsedTime(0);
        setPausedElapsedTime(0);
        setTimerValue('00:00:00');
        setTimerStatus(t('timer.status.ready'));
      }

      setWorkTypeId(savedState.workTypeId);
      setWorkTypeName(savedState.workTypeName);
      setLastHourMark(savedState.lastHourMark);
      setLast15MinMark(savedState.last15MinMark);
      setTimeLimit(savedState.timeLimit);
    } else {
      // Нет сохранённого состояния - сбросить к начальным значениям
      setIsRunning(false);
      setIsPaused(false);
      setStartTime(0);
      setElapsedTime(0);
      setPausedElapsedTime(0);
      setTimerValue('00:00:00');
      setTimerStatus(t('timer.status.ready'));
      setWorkTypeId(null);
      setWorkTypeName('');
      setLastHourMark(0);
      setLast15MinMark(0);
      setTimeLimit(null);
    }
  }, [formatTime, t]);

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

    // Сохраняем запись времени если таймер работал
    if (isRunning && projectId) {
      await saveCurrentEntry();
    }

    // Сохраняем текущее состояние таймера для старого проекта
    if (projectId) {
      // При переключении ставим таймер на паузу
      if (isRunning) {
        const pauseState: ProjectTimerState = {
          isRunning: false,
          isPaused: true,
          startTime: 0,
          elapsedTime: elapsedTime,
          pausedElapsedTime: elapsedTime,
          workTypeId,
          workTypeName,
          lastHourMark,
          last15MinMark,
          timeLimit,
        };
        projectTimerStatesRef.current[projectId] = pauseState;
      } else {
        saveCurrentTimerState(projectId);
      }
      saveProjectTimerStates(projectTimerStatesRef.current);
    }

    // Переключаемся на новый проект
    setProjectId(newProjectId);
    setProjectName(newProjectName);

    // Загружаем состояние таймера для нового проекта
    loadTimerStateForProject(newProjectId);

    // Активируем проект в API
    try {
      await api.projects.activate(newProjectId);
    } catch (err) {
      console.error('Ошибка при активации проекта:', err);
    }
  };

  // Завершение текущей задачи
  const finishTask = async (): Promise<void> => {
    if (!isRunning && !isPaused) return;

    await saveCurrentEntry(true);

    setIsRunning(false);
    setIsPaused(false);
    setTimerStatus(t('timer.status.ready'));
    setElapsedTime(0);
    setPausedElapsedTime(0);
    setTimerValue('00:00:00');
    setStartTime(0);
    setLastHourMark(0);
    setLast15MinMark(0);

    // Очищаем состояние таймера для этого проекта
    if (projectId) {
      delete projectTimerStatesRef.current[projectId];
      saveProjectTimerStates(projectTimerStatesRef.current);
    }
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
        saveCurrentTimerState(projectId);
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

      // Сохраняем состояние для этого проекта
      const pauseState: ProjectTimerState = {
        isRunning: false,
        isPaused: true,
        startTime: 0,
        elapsedTime: elapsedTime,
        pausedElapsedTime: elapsedTime,
        workTypeId,
        workTypeName,
        lastHourMark,
        last15MinMark,
        timeLimit,
      };
      projectTimerStatesRef.current[projectId] = pauseState;
      saveProjectTimerStates(projectTimerStatesRef.current);
    } else {
      if (isPaused) {
        const newStartTime = Date.now() - pausedElapsedTime;
        setIsRunning(true);
        setIsPaused(false);
        setStartTime(newStartTime);
        setTimerStatus(t('timer.status.resumed'));

        // Сохраняем состояние для этого проекта
        const runningState: ProjectTimerState = {
          isRunning: true,
          isPaused: false,
          startTime: newStartTime,
          elapsedTime: pausedElapsedTime,
          pausedElapsedTime: 0,
          workTypeId,
          workTypeName,
          lastHourMark,
          last15MinMark,
          timeLimit,
        };
        projectTimerStatesRef.current[projectId] = runningState;
        saveProjectTimerStates(projectTimerStatesRef.current);
      } else {
        const newStartTime = Date.now();
        setIsRunning(true);
        setStartTime(newStartTime);
        setElapsedTime(0);
        setPausedElapsedTime(0);
        setTimerStatus(t('timer.status.running'));
        setLastHourMark(0);
        setLast15MinMark(0);

        playSound(pomodoroStartAudioRef, "Начало работы", `Начало работы над "${projectName}"`);

        // Сохраняем состояние для этого проекта
        const runningState: ProjectTimerState = {
          isRunning: true,
          isPaused: false,
          startTime: newStartTime,
          elapsedTime: 0,
          pausedElapsedTime: 0,
          workTypeId,
          workTypeName,
          lastHourMark: 0,
          last15MinMark: 0,
          timeLimit,
        };
        projectTimerStatesRef.current[projectId] = runningState;
        saveProjectTimerStates(projectTimerStatesRef.current);
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

    // Сохраняем состояние для текущего проекта
    if (projectId) {
      const runningState: ProjectTimerState = {
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
      };
      projectTimerStatesRef.current[projectId] = runningState;
      saveProjectTimerStates(projectTimerStatesRef.current);
    }
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
