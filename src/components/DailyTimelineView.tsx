"use client";

import React, { useEffect, useState } from 'react';
import { TimeEntry } from '../lib/reportService';
import { api } from '../lib/api';

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
        const { items } = await api.projectTypes.list();
        items
          .filter(item => customTypes.includes(item.id))
          .forEach(item => {
            names[item.id] = item.name;
          });
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
  
  // Группируем записи по дням с предварительной фильтрацией
  const groupEntriesByDay = (): DayData[] => {
    console.log("Начинаем группировку записей для визуализации, всего:", entries.length);
    
    // Расширенная фильтрация для коротких интервалов с гибким подходом
    const validEntries = entries.filter(entry => {
      // Проверка продолжительности из базы данных
      if (!entry || entry.duration < 60) {
        return false;
      }
      
      // Проверка наличия временных меток
      if (!entry.start_time || !entry.end_time) {
        return false;
      }
      
      // Проверка реальной разницы между метками времени (минимум 60 секунд)
      const startTime = new Date(entry.start_time).getTime();
      const endTime = new Date(entry.end_time).getTime();
      const diffInSeconds = (endTime - startTime) / 1000;
      
      return diffInSeconds >= 60;
    });
    
    console.log(`После фильтрации для таймлайна: ${validEntries.length} из ${entries.length} записей`);
    
    if (validEntries.length === 0) {
      return [];
    }
    
    // Группируем по дням
    const dayGroups: { [key: string]: TimeEntry[] } = {};
    
    validEntries.forEach(entry => {
      const dateKey = new Date(entry.start_time).toISOString().split('T')[0];
      if (!dayGroups[dateKey]) {
        dayGroups[dateKey] = [];
      }
      dayGroups[dateKey].push(entry);
    });
    
    // Преобразуем группы в дни и считаем общую продолжительность
    const days: DayData[] = [];
    
    Object.entries(dayGroups).forEach(([dateKey, dayEntries]) => {
      // Считаем общую продолжительность дня
      const totalDuration = dayEntries.reduce((sum, entry) => sum + entry.duration, 0);
      
      // Пропускаем дни с продолжительностью меньше минуты
      if (totalDuration < 60) {
        console.log(`Пропускаем день ${dateKey}: недостаточная активность (${totalDuration}с)`);
        return;
      }
      
      // Создаем блоки активности
      const blocks: TimeBlock[] = dayEntries.map(entry => ({
        id: entry.id,
        startTime: new Date(entry.start_time),
        endTime: new Date(entry.end_time),
        duration: entry.duration,
        projectType: entry.project_type,
        projectName: getProjectName(entry.project_type)
      }));
      
      // Добавляем день в список
      days.push({
        date: new Date(dateKey),
        blocks,
        totalDuration
      });
    });
    
    console.log(`Отфильтровано дней: ${days.length}`);
    
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
      case 'development': return 'hsl(230 74% 62%)';
      case 'design': return 'hsl(142 71% 45%)';
      case 'marketing': return 'hsl(38 92% 50%)';
      case 'meeting': return 'hsl(0 84% 60%)';
      case 'other': return 'hsl(199 89% 48%)';
      default: {
        // Для пользовательских типов генерируем цвет на основе хеша
        const hash = hashCode(projectType);
        const hue = Math.abs(hash % 360);
        return `hsl(${hue} 70% 60%)`;
      }
    }
  };

  const getProjectBackground = (projectType: string): string => {
    const color = getProjectColor(projectType);
    return color.replace(')', ' / 0.12)');
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
              
              {/* Список активностей по дню в неоморфном стиле без часовых меток */}
              <div className="space-y-4">
                {(() => {
                  // Дополнительная фильтрация непосредственно перед отображением
                  const filteredBlocks = day.blocks.filter(block => {
                    // Проверка продолжительности
                    if (block.duration < 60) {
                      console.log(`Блок отфильтрован (недостаточная длительность): ${block.duration}с`);
                      return false;
                    }
                    
                    // Строгая проверка на равенство времени начала и конца
                    if (block.startTime.getTime() >= block.endTime.getTime()) {
                      console.log(`Блок отфильтрован (некорректный интервал): ${formatTimeOfDay(block.startTime)} - ${formatTimeOfDay(block.endTime)}`);
                      return false;
                    }
                    
                    return true;
                  });
                  
                  console.log(`Отображено блоков: ${filteredBlocks.length} из ${day.blocks.length}`);
                  
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
                          backgroundColor: getProjectBackground(block.projectType)
                        }}
                      >
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-muted-foreground">
                            {formatTimeOfDay(block.startTime)} - {formatTimeOfDay(block.endTime)}
                          </div>
                          <div className="font-semibold text-foreground">
                            {block.projectName}
                          </div>
                        </div>
                        <div
                          className="self-center font-semibold"
                          style={{ color: getProjectColor(block.projectType) }}
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