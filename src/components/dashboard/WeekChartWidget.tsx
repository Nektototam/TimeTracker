"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Widget } from '../ui/Widget';
import ActivityChart from '../ActivityChart';
import reportService, { DailySummary } from '../../lib/reportService';

interface WeekChartWidgetProps {
  className?: string;
}

export function WeekChartWidget({ className }: WeekChartWidgetProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [weekData, setWeekData] = useState<DailySummary[]>([]);
  const [totalWeek, setTotalWeek] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWeekData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const report = await reportService.getWeeklyReport(user.id);

        // Group entries by date to create daily summaries
        const dailyMap = new Map<string, number>();
        report.entries.forEach(entry => {
          const date = new Date(entry.start_time).toISOString().split('T')[0];
          const current = dailyMap.get(date) || 0;
          dailyMap.set(date, current + entry.duration);
        });

        // Convert to array and sort by date
        const dailySummaries: DailySummary[] = Array.from(dailyMap.entries())
          .map(([date, total_duration]) => ({ date, total_duration }))
          .sort((a, b) => a.date.localeCompare(b.date));

        setWeekData(dailySummaries);
        setTotalWeek(report.totalDuration);
      } catch (error) {
        console.error('Error loading week data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWeekData();
  }, [user]);

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Widget
      title={t('statistics.weekActivity')}
      className={className}
      headerAction={
        <span className="text-sm font-semibold text-primary">
          {formatDuration(totalWeek)}
        </span>
      }
    >
      <div className="h-full flex items-center justify-center">
        {isLoading ? (
          <div className="text-gray-400 text-sm">{t('common.loading')}...</div>
        ) : weekData.length > 0 ? (
          <ActivityChart
            data={weekData}
            height={140}
            barColor="#5e72e4"
          />
        ) : (
          <div className="text-gray-400 text-sm text-center">
            {t('statistics.noData')}
          </div>
        )}
      </div>
    </Widget>
  );
}
