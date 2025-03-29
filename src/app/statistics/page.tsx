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

  // Форматирование даты для отображения
  const formatDate = (date: Date): string => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      return `Сегодня, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (isYesterday) {
      return `Вчера, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else {
      return `${date.getDate()} ${date.toLocaleString('ru-RU', { month: 'short' })}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
  };

  // Форматирование времени
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
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

  return (
    <div className="app-container">
      <div id="stats-screen" className="screen">
        <div className="stats-header">
          <h1>Статистика</h1>
        </div>
        
        {isLoading ? (
          <div className="loading-state">Загрузка статистики...</div>
        ) : (
          <>
            <div className="stats-total slide-up">
              <div className="stats-total-item">
                <span className="stats-total-value">
                  {weekData ? formatTime(weekData.totalDuration) : '00:00'}
                </span>
                <span className="stats-total-label">За неделю</span>
              </div>
              <div className="stats-total-item">
                <span className="stats-total-value">
                  {monthData ? formatTime(monthData.totalDuration) : '00:00'}
                </span>
                <span className="stats-total-label">За месяц</span>
              </div>
              <div className="stats-total-item">
                <span className="stats-total-value">
                  {allTimeData ? formatTime(allTimeData.totalDuration) : '00:00'}
                </span>
                <span className="stats-total-label">Всего</span>
              </div>
            </div>
            
            <div className="chart-container slide-up">
              <div className="chart-title">Активность за неделю</div>
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
            
            <div className="project-summary">
              <h2 className="project-summary-title">Распределение времени</h2>
              <div className="project-list">
                {weekData && weekData.projectSummaries.map((project: ProjectSummary, index) => (
                  <div key={project.project_type} className="project-item">
                    <div className="project-item-info">
                      <span className="project-item-name">{project.project_name}</span>
                      <span className="project-item-time">{formatTime(project.total_duration)}</span>
                    </div>
                    <div className="project-item-bar">
                      <div 
                        className="project-item-progress" 
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
                  <div className="empty-state">Нет данных о проектах</div>
                )}
              </div>
            </div>
            
            <div className="activity-list">
              <h2 className="activity-list-title">Недавняя активность</h2>
              
              {recentEntries.map(entry => (
                <div key={entry.id} className="activity-item">
                  <div className="activity-item-header">
                    <span className="activity-item-date">{formatDate(entry.date)}</span>
                    <span className="activity-item-duration">{formatTime(entry.duration)}</span>
                  </div>
                  <div className="activity-item-name">{getProjectName(entry.projectType)}</div>
                </div>
              ))}
              
              {recentEntries.length === 0 && (
                <div className="empty-state">Нет недавней активности</div>
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