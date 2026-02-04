import React, { useEffect, useMemo, useState } from 'react';
import { useTimer } from '../contexts/TimerContext';
import { useTranslation } from 'react-i18next';

interface TimerCircleProps {
  isRunning: boolean;
  startTime: number;
  elapsedTime: number;
  status: string;
  timeValue: string;
  project: string;
  workTypeName?: string;
}

export default function TimerCircle({
  isRunning,
  startTime,
  elapsedTime,
  status,
  timeValue,
  project,
  workTypeName,
}: TimerCircleProps) {
  const { timeLimit, formatTime } = useTimer();
  const { t } = useTranslation();
  const [pulseEffect, setPulseEffect] = useState(false);
  
  // Добавляем эффект пульсации при запуске таймера
  useEffect(() => {
    if (isRunning) {
      setPulseEffect(true);
      const timer = setTimeout(() => setPulseEffect(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isRunning]);
  
  const progress = useMemo(() => {
    const maxTime = timeLimit || 3600000;
    return timeLimit ? Math.min(elapsedTime / maxTime, 1) : (elapsedTime % 3600000) / 3600000;
  }, [elapsedTime, timeLimit]);

  const progressDeg = Math.round(progress * 360);

  // Форматируем отображение времени ограничения
  const getTimeLimitDisplay = () => {
    if (!timeLimit) return null;
    
    const remainingTime = Math.max(0, timeLimit - elapsedTime);
    const isAlmostFinished = remainingTime < timeLimit * 0.1; // Меньше 10% времени осталось
    
    return (
      <div
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
          isAlmostFinished ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
        }`}
      >
        {t('timer.limitValue')} {formatTime(remainingTime)}
      </div>
    );
  };

  return (
    <div className="my-6 flex flex-col items-center">
      <div
        className={`relative flex h-[280px] w-[280px] items-center justify-center rounded-full transition-transform ${
          pulseEffect ? 'animate-pulse' : ''
        } ${isRunning ? 'scale-[1.02]' : ''}`}
        style={{
          background: `conic-gradient(hsl(var(--primary)) ${progressDeg}deg, hsl(var(--muted)) ${progressDeg}deg)`
        }}
      >
        <div className="flex h-[235px] w-[235px] flex-col items-center justify-center rounded-full bg-card shadow-app-sm ring-1 ring-border">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {status}
          </div>
          <div className={`text-4xl font-bold ${isRunning ? 'text-primary' : 'text-foreground'}`}>
            {timeValue}
          </div>
          <div className="mt-1 text-sm font-medium text-muted-foreground" data-testid="project-name">
            {project || t('timer.notSelected')}
          </div>
          {workTypeName && (
             <div className="mt-0.5 text-xs text-muted-foreground/80">
              {workTypeName}
            </div>
          )}
          <div className="mt-3">{getTimeLimitDisplay()}</div>
        </div>
      </div>
    </div>
  );
} 