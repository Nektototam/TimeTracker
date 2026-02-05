"use client";

import React from 'react';
import { TimeEntry } from '../lib/reportService';
import { parseDate, toDateKey, formatTimeOfDay as formatTime24, formatDisplayDate, differenceInMilliseconds } from '../lib/dateUtils';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

interface TimeBlock {
  id: string;
  startTime: Date;
  endTime: Date;
  projectId: string;
  projectName: string;
  projectColor: string;
  workTypeName?: string;
  workTypeColor?: string;
  duration: number;
}

interface DayData {
  date: Date;
  blocks: TimeBlock[];
  totalDuration: number;
}

interface DailyTimelineViewProps {
  entries: TimeEntry[];
  formatTime: (ms: number) => string;
}

const DailyTimelineView: React.FC<DailyTimelineViewProps> = ({
  entries,
  formatTime
}) => {
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();

  // Группируем записи по дням с предварительной фильтрацией
  const groupEntriesByDay = (): DayData[] => {
    // Расширенная фильтрация для коротких интервалов с гибким подходом
    const validEntries = entries.filter(entry => {
      // Проверка продолжительности из базы данных
      if (!entry || entry.durationMs < 60) {
        return false;
      }

      // Проверка наличия временных меток
      if (!entry.startTime || !entry.endTime) {
        return false;
      }

      // Проверка реальной разницы между метками времени (минимум 60 секунд)
      const startTime = parseDate(entry.startTime);
      const endTime = parseDate(entry.endTime);
      const diffInSeconds = differenceInMilliseconds(endTime, startTime) / 1000;

      return diffInSeconds >= 60;
    });

    if (validEntries.length === 0) {
      return [];
    }

    // Группируем по дням
    const dayGroups: { [key: string]: TimeEntry[] } = {};

    validEntries.forEach(entry => {
      const dateKey = toDateKey(entry.startTime);
      if (!dayGroups[dateKey]) {
        dayGroups[dateKey] = [];
      }
      dayGroups[dateKey].push(entry);
    });

    // Преобразуем группы в дни и считаем общую продолжительность
    const days: DayData[] = [];

    Object.entries(dayGroups).forEach(([dateKey, dayEntries]) => {
      // Считаем общую продолжительность дня
      const totalDuration = dayEntries.reduce((sum, entry) => sum + entry.durationMs, 0);

      // Пропускаем дни с продолжительностью меньше минуты
      if (totalDuration < 60) {
        return;
      }

      // Создаем блоки активности
      const blocks: TimeBlock[] = dayEntries.map(entry => ({
        id: entry.id,
        startTime: parseDate(entry.startTime),
        endTime: parseDate(entry.endTime),
        duration: entry.durationMs,
        projectId: entry.projectId,
        projectName: entry.project?.name || t('reports.noProject', 'No project'),
        projectColor: entry.project?.color || '#6366f1',
        workTypeName: entry.workType?.name,
        workTypeColor: entry.workType?.color
      }));

      // Добавляем день в список
      days.push({
        date: parseDate(dateKey),
        blocks,
        totalDuration
      });
    });

    // Сортируем по дате (сначала новые)
    return days.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const days = groupEntriesByDay();

  // Форматирование времени для отображения (HH:MM)
  const formatTimeOfDay = (date: Date): string => {
    return formatTime24(date);
  };

  // Форматирование даты (день недели, число месяца)
  const formatDate = (date: Date): string => {
    return formatDisplayDate(date, currentLanguage);
  };

  const getProjectBackground = (color: string): string => {
    // Convert hex color to HSL with low opacity for background
    return `${color}1F`; // Adds 12% opacity to hex color
  };

  return (
    <div className="space-y-10">
      {days && days.length > 0 ? (
        days
          .filter(day => day.totalDuration >= 60)
          .map((day, dayIndex) => (
            <div key={day.date.toISOString()} className="space-y-6">
              {/* Простой стильный разделитель между днями */}
              {dayIndex > 0 && (
                <div className="mb-8 mt-4">
                  <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-border to-transparent"></div>
                </div>
              )}

              <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
                <div className="text-base font-semibold text-foreground">{formatDate(day.date)}</div>
                <div className="text-sm font-medium text-primary">{t('reports.totalTime')}: {formatTime(day.totalDuration)}</div>
              </div>

              {/* Список активностей по дню */}
              <div className="space-y-4">
                {(() => {
                  // Дополнительная фильтрация непосредственно перед отображением
                  const filteredBlocks = day.blocks.filter(block => {
                    // Проверка продолжительности
                    if (block.duration < 60) {
                      return false;
                    }

                    // Строгая проверка на равенство времени начала и конца
                    if (block.startTime.getTime() >= block.endTime.getTime()) {
                      return false;
                    }

                    return true;
                  });

                  // Если после фильтрации не осталось блоков, возвращаем null
                  if (filteredBlocks.length === 0) {
                    return null;
                  }

                  // Отображаем отфильтрованные блоки
                  return filteredBlocks
                    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
                    .map((block, index) => (
                      <div
                        key={block.id}
                        className="flex items-start justify-between rounded-xl border border-border p-4 shadow-sm"
                        style={{
                          marginBottom: index !== filteredBlocks.length - 1 ? '16px' : '0',
                          backgroundColor: getProjectBackground(block.projectColor)
                        }}
                      >
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-muted-foreground">
                            {formatTimeOfDay(block.startTime)} - {formatTimeOfDay(block.endTime)}
                          </div>
                          <div className="font-semibold text-foreground">
                            {block.projectName}
                            {block.workTypeName && (
                              <span className="ml-2 text-sm font-normal text-muted-foreground">
                                / {block.workTypeName}
                              </span>
                            )}
                          </div>
                        </div>
                        <div
                          className="self-center font-semibold"
                          style={{ color: block.projectColor }}
                        >
                          {formatTime(block.duration)}
                        </div>
                      </div>
                    ));
                })()}
              </div>
            </div>
          ))
      ) : (
        <div className="py-6 text-center text-sm text-muted-foreground">
          {t('reports.noData')}
        </div>
      )}
    </div>
  );
};

export default DailyTimelineView;
