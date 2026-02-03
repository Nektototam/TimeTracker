import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/Button';

interface PomodoroCycleProps {
  workDuration?: number; // в минутах
  restDuration?: number; // в минутах
  cycles?: number;
}

enum TimerState {
  IDLE = 'idle',
  WORK = 'work',
  REST = 'rest',
  COMPLETED = 'completed'
}

const PomodoroCycle: React.FC<PomodoroCycleProps> = ({
  workDuration = 25,
  restDuration = 5,
  cycles = 4
}) => {
  const { currentLanguage, translationInstance } = useLanguage();
  const { t } = translationInstance;
  
  const [state, setState] = useState<TimerState>(TimerState.IDLE);
  const [timeLeft, setTimeLeft] = useState<number>(workDuration * 60);
  const [currentCycle, setCurrentCycle] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(false);
  
  // Локальные переводы на случай, если контекст не загрузился
  const localTranslations: Record<string, Record<string, string>> = {
    ru: {
      work: 'Работа',
      rest: 'Отдых',
      start: 'Старт',
      stop: 'Стоп',
      reset: 'Сброс',
      cycle: 'Цикл',
      completed: 'Завершено'
    },
    en: {
      work: 'Work',
      rest: 'Rest',
      start: 'Start',
      stop: 'Stop',
      reset: 'Reset',
      cycle: 'Cycle',
      completed: 'Completed'
    },
    he: {
      work: 'עבוד',
      rest: 'מנוח',
      start: 'התחל',
      stop: 'עצור',
      reset: 'אפס',
      cycle: 'מחזור',
      completed: 'הושלם'
    }
  };
  
  // Функция локального перевода
  const getLocalTranslation = (key: string): string => {
    const lang = currentLanguage in localTranslations ? currentLanguage : 'ru';
    return localTranslations[lang][key] || key;
  };
  
  // Фактическая функция перевода - использует i18n если доступен, иначе локальные переводы
  const translate = (key: string): string => {
    // Пробуем использовать i18n перевод
    const i18nTranslation = t(`pomodoro.${key}`);
    
    // Если перевод вернул тот же ключ (не найден), используем локальный перевод
    if (i18nTranslation === `pomodoro.${key}`) {
      return getLocalTranslation(key);
    }
    
    return i18nTranslation;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Переключение между работой и отдыхом
      if (state === TimerState.WORK) {
        setState(TimerState.REST);
        setTimeLeft(restDuration * 60);
      } else if (state === TimerState.REST) {
        if (currentCycle < cycles) {
          setState(TimerState.WORK);
          setTimeLeft(workDuration * 60);
          setCurrentCycle((prev) => prev + 1);
        } else {
          setState(TimerState.COMPLETED);
          setIsActive(false);
        }
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, state, currentCycle, cycles, workDuration, restDuration]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = (): void => {
    if (state === TimerState.IDLE || state === TimerState.COMPLETED) {
      setState(TimerState.WORK);
      setTimeLeft(workDuration * 60);
      setCurrentCycle(1);
    }
    setIsActive(true);
  };

  const handleStop = (): void => {
    setIsActive(false);
  };

  const handleReset = (): void => {
    setIsActive(false);
    setState(TimerState.IDLE);
    setTimeLeft(workDuration * 60);
    setCurrentCycle(1);
  };

  const getProgressPercentage = (): number => {
    const totalDuration = state === TimerState.WORK ? workDuration * 60 : restDuration * 60;
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  };

  const progressColor = state === TimerState.WORK ? 'hsl(230 74% 62%)' : 'hsl(199 89% 48%)';

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div
        className="flex h-64 w-64 items-center justify-center rounded-full border border-border shadow-sm"
        style={{
          background: `conic-gradient(${progressColor} ${getProgressPercentage()}%, hsl(214 32% 91%) ${getProgressPercentage()}%)`
        }}
      >
        <div className="flex h-[85%] w-[85%] flex-col items-center justify-center rounded-full bg-background">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {state === TimerState.WORK ? translate('work') :
             state === TimerState.REST ? translate('rest') :
             state === TimerState.COMPLETED ? translate('completed') : ''}
          </div>
          <div className="text-4xl font-semibold text-foreground">{formatTime(timeLeft)}</div>
          <div className="text-sm text-muted-foreground">
            {translate('cycle')}: {currentCycle}/{cycles}
          </div>
        </div>
      </div>
      
      <div className="flex flex-row gap-4">
        {!isActive ? (
          <Button 
            variant="buttonStart"
            size="lg"
            onClick={handleStart}
            disabled={state === TimerState.COMPLETED && currentCycle > cycles}
            leftIcon="▶"
          >
            {translate('start')}
          </Button>
        ) : (
          <Button 
            variant="timerStop"
            size="lg"
            onClick={handleStop}
          >
            {translate('stop')}
          </Button>
        )}
        <Button 
          variant="timer"
          size="lg"
          onClick={handleReset}
        >
          {translate('reset')}
        </Button>
      </div>
    </div>
  );
};

export default PomodoroCycle; 