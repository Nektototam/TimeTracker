"use client";

import React, { useEffect, useState } from 'react';
import AppShell from '../../components/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import ActivityChart from '../../components/ActivityChart';
import { reportService, ReportData, ProjectSummary } from '../../lib/reportService';
import { useAuth } from '../../contexts/AuthContext';
import { ErrorBoundary } from '../../components/ErrorBoundary';

interface RecentEntry {
  id: string;
  date: Date;
  projectName: string;
  projectColor: string;
  duration: number;
}

function StatisticsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [weekData, setWeekData] = useState<ReportData | null>(null);
  const [monthData, setMonthData] = useState<ReportData | null>(null);
  const [allTimeData, setAllTimeData] = useState<ReportData | null>(null);
  const [recentEntries, setRecentEntries] = useState<RecentEntry[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const weekReport = await reportService.getWeeklyReport(user.id);
        setWeekData(weekReport);

        const monthReport = await reportService.getMonthlyReport(user.id);
        setMonthData(monthReport);

        const startAllTime = new Date(2000, 0, 1);
        const endAllTime = new Date(2100, 0, 1);
        const allTimeReport = await reportService.getCustomReport(
          user.id,
          startAllTime.toISOString(),
          endAllTime.toISOString()
        );
        setAllTimeData(allTimeReport);

        setRecentEntries(weekReport.entries.slice(0, 5).map(entry => ({
          id: entry.id,
          date: new Date(entry.startTime),
          projectName: entry.project?.name || 'Без проекта',
          projectColor: entry.project?.color || '#6366f1',
          duration: entry.durationMs
        })));
      } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return `Сегодня, ${date.getHours().toString().padStart(2, '0')}:${date
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
    }

    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return `Вчера, ${date.getHours().toString().padStart(2, '0')}:${date
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
    }

    return (
      date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short'
      }) +
      `, ${date.getHours().toString().padStart(2, '0')}:${date
        .getMinutes()
        .toString()
        .padStart(2, '0')}`
    );
  };

  const formatTime = (milliseconds: number): string => {
    if (!milliseconds) return '00:00';

    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    }

    return `${minutes}м`;
  };

  const formatActivityTime = (milliseconds: number): string => {
    if (!milliseconds) return '00:00';

    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
  };

  if (!isClient) {
    return (
      <AppShell title="Статистика">
        <div className="space-y-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-foreground">Статистика</h1>
          </div>
          <div className="flex h-40 items-center justify-center rounded-2xl border border-border bg-card text-sm text-muted-foreground">
            Загрузка статистики...
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Статистика">
      <ErrorBoundary sectionName="Statistics">
        <div className="space-y-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-foreground">Статистика</h1>
          </div>

          {isLoading ? (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-border bg-card text-sm text-muted-foreground">
            Загрузка статистики...
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
                <span className="block text-2xl font-semibold text-primary">
                  {weekData ? formatTime(weekData.totalDuration) : '00:00'}
                </span>
                <span className="text-sm text-muted-foreground">За неделю</span>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
                <span className="block text-2xl font-semibold text-primary">
                  {monthData ? formatTime(monthData.totalDuration) : '00:00'}
                </span>
                <span className="text-sm text-muted-foreground">За месяц</span>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
                <span className="block text-2xl font-semibold text-primary">
                  {allTimeData ? formatTime(allTimeData.totalDuration) : '00:00'}
                </span>
                <span className="text-sm text-muted-foreground">Всего</span>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 text-lg font-semibold text-foreground">Активность за неделю</div>
              <ActivityChart
                data={weekData?.entries ?
                  weekData.entries.reduce((acc, entry) => {
                    const date = new Date(entry.startTime).toISOString().split('T')[0];
                    const existingDay = acc.find(day => day.date === date);

                    if (existingDay) {
                      existingDay.totalDuration += entry.durationMs;
                    } else {
                      acc.push({ date, totalDuration: entry.durationMs });
                    }

                    return acc;
                  }, [] as {date: string, totalDuration: number}[])
                : []}
                height={180}
                barColor="hsl(230 74% 62%)"
              />
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-semibold text-foreground">Распределение времени</h2>
              <div className="space-y-4">
                {weekData && weekData.projectSummaries.map((project: ProjectSummary) => (
                  <div key={project.project.id}>
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm font-medium text-foreground">{project.project.name}</span>
                      <span className="text-sm font-medium text-primary">{formatTime(project.totalDuration)}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all duration-300 ease-in-out"
                        style={{
                          width: `${project.percentage}%`,
                          backgroundColor: project.project.color || '#6366f1'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-semibold text-foreground">Последняя активность</h2>
              {recentEntries.length > 0 ? (
                <div className="space-y-4">
                  {recentEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/40 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: entry.projectColor }}
                        />
                        <div>
                          <div className="text-sm font-medium text-foreground">{entry.projectName}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(entry.date)}</div>
                        </div>
                      </div>
                      <div className="self-center font-medium text-primary">
                        {formatActivityTime(entry.duration)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">Нет недавней активности</div>
              )}
            </div>
          </>
          )}
        </div>
      </ErrorBoundary>
    </AppShell>
  );
}

export default function Statistics() {
  return (
    <ProtectedRoute>
      <StatisticsPage />
    </ProtectedRoute>
  );
}