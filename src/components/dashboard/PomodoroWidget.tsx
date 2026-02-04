"use client";

import { usePomodoro } from '../../contexts/PomodoroContext';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
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
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader>
        <CardTitle>Pomodoro</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between">
        {/* Mode indicator */}
        <div className={cn("rounded-lg p-2 text-center text-xs font-medium", modeBg, modeColor)}>
          {isWorkMode ? t('pomodoro.work') : t('pomodoro.rest')}
        </div>

        {/* Timer */}
        <div className="py-2 text-center">
          <div className={cn(
            "text-3xl font-bold font-mono",
            isRunning ? modeColor : "text-gray-700"
          )}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Cycles */}
        <div className="text-center text-xs text-muted-foreground">
          {t('pomodoro.cycle')}: {cycles}
        </div>

        {/* Controls */}
        <div className="mt-2 flex gap-2">
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
      </CardContent>
    </Card>
  );
}
