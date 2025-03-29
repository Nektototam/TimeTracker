"use client";

import React from 'react';
import { TimeEntry } from '../lib/reportService';

interface TimeBlock {
  id: string;
  startTime: Date;
  endTime: Date;
  projectType: string;
  projectName: string;
  duration: number;
}

interface DayData {
  date: Date;
  blocks: TimeBlock[];
  totalDuration: number;
}

interface DailyTimelineViewProps {
  entries: TimeEntry[];
  getProjectName: (type: string) => string;
  formatTime: (ms: number) => string;
}

const DailyTimelineView: React.FC<DailyTimelineViewProps> = ({ 
  entries, 
  getProjectName,
  formatTime
}) => {
  // Группируем записи по дням
  const groupEntriesByDay = (): DayData[] => {
    // Создаем мапу для группировки записей
    const daysMap = new Map<string, DayData>();
    
    // Сортируем записи по времени начала
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
    
    // Группируем записи по дням
    sortedEntries.forEach(entry => {
      const startTime = new Date(entry.start_time);
      const dateKey = startTime.toISOString().split('T')[0];
      
      if (!daysMap.has(dateKey)) {
        daysMap.set(dateKey, {
          date: startTime,
          blocks: [],
          totalDuration: 0
        });
      }
      
      const day = daysMap.get(dateKey)!;
      
      day.blocks.push({
        id: entry.id,
        startTime: new Date(entry.start_time),
        endTime: new Date(entry.end_time),
        projectType: entry.project_type,
        projectName: getProjectName(entry.project_type),
        duration: entry.duration
      });
      
      day.totalDuration += entry.duration;
    });
    
    // Преобразуем мапу в массив и сортируем по датам
    return Array.from(daysMap.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
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
  
  // Получаем цвет для проекта
  const getProjectColor = (projectType: string): string => {
    // Простая хеш-функция для получения стабильного цвета по типу проекта
    const hashCode = (str: string): number => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return hash;
    };
    
    // Предопределенные цвета для стандартных типов
    switch (projectType) {
      case 'development': return 'var(--primary-color)';
      case 'design': return 'var(--success-color)';
      case 'marketing': return 'var(--warning-color)';
      case 'meeting': return 'var(--danger-color)';
      case 'other': return 'var(--info-color)';
      default: {
        // Для пользовательских типов генерируем цвет на основе хеша
        const hash = hashCode(projectType);
        const hue = Math.abs(hash % 360);
        return `hsl(${hue}, 70%, 60%)`;
      }
    }
  };
  
  // Если записей нет, показываем сообщение
  if (days.length === 0) {
    return (
      <div className="daily-timeline-empty">
        Нет данных за выбранный период
      </div>
    );
  }
  
  return (
    <div className="daily-timeline-view">
      {days.map(day => (
        <div key={day.date.toISOString()} className="day-container">
          <div className="day-header">
            <div className="day-date">{formatDate(day.date)}</div>
            <div className="day-total">Всего: {formatTime(day.totalDuration)}</div>
          </div>
          
          <div className="timeline-container">
            {/* Временная шкала часов (с 8 утра до 20 вечера) */}
            <div className="timeline-hours">
              {Array.from({ length: 13 }).map((_, index) => (
                <div key={index} className="hour-marker">
                  <div className="hour-label">{(index + 8).toString().padStart(2, '0')}:00</div>
                </div>
              ))}
            </div>
            
            {/* Блоки активности */}
            <div className="timeline-blocks">
              {day.blocks.map(block => {
                // Рассчитываем позицию и ширину блока
                const dayStart = new Date(day.date);
                dayStart.setHours(8, 0, 0, 0); // начало в 8:00
                
                const dayEnd = new Date(day.date);
                dayEnd.setHours(20, 0, 0, 0); // конец в 20:00
                
                const dayDuration = dayEnd.getTime() - dayStart.getTime(); // 12 часов в миллисекундах
                
                // Обрезаем время начала и окончания до границ дня для визуализации
                const visibleStartTime = Math.max(block.startTime.getTime(), dayStart.getTime());
                const visibleEndTime = Math.min(block.endTime.getTime(), dayEnd.getTime());
                
                // Если блок не попадает в видимый диапазон, пропускаем его
                if (visibleEndTime <= visibleStartTime) return null;
                
                // Рассчитываем левую позицию и ширину в процентах
                const leftPos = ((visibleStartTime - dayStart.getTime()) / dayDuration) * 100;
                const widthPercent = ((visibleEndTime - visibleStartTime) / dayDuration) * 100;
                
                return (
                  <div
                    key={block.id}
                    className="timeline-block"
                    style={{
                      left: `${leftPos}%`,
                      width: `${widthPercent}%`,
                      backgroundColor: getProjectColor(block.projectType)
                    }}
                    title={`${block.projectName}: ${formatTimeOfDay(block.startTime)} - ${formatTimeOfDay(block.endTime)}`}
                  >
                    <div className="block-content">
                      <div className="block-time">
                        {formatTimeOfDay(block.startTime)} - {formatTimeOfDay(block.endTime)}
                      </div>
                      <div className="block-project">{block.projectName}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Список записей по дню */}
          <div className="day-entries">
            {day.blocks.map(block => (
              <div key={block.id} className="day-entry">
                <div className="entry-time">
                  {formatTimeOfDay(block.startTime)} - {formatTimeOfDay(block.endTime)}
                </div>
                <div 
                  className="entry-type" 
                  style={{
                    backgroundColor: getProjectColor(block.projectType),
                    padding: '2px 8px',
                    borderRadius: '4px',
                    color: '#fff'
                  }}
                >
                  {block.projectName}
                </div>
                <div className="entry-duration">{formatTime(block.duration)}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DailyTimelineView; 