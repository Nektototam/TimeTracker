"use client";

import { useTimer } from '../../contexts/TimerContext';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardFooter } from '../ui/Card';
import TimerCircle from '../TimerCircle';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface TimerWidgetProps {
  className?: string;
  compact?: boolean;
}

export function TimerWidget({ className, compact = false }: TimerWidgetProps) {
  const { t } = useTranslation();
  const {
    isRunning,
    isPaused,
    startTime,
    elapsedTime,
    timerValue,
    projectName,
    projectId,
    toggleTimer,
    finishTask
  } = useTimer();

  const getStatus = () => {
    if (isRunning) return t('timer.running');
    if (isPaused) return t('timer.paused');
    return t('timer.ready');
  };

  const getButtonText = () => {
    if (isRunning) return t('timer.pause');
    if (isPaused) return t('timer.resume');
    return t('timer.start');
  };

  return (
    <Card className={cn("flex h-full flex-col", className)}>
      <CardContent className="flex-1 p-4">
        <div className="flex h-full flex-col items-center justify-center">
        {/* Compact timer for smaller widget */}
        {compact ? (
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase">{getStatus()}</div>
            <div className={cn(
              "text-4xl font-bold font-mono",
              isRunning ? "text-primary" : "text-gray-700"
            )}>
              {timerValue}
            </div>
            <div className="text-sm text-gray-600 mt-1">{projectName || t('timer.notSelected')}</div>
          </div>
        ) : (
          <TimerCircle
            isRunning={isRunning}
            startTime={startTime}
            elapsedTime={elapsedTime}
            status={getStatus()}
            timeValue={timerValue}
            project={projectName}
          />
        )}
        </div>
      </CardContent>

      {/* Control buttons */}
      <CardFooter className="border-t border-border">
        <div className="flex w-full justify-center gap-3">
          <Button
            onClick={toggleTimer}
            variant={isPaused ? 'success' : 'timer'}
            size="lg"
            className="flex-1 max-w-[140px]"
          >
            {getButtonText()}
            <span className="ml-2 text-xs opacity-70">[Space]</span>
          </Button>

          {(isRunning || isPaused) && (
            <Button
              onClick={finishTask}
              variant="timerStop"
              size="lg"
              className="flex-1 max-w-[140px]"
            >
              {t('timer.stop')}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
