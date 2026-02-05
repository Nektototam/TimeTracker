"use client";

import React from 'react';
import { TimeEntry } from '../lib/reportService';

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
      const startTime = new Date(entry.startTime).getTime();
      const endTime = new Date(entry.endTime).getTime();
      const diffInSeconds = (endTime - startTime) / 1000;

      return diffInSeconds >= 60;
    });

    if (validEntries.length === 0) {
      return [];
    }

    // Группируем по дням
    const dayGroups: { [key: string]: TimeEntry[] } = {};

    validEntries.forEach(entry => {
      const dateKey = new Date(entry.startTime).toISOString().split('T')[0];
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
        startTime: new Date(entry.startTime),
        endTime: new Date(entry.endTime),
        duration: entry.durationMs,
        projectId: entry.projectId,
        projectName: entry.project?.name || 'Без проекта',
        projectColor: entry.project?.color || '#6366f1',
        workTypeName: entry.workType?.name,
        workTypeColor: entry.workType?.color
      }));

      // Добавляем день в список
      days.push({
        date: new Date(dateKey),
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
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // Форматирование даты (день недели, число месяца)
  const formatDate = (date: Date): string => {
    const weekdays = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

    return `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
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
                <div className="text-sm font-medium text-primary">Всего: {formatTime(day.totalDuration)}</div>
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
          Нет данных за выбранный период
        </div>
      )}
    </div>
  );
};

export default DailyTimelineView;
