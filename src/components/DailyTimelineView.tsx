"use client";

import React, { useEffect, useState } from 'react';
import { TimeEntry } from '../lib/reportService';
import { supabase } from '../lib/supabase';
import { Card, TaskCategory } from './ui/Card';

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
  formatTime: (ms: number) => string;
}

const DailyTimelineView: React.FC<DailyTimelineViewProps> = ({ 
  entries, 
  formatTime
}) => {
  const [projectNames, setProjectNames] = useState<{[key: string]: string}>({});
  
  // Загружаем названия проектов
  useEffect(() => {
    const loadProjectNames = async () => {
      const projectTypes = [...new Set(entries.map(entry => entry.project_type))];
      const names: {[key: string]: string} = {};
      
      // Добавляем стандартные типы
      const standardTypes: {[key: string]: string} = {
        'development': 'Веб-разработка',
        'design': 'Дизайн',
        'marketing': 'Маркетинг',
        'meeting': 'Совещание',
        'other': 'Другое'
      };
      
      // Сначала устанавливаем стандартные типы
      projectTypes.forEach(type => {
        if (standardTypes[type]) {
          names[type] = standardTypes[type];
        }
      });
      
      // Затем загружаем пользовательские типы
      const customTypes = projectTypes.filter(type => !standardTypes[type]);
      
      if (customTypes.length > 0) {
        const { data } = await supabase
          .from('custom_project_types')
          .select('id, name')
          .in('id', customTypes);
          
        if (data) {
          data.forEach(item => {
            names[item.id] = item.name;
          });
        }
      }
      
      // Для типов без названий устанавливаем значение по умолчанию
      projectTypes.forEach(type => {
        if (!names[type]) {
          names[type] = 'Неизвестный тип';
        }
      });
      
      setProjectNames(names);
    };
    
    if (entries.length > 0) {
      loadProjectNames();
    }
  }, [entries]);
  
  // Получаем название проекта по его типу
  const getProjectName = (type: string): string => {
    return projectNames[type] || 'Загрузка...';
  };
  
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
  
  // Получаем цвет категории для проекта
  const getProjectCategoryColor = (projectType: string): 'purple' | 'blue' | 'green' | 'red' | 'orange' | 'pink' => {
    // Предопределенные цвета для стандартных типов
    switch (projectType) {
      case 'development': return 'blue'; // Разработка - синий
      case 'design': return 'purple'; // Дизайн - фиолетовый
      case 'marketing': return 'orange'; // Маркетинг - оранжевый
      case 'meeting': return 'red'; // Встречи - красный
      default: {
        // Для пользовательских типов выбираем по хешу
        const colors: Array<'purple' | 'blue' | 'green' | 'red' | 'orange' | 'pink'> = 
          ['purple', 'blue', 'green', 'red', 'orange', 'pink'];
        
        // Простая хеш-функция для стабильного выбора цвета
        let hash = 0;
        for (let i = 0; i < projectType.length; i++) {
          hash = projectType.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        return colors[Math.abs(hash) % colors.length];
      }
    }
  };
  
  // Если записей нет, показываем сообщение
  if (days.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        Нет данных за выбранный период
      </div>
    );
  }
  
  return (
    <div className="space-y-6 pb-20">
      {days.map(day => (
        <Card key={day.date.toISOString()} className="overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <h3 className="font-medium">{formatDate(day.date)}</h3>
            <div className="text-primary font-semibold">{formatTime(day.totalDuration)}</div>
          </div>
          
          {/* Визуальная шкала времени */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              {/* Временные метки (с 8 утра до 20 вечера) */}
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                {Array.from({ length: 13 }).map((_, index) => (
                  <div key={index}>{(index + 8).toString().padStart(2, '0')}</div>
                ))}
              </div>
              
              {/* Линия времени */}
              <div className="h-1 bg-gray-100 mb-3 rounded-full"></div>
              
              {/* Блоки активности */}
              <div className="relative h-16">
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
                  
                  const categoryColor = getProjectCategoryColor(block.projectType);
                  
                  return (
                    <div
                      key={block.id}
                      className="absolute rounded-xl p-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      style={{
                        left: `${leftPos}%`,
                        width: `${Math.max(widthPercent, 10)}%`,
                        backgroundColor: `var(--color-${categoryColor}-50)`,
                        borderLeft: `3px solid var(--color-${categoryColor})`,
                        height: '40px',
                        overflow: 'hidden'
                      }}
                      title={`${block.projectName}: ${formatTimeOfDay(block.startTime)} - ${formatTimeOfDay(block.endTime)}`}
                    >
                      <div className="text-xs font-medium truncate text-gray-700">
                        {block.projectName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTimeOfDay(block.startTime)} - {formatTimeOfDay(block.endTime)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Список записей */}
          <div className="divide-y divide-gray-100">
            {day.blocks.map(block => (
              <div key={block.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-10 text-center">
                    <div className="text-xs text-gray-500">{formatTimeOfDay(block.startTime)}</div>
                    <div className="text-xs text-gray-500">{formatTimeOfDay(block.endTime)}</div>
                  </div>
                  
                  <div>
                    <TaskCategory color={getProjectCategoryColor(block.projectType)}>
                      {block.projectName}
                    </TaskCategory>
                  </div>
                </div>
                
                <div className="font-medium text-gray-700">
                  {formatTime(block.duration)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DailyTimelineView; 