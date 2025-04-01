"use client";

import React, { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';
import TopBar from '../../components/TopBar';
import ProtectedRoute from '../../components/ProtectedRoute';
import ActivityChart from '../../components/ActivityChart';
import { reportService, ReportData, ProjectSummary } from '../../lib/reportService';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

type PeriodType = 'day' | 'week' | 'month';

function StatisticsApp() {
  const { user } = useAuth();
  const { translationInstance } = useLanguage();
  const { t } = translationInstance;
  const { i18n } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const [weekData, setWeekData] = useState<ReportData | null>(null);
  const [monthData, setMonthData] = useState<ReportData | null>(null);
  const [allTimeData, setAllTimeData] = useState<ReportData | null>(null);
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [activePeriod, setActivePeriod] = useState<PeriodType>('day');

  // Функция перевода
  const translate = (key: string): string => {
    const i18nTranslation = t(`statistics.${key}`);
    
    // Возвращаем перевод напрямую, так как всё должно быть в файлах локализации
    return i18nTranslation === `statistics.${key}` ? key : i18nTranslation;
  };

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
  
  // Форматирование времени
  const formatTime = (seconds: number): string => {
    if (!seconds) return '00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    
    return `${minutes}m`;
  };
  
  // Форматирование полного времени (с часами, минутами и секундами)
  const formatFullTime = (seconds: number): string => {
    if (!seconds) return '00:00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Форматирование даты
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  const handlePeriodChange = (period: PeriodType) => {
    setActivePeriod(period);
    // Здесь можно добавить логику загрузки статистики для выбранного периода
  };

  return (
    <div className="app-container">
      <div className="screen">
        <TopBar 
          title={i18n.t('nav.statistics')} 
          onPeriodChange={handlePeriodChange}
        />
        
        <div className="mt-8 p-6 bg-white rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {i18n.t(`periods.${activePeriod}`)} {i18n.t('nav.statistics')}
          </h2>
          
          {isLoading ? (
            <div className="text-center py-10 text-gray-500">
              {i18n.t('loading')}...
            </div>
          ) : (
            <>
              <div className="stats-summary slide-up">
                <div className="stats-period-selector">
                  <div className="stats-period">
                    <div className="stats-period-label">{translate('week')}</div>
                    <div className="stats-period-value">
                      {weekData && formatFullTime(weekData.totalDuration)}
                    </div>
                  </div>
                  
                  <div className="stats-period">
                    <div className="stats-period-label">{translate('month')}</div>
                    <div className="stats-period-value">
                      {monthData && formatFullTime(monthData.totalDuration)}
                    </div>
                  </div>
                  
                  <div className="stats-period">
                    <div className="stats-period-label">{translate('allTime')}</div>
                    <div className="stats-period-value">
                      {allTimeData && formatFullTime(allTimeData.totalDuration)}
                    </div>
                  </div>
                </div>
                
                <div className="stats-chart slide-up">
                  <div className="stats-chart-title">{translate('dailyActivity')}</div>
                  {isClient && weekData && (
                    <ActivityChart 
                      data={weekData.entries ? 
                        weekData.entries.reduce((acc, entry) => {
                          const date = new Date(entry.start_time).toISOString().split('T')[0];
                          const existingDay = acc.find(day => day.date === date);
                          
                          if (existingDay) {
                            existingDay.total_duration += entry.duration;
                          } else {
                            acc.push({ date, total_duration: entry.duration });
                          }
                          
                          return acc;
                        }, [] as {date: string, total_duration: number}[]) : []
                      } 
                      height={180}
                      barColor="#9d79bc"
                    />
                  )}
                </div>
                
                <div className="project-summary slide-up">
                  <h2 className="project-summary-title">{translate('projects')}</h2>
                  
                  <div className="project-list">
                    {weekData && weekData.projectSummaries.slice(0, 4).map((project, index) => (
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
                              backgroundColor: index === 0 ? '#9d79bc' : 
                                              index === 1 ? '#60d394' : 
                                              index === 2 ? '#ffd97d' : 
                                              '#ff9b85'
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="activity-list slide-up">
                  <h2 className="activity-list-title">{translate('recentActivity')}</h2>
                  
                  {recentEntries.map(entry => (
                    <div key={entry.id} className="activity-item">
                      <div className="activity-item-header">
                        <span className="activity-item-date">{formatDate(entry.date)}</span>
                        <span className="activity-item-duration">{formatTime(entry.duration)}</span>
                      </div>
                      <div className="activity-item-name">{entry.projectType}</div>
                    </div>
                  ))}
                  
                  {recentEntries.length === 0 && (
                    <div className="empty-state">{translate('noData')}</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        
        <NavBar />
      </div>
    </div>
  );
}

export default function Statistics() {
  return (
    <ProtectedRoute>
      <StatisticsApp />
    </ProtectedRoute>
  );
} 