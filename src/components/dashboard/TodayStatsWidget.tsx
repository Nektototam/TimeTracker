"use client";

import { useTimer } from '../../contexts/TimerContext';
import { useTranslation } from 'react-i18next';
import { Widget, WidgetStat } from '../ui/Widget';
import { cn } from '../../lib/utils';

interface TodayStatsWidgetProps {
  className?: string;
}

export function TodayStatsWidget({ className }: TodayStatsWidgetProps) {
  const { t } = useTranslation();
  const { dailyTotal, elapsedTime, isRunning, formatTime, timeLimit } = useTimer();

  // Current session time
  const currentSession = isRunning ? elapsedTime : 0;

  // Total today including current session
  const totalToday = dailyTotal + currentSession;

  // Format time for display
  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Progress percentage if time limit is set
  const progressPercent = timeLimit ? Math.min((totalToday / timeLimit) * 100, 100) : null;

  return (
    <Widget title={t('statistics.today')} className={className}>
      <div className="flex flex-col h-full justify-between gap-4">
        {/* Main stat - Today total */}
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900">
            {formatDuration(totalToday)}
          </div>
          <div className="text-sm text-gray-500">{t('statistics.totalTime')}</div>
        </div>

        {/* Current session */}
        {isRunning && (
          <div className="bg-primary-light/10 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-primary">
              +{formatDuration(currentSession)}
            </div>
            <div className="text-xs text-primary/70">{t('timer.currentSession')}</div>
          </div>
        )}

        {/* Progress bar if time limit exists */}
        {progressPercent !== null && (
          <div className="mt-auto">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{t('timer.progress')}</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  progressPercent >= 100 ? "bg-error" :
                  progressPercent >= 80 ? "bg-warning" : "bg-primary"
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Daily breakdown */}
        <div className="grid grid-cols-2 gap-2 text-center text-sm">
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="font-semibold text-gray-700">{formatDuration(dailyTotal)}</div>
            <div className="text-xs text-gray-500">{t('statistics.saved')}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="font-semibold text-gray-700">{formatDuration(currentSession)}</div>
            <div className="text-xs text-gray-500">{t('timer.current')}</div>
          </div>
        </div>
      </div>
    </Widget>
  );
}
