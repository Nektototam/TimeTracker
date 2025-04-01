"use client";

import React, { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';
import ProtectedRoute from '../../components/ProtectedRoute';
import ActivityChart from '../../components/ActivityChart';
import DailyTimelineView from '../../components/DailyTimelineView';
import { reportService, ReportData, ProjectSummary, PeriodType } from '../../lib/reportService';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

// Вспомогательные функции для форматирования времени
const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const formatFullTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

function ReportsPage() {
  const { user } = useAuth();
  const { translationInstance } = useLanguage();
  const { t } = translationInstance;
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  
  // Состояние для выбранного периода
  const [periodType, setPeriodType] = useState<PeriodType>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState('');
  
  // Состояние для типа отображения (summary или daily)
  const [viewType, setViewType] = useState<'summary' | 'daily'>('summary');
  
  // Функция перевода
  const translate = (key: string): string => {
    const i18nTranslation = t(`reports.${key}`);
    
    // Возвращаем перевод напрямую, так как всё должно быть в файлах локализации
    return i18nTranslation === `reports.${key}` ? key : i18nTranslation;
  };

  // Загрузка данных отчета
  const loadReportData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      let data: ReportData;
      
      // Загружаем данные в зависимости от периода
      switch (periodType) {
        case 'week':
          data = await reportService.getWeeklyReport(user.id);
          break;
        case 'month':
          data = await reportService.getMonthlyReport(user.id);
          break;
        case 'quarter':
          data = await reportService.getQuarterlyReport(user.id);
          break;
        case 'custom':
          // Для примера используем месяц, потом можно реализовать выбор произвольного периода
          const startDate = new Date();
          startDate.setDate(1);
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 1, 0);
          
          data = await reportService.getCustomReport(
            user.id, 
            startDate.toISOString(), 
            endDate.toISOString()
          );
          break;
        default:
          data = await reportService.getWeeklyReport(user.id);
      }
      
      setReportData(data);
      
      // Обновляем отображаемый диапазон дат на основе полученных данных
      if (data) {
        updateDateRangeFromData(data.startDate, data.endDate);
      }
    } catch (error) {
      console.error('Ошибка загрузки отчета:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Обновляем отчет при изменении периода или пользователя
  useEffect(() => {
    loadReportData();
  }, [user, periodType, currentDate]);
  
  // Обновляем отображаемый диапазон дат на основе полученных данных
  const updateDateRangeFromData = (startDate: Date, endDate: Date) => {
    // Форматтер для дат
    const formatDate = (date: Date) => {
      return `${date.getDate()} ${date.toLocaleString('ru-RU', { month: 'short' })} ${date.getFullYear()}`;
    };
    
    setDateRange(`${formatDate(startDate)} - ${formatDate(endDate)}`);
  };
  
  // Перемещение на предыдущий период
  const goToPrevPeriod = () => {
    const newDate = new Date(currentDate);
    
    switch (periodType) {
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'quarter':
        newDate.setMonth(newDate.getMonth() - 3);
        break;
    }
    
    setCurrentDate(newDate);
  };
  
  // Перемещение на следующий период
  const goToNextPeriod = () => {
    const newDate = new Date(currentDate);
    
    switch (periodType) {
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'quarter':
        newDate.setMonth(newDate.getMonth() + 3);
        break;
    }
    
    setCurrentDate(newDate);
  };
  
  // Подготовка данных для графика активности
  const getDailyChartData = () => {
    if (!reportData || !reportData.entries) return [];
    
    // Группируем записи по дням
    const dailyMap = new Map<string, number>();
    
    reportData.entries.forEach(entry => {
      const date = new Date(entry.start_time).toISOString().split('T')[0];
      const current = dailyMap.get(date) || 0;
      dailyMap.set(date, current + entry.duration);
    });
    
    // Преобразуем в массив объектов для графика
    const dailyData = Array.from(dailyMap.entries()).map(([date, duration]) => ({
      date,
      total_duration: duration
    }));
    
    // Сортируем по дате
    return dailyData.sort((a, b) => a.date.localeCompare(b.date));
  };
  
  // Обработчики для действий с отчетом
  const handlePrint = () => {
    window.print();
  };
  
  const handleCopy = () => {
    // Функция копирования данных в буфер обмена
    if (!reportData) return;
    
    let text = `${translate('title')} ${dateRange}\n\n`;
    
    text += `${translate('projects')}:\n`;
    reportData.projectSummaries.forEach(project => {
      text += `${project.project_name}: ${formatTime(project.total_duration)} (${project.percentage}%)\n`;
    });
    
    text += `\n${translate('totalTime')}: ${formatFullTime(reportData.totalDuration)}`;
    
    navigator.clipboard.writeText(text).then(() => {
      alert(translate('copied'));
    }).catch(err => {
      console.error('Ошибка при копировании', err);
      alert(translate('copyError'));
    });
  };
  
  const handleExport = () => {
    // Функция экспорта данных в CSV
    if (!reportData) return;
    
    const rows = [
      ['Тип проекта', 'Название', 'Длительность (мин)', 'Процент'],
      ...reportData.projectSummaries.map(project => [
        project.project_type,
        project.project_name,
        (project.total_duration / 60000).toFixed(2),
        project.percentage.toString()
      ]),
      [],
      ['Всего (часы:минуты:секунды)', formatFullTime(reportData.totalDuration)]
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      rows.map(row => row.join(',')).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `timetracker-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="app-container">
      <div id="report-screen" className="screen">
        <div className="report-header">
          <h1>{translate('title')}</h1>
        </div>
        
        <div className="period-tabs slide-up">
          <button 
            className={`period-tab ${periodType === 'week' ? 'active' : ''}`}
            onClick={() => setPeriodType('week')}
          >
            {translate('weekly')}
          </button>
          <button 
            className={`period-tab ${periodType === 'month' ? 'active' : ''}`}
            onClick={() => setPeriodType('month')}
          >
            {translate('monthly')}
          </button>
          <button 
            className={`period-tab ${periodType === 'quarter' ? 'active' : ''}`}
            onClick={() => setPeriodType('quarter')}
          >
            {translate('quarterly')}
          </button>
          <button 
            className={`period-tab ${periodType === 'custom' ? 'active' : ''}`}
            onClick={() => setPeriodType('custom')}
          >
            {translate('custom')}
          </button>
        </div>
        
        <div className="date-selector slide-up">
          <button className="date-nav prev" onClick={goToPrevPeriod}>◀</button>
          <span className="date-range">{dateRange}</span>
          <button className="date-nav next" onClick={goToNextPeriod}>▶</button>
        </div>
        
        <div className="view-type-selector slide-up">
          <button 
            className={`view-type-button ${viewType === 'summary' ? 'active' : ''}`}
            onClick={() => setViewType('summary')}
          >
            {translate('summary')}
          </button>
          <button 
            className={`view-type-button ${viewType === 'daily' ? 'active' : ''}`}
            onClick={() => setViewType('daily')}
          >
            {translate('daily')}
          </button>
        </div>
        
        {isLoading ? (
          <div className="loading-state">{translate('loading')}</div>
        ) : (
          viewType === 'summary' ? (
            // Суммарный отчет
            <>
              <div className="chart-container slide-up">
                <div className="chart-title">{translate('dailyActivity')}</div>
                <ActivityChart 
                  data={getDailyChartData()} 
                  height={180}
                  barColor="var(--primary-color)"
                />
              </div>
              
              <div className="project-summary">
                <h2 className="project-summary-title">{translate('projects')}</h2>
                <div className="project-list">
                  {reportData && reportData.projectSummaries.map((project, index) => (
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
                  
                  {reportData && reportData.projectSummaries.length === 0 && (
                    <div className="empty-state">{translate('noData')}</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            // Подробный отчет по дням
            <div className="daily-view slide-up">
              <DailyTimelineView 
                entries={reportData?.entries || []} 
                formatTime={formatTime}
              />
            </div>
          )
        )}
        
        <div className="report-total slide-up">
          <div className="report-total-label">{translate('totalTime')}</div>
          <div className="report-total-value">
            {reportData ? formatFullTime(reportData.totalDuration) : '00:00:00'}
          </div>
        </div>
        
        <div className="report-actions slide-up">
          <button className="report-action" onClick={handlePrint}>
            <span className="report-action-icon">🖨️</span>
            <span className="report-action-text">{translate('print')}</span>
          </button>
          <button className="report-action" onClick={handleCopy}>
            <span className="report-action-icon">📋</span>
            <span className="report-action-text">{translate('copy')}</span>
          </button>
          <button className="report-action" onClick={handleExport}>
            <span className="report-action-icon">📤</span>
            <span className="report-action-text">{translate('export')}</span>
          </button>
        </div>
        
        <NavBar />
      </div>
    </div>
  );
}

export default function Reports() {
  return (
    <ProtectedRoute>
      <ReportsPage />
    </ProtectedRoute>
  );
} 