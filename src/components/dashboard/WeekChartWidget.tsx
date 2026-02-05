"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
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
          const date = new Date(entry.startTime).toISOString().split('T')[0];
          const current = dailyMap.get(date) || 0;
          dailyMap.set(date, current + entry.durationMs);
        });

        // Convert to array and sort by date
        const dailySummaries: DailySummary[] = Array.from(dailyMap.entries())
          .map(([date, totalDuration]) => ({ date, totalDuration }))
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
    <Card className={className}>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>{t('statistics.weekActivity')}</CardTitle>
        <span className="text-sm font-semibold text-primary">
          {formatDuration(totalWeek)}
        </span>
      </CardHeader>
      <CardContent className="flex h-full items-center justify-center">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">{t('common.loading')}...</div>
        ) : weekData.length > 0 ? (
          <ActivityChart
            data={weekData}
            height={140}
            barColor="#5e72e4"
          />
        ) : (
          <div className="text-sm text-muted-foreground text-center">
            {t('statistics.noData')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
