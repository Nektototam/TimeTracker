"use client";

import { usePomodoro } from '../../contexts/PomodoroContext';
import { useTranslation } from 'react-i18next';
import { Widget } from '../ui/Widget';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface PomodoroWidgetProps {
  className?: string;
}

export function PomodoroWidget({ className }: PomodoroWidgetProps) {
  const { t } = useTranslation();
  const {
    mode,
    isRunning,
    timeLeft,
    cycles,
    formatTime,
    startTimer,
    pauseTimer,
    resetTimer
  } = usePomodoro();

  const isWorkMode = mode === 'work';
  const modeColor = isWorkMode ? 'text-primary' : 'text-success';
  const modeBg = isWorkMode ? 'bg-primary/10' : 'bg-success/10';

  return (
    <Widget title="Pomodoro" className={className}>
      <div className="flex flex-col h-full justify-between">
        {/* Mode indicator */}
        <div className={cn("rounded-lg p-2 text-center text-xs font-medium", modeBg, modeColor)}>
          {isWorkMode ? t('pomodoro.work') : t('pomodoro.rest')}
        </div>

        {/* Timer */}
        <div className="text-center py-2">
          <div className={cn(
            "text-3xl font-bold font-mono",
            isRunning ? modeColor : "text-gray-700"
          )}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Cycles */}
        <div className="text-center text-xs text-gray-500">
          {t('pomodoro.cycle')}: {cycles}
        </div>

        {/* Controls */}
        <div className="flex gap-2 mt-2">
          {isRunning ? (
            <Button
              onClick={pauseTimer}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {t('timer.pause')}
            </Button>
          ) : (
            <Button
              onClick={startTimer}
              variant={isWorkMode ? 'primary' : 'success'}
              size="sm"
              className="flex-1"
            >
              {t('timer.start')}
            </Button>
          )}
          <Button
            onClick={resetTimer}
            variant="ghost"
            size="sm"
          >
            {t('pomodoro.reset')}
          </Button>
        </div>
      </div>
    </Widget>
  );
}
