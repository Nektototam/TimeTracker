"use client";

import React, { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';
import ProtectedRoute from '../../components/ProtectedRoute';
import ActivityChart from '../../components/ActivityChart';
import { reportService, ReportData, ProjectSummary } from '../../lib/reportService';
import { useAuth } from '../../contexts/AuthContext';

function StatisticsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [weekData, setWeekData] = useState<ReportData | null>(null);
  const [monthData, setMonthData] = useState<ReportData | null>(null);
  const [allTimeData, setAllTimeData] = useState<ReportData | null>(null);
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Устанавливаем флаг клиентского рендеринга
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Загружаем данные за неделю
        const weekReport = await reportService.getWeeklyReport(user.id);
        setWeekData(weekReport);
        
        // Загружаем данные за месяц
        const monthReport = await reportService.getMonthlyReport(user.id);
        setMonthData(monthReport);
        
        // Загружаем данные за все время
        // Используем большой диапазон для "всего времени"
        const startAllTime = new Date(2000, 0, 1);
        const endAllTime = new Date(2100, 0, 1);
        const allTimeReport = await reportService.getCustomReport(
          user.id,
          startAllTime.toISOString(),
          endAllTime.toISOString()
        );
        setAllTimeData(allTimeReport);
        
        // Устанавливаем недавние записи
        setRecentEntries(weekReport.entries.slice(0, 5).map(entry => ({
          id: entry.id,
          date: new Date(entry.start_time),
          projectType: entry.project_type,
          duration: entry.duration
        })));
      } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  // Форматирование даты
  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Проверяем, сегодня ли эта дата
    if (date.getDate() === today.getDate() && 
        date.getMonth() === today.getMonth() && 
        date.getFullYear() === today.getFullYear()) {
      return `Сегодня, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // Проверяем, вчера ли эта дата
    if (date.getDate() === yesterday.getDate() && 
        date.getMonth() === yesterday.getMonth() && 
        date.getFullYear() === yesterday.getFullYear()) {
      return `Вчера, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // В других случаях возвращаем полную дату
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    }) + `, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // Форматирование времени
  const formatTime = (milliseconds: number): string => {
    if (!milliseconds) return '00:00';
    
    // Преобразование миллисекунд в секунды
    const seconds = Math.floor(milliseconds / 1000);
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    }
    
    return `${minutes}м`;
  };

  // Форматирование времени для раздела "Недавняя активность"
  const formatActivityTime = (milliseconds: number): string => {
    if (!milliseconds) return '00:00';
    
    // Преобразование миллисекунд в секунды
    const seconds = Math.floor(milliseconds / 1000);
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Получение названия проекта
  const getProjectName = (projectType: string): string => {
    // Стандартные типы
    switch (projectType) {
      case 'development': return 'Веб-разработка';
      case 'design': return 'Дизайн';
      case 'marketing': return 'Маркетинг';
      case 'meeting': return 'Совещание';
      case 'other': return 'Другое';
      default: return 'Пользовательский тип';
    }
  };

  // Если страница еще не гидратирована, показываем скелетон загрузки
  if (!isClient) {
    return (
      <div className="app-container">
        <div id="stats-screen" className="screen bg-[#f1f5f9] min-h-screen pb-20">
          <div className="stats-header mx-6 pt-10 pb-6">
            <h1 className="text-3xl font-bold text-primary-text-color">Статистика</h1>
          </div>
          <div className="loading-state flex justify-center items-center my-10 text-secondary-text-color">
            Загрузка статистики...
          </div>
          <NavBar />
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div id="stats-screen" className="screen bg-[#f1f5f9] min-h-screen pb-20">
        <div className="stats-header mx-6 pt-10 pb-6">
          <h1 className="text-3xl font-bold text-primary-text-color">Статистика</h1>
        </div>
        
        {isLoading ? (
          <div className="loading-state flex justify-center items-center my-10 text-secondary-text-color">
            Загрузка статистики...
          </div>
        ) : (
          <>
            <div className="stats-total slide-up mx-6 flex justify-between mb-8">
              <div className="stats-total-item bg-[#e9edf5] rounded-[16px] p-5 text-center flex-1 mx-2 first:ml-0 last:mr-0 shadow-[6px_6px_12px_0_rgba(0,0,0,0.15),-6px_-6px_12px_0_rgba(255,255,255,0.9)] border-t border-l border-[#ffffff50] border-b-[#00000015] border-r-[#00000015]">
                <span className="stats-total-value block text-2xl font-bold text-primary-color mb-1">
                  {weekData ? formatTime(weekData.totalDuration) : '00:00'}
                </span>
                <span className="stats-total-label text-sm text-secondary-text-color">За неделю</span>
              </div>
              <div className="stats-total-item bg-[#e9edf5] rounded-[16px] p-5 text-center flex-1 mx-2 shadow-[6px_6px_12px_0_rgba(0,0,0,0.15),-6px_-6px_12px_0_rgba(255,255,255,0.9)] border-t border-l border-[#ffffff50] border-b-[#00000015] border-r-[#00000015]">
                <span className="stats-total-value block text-2xl font-bold text-primary-color mb-1">
                  {monthData ? formatTime(monthData.totalDuration) : '00:00'}
                </span>
                <span className="stats-total-label text-sm text-secondary-text-color">За месяц</span>
              </div>
              <div className="stats-total-item bg-[#e9edf5] rounded-[16px] p-5 text-center flex-1 mx-2 first:ml-0 last:mr-0 shadow-[6px_6px_12px_0_rgba(0,0,0,0.15),-6px_-6px_12px_0_rgba(255,255,255,0.9)] border-t border-l border-[#ffffff50] border-b-[#00000015] border-r-[#00000015]">
                <span className="stats-total-value block text-2xl font-bold text-primary-color mb-1">
                  {allTimeData ? formatTime(allTimeData.totalDuration) : '00:00'}
                </span>
                <span className="stats-total-label text-sm text-secondary-text-color">Всего</span>
              </div>
            </div>
            
            <div className="chart-container slide-up mx-6 bg-white p-6 rounded-[12px] shadow-[6px_6px_16px_0_rgba(0,0,0,0.06),-6px_-6px_16px_0_rgba(255,255,255,0.8)] mb-8">
              <div className="chart-title text-lg font-semibold mb-4 text-primary-text-color">Активность за неделю</div>
              <ActivityChart 
                data={weekData?.entries ? 
                  weekData.entries.reduce((acc, entry) => {
                    const date = new Date(entry.start_time).toISOString().split('T')[0];
                    const existingDay = acc.find(day => day.date === date);
                    
                    if (existingDay) {
                      existingDay.total_duration += entry.duration;
                    } else {
                      acc.push({ date, total_duration: entry.duration });
                    }
                    
                    return acc;
                  }, [] as {date: string, total_duration: number}[]) 
                : []} 
                height={180}
                barColor="var(--primary-color)"
              />
            </div>
            
            <div className="project-summary mx-6 bg-white p-6 rounded-[12px] shadow-[6px_6px_16px_0_rgba(0,0,0,0.06),-6px_-6px_16px_0_rgba(255,255,255,0.8)] mb-8">
              <h2 className="project-summary-title text-lg font-semibold mb-5 text-primary-text-color">Распределение времени</h2>
              <div className="project-list space-y-4">
                {weekData && weekData.projectSummaries.map((project: ProjectSummary, index) => (
                  <div key={project.project_type} className="project-item">
                    <div className="project-item-info flex justify-between mb-2">
                      <span className="project-item-name font-medium text-primary-text-color">{project.project_name}</span>
                      <span className="project-item-time text-primary-color font-medium">{formatTime(project.total_duration)}</span>
                    </div>
                    <div className="project-item-bar bg-[#e9edf5] h-2.5 rounded-full overflow-hidden shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.7)]">
                      <div 
                        className="project-item-progress h-full rounded-full transition-all duration-300 ease-in-out" 
                        style={{
                          width: `${project.percentage}%`, 
                          backgroundColor: index === 0 ? 'var(--primary-color)' : 
                                         index === 1 ? 'var(--success-color)' : 
                                         index === 2 ? 'var(--warning-color)' : 
                                         'var(--info-color)'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
                
                {weekData && weekData.projectSummaries.length === 0 && (
                  <div className="empty-state text-center py-6 text-secondary-text-color">Нет данных о проектах</div>
                )}
              </div>
            </div>
            
            <div className="activity-list mx-6 mb-12 slide-up">
              <h2 className="project-summary-title text-lg font-semibold mb-5 text-primary-text-color">Недавняя активность</h2>
              
              {recentEntries.length > 0 ? (
                <div>
                  {recentEntries.map((entry, index) => (
                    <div 
                      key={entry.id} 
                      className="activity-item p-5 bg-[#e9edf5] rounded-[12px] shadow-[6px_6px_12px_0_rgba(0,0,0,0.15),-6px_-6px_12px_0_rgba(255,255,255,0.9)] border-t border-l border-[#ffffff50] border-b-[#00000015] border-r-[#00000015]"
                      style={{ marginBottom: index !== recentEntries.length - 1 ? '20px' : '0' }}
                    >
                      <div className="flex justify-between">
                        <div>
                          <div className="text-secondary-text-color text-sm mb-2">
                            {formatDate(entry.date)}
                          </div>
                          <div className="font-medium text-primary-text-color">
                            {getProjectName(entry.projectType)}
                          </div>
                        </div>
                        <div className="text-primary-color font-medium self-center">
                          {formatActivityTime(entry.duration)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state text-center py-6 bg-white rounded-[12px] shadow-[6px_6px_16px_0_rgba(0,0,0,0.06),-6px_-6px_16px_0_rgba(255,255,255,0.8)] text-secondary-text-color">
                  Нет недавней активности
                </div>
              )}
            </div>
          </>
        )}
        
        <NavBar />
      </div>
    </div>
  );
}

export default function Statistics() {
  return (
    <ProtectedRoute>
      <StatisticsPage />
    </ProtectedRoute>
  );
}