"use client";

import React, { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';
import ProtectedRoute from '../../components/ProtectedRoute';
import ActivityChart from '../../components/ActivityChart';
import { reportService, ReportData, ProjectSummary, PeriodType } from '../../lib/reportService';
import { useAuth } from '../../contexts/AuthContext';

function ReportsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  
  // Состояние для выбранного периода
  const [periodType, setPeriodType] = useState<PeriodType>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState('');
  
  // Загрузка данных отчета
  const loadReportData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      let data: ReportData;
      
      // Загружаем данные в зависимости от периода
      switch (periodType) {
        case 'week':
          data = await reportService.getWeekReport(currentDate);
          break;
        case 'month':
          data = await reportService.getMonthReport(currentDate);
          break;
        case 'quarter':
          data = await reportService.getQuarterReport(currentDate);
          break;
        case 'custom':
          // Для примера используем месяц, потом можно реализовать выбор произвольного периода
          data = await reportService.getMonthReport(currentDate);
          break;
        default:
          data = await reportService.getWeekReport(currentDate);
      }
      
      setReportData(data);
    } catch (error) {
      console.error('Ошибка загрузки отчета:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Обновляем дату при смене периода или даты
  useEffect(() => {
    loadReportData();
    updateDateRange();
  }, [user, periodType, currentDate]);
  
  // Обновляем отображаемый диапазон дат
  const updateDateRange = () => {
    // Форматтер для дат
    const formatDate = (date: Date) => {
      return `${date.getDate()} ${date.toLocaleString('ru-RU', { month: 'short' })} ${date.getFullYear()}`;
    };
    
    switch (periodType) {
      case 'week': {
        // Получаем первый день недели (понедельник) и последний (воскресенье)
        const day = currentDate.getDay() || 7; // Преобразуем 0 (воскресенье) в 7
        const diff = currentDate.getDate() - day + 1; // Получаем понедельник
        
        const startDate = new Date(currentDate);
        startDate.setDate(diff);
        
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        
        setDateRange(`${formatDate(startDate)} - ${formatDate(endDate)}`);
        break;
      }
      case 'month': {
        // Получаем первый и последний день месяца
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        setDateRange(`${formatDate(startDate)} - ${formatDate(endDate)}`);
        break;
      }
      case 'quarter': {
        // Получаем первый день квартала
        const quarter = Math.floor(currentDate.getMonth() / 3);
        const startDate = new Date(currentDate.getFullYear(), quarter * 3, 1);
        
        // Получаем последний день квартала
        const endDate = new Date(currentDate.getFullYear(), (quarter + 1) * 3, 0);
        
        setDateRange(`${formatDate(startDate)} - ${formatDate(endDate)}`);
        break;
      }
      case 'custom':
        setDateRange('Произвольный период');
        break;
    }
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
  
  // Обработчик экспорта отчета
  const handleExport = () => {
    if (!reportData) return;
    
    // Генерируем CSV строку
    let csv = 'Дата,Тип проекта,Длительность (часы)\n';
    
    reportData.entries.forEach(entry => {
      const date = new Date(entry.start_time).toLocaleDateString('ru-RU');
      const projectName = reportService.getProjectName(entry.project_type);
      const duration = (entry.duration / 3600000).toFixed(2); // Переводим в часы
      
      csv += `${date},"${projectName}",${duration}\n`;
    });
    
    // Создаем блоб и ссылку для скачивания
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `timetracker_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Обработчик печати
  const handlePrint = () => {
    window.print();
  };
  
  // Обработчик копирования
  const handleCopy = () => {
    if (!reportData) return;
    
    let text = `Отчет за период: ${dateRange}\n\n`;
    text += `Общее время: ${reportService.formatFullTime(reportData.totalDuration)}\n\n`;
    text += `Проекты:\n`;
    
    reportData.projectSummaries.forEach(project => {
      text += `${reportService.getProjectName(project.project_type)}: ${reportService.formatTime(project.total_duration)} (${project.percentage.toFixed(1)}%)\n`;
    });
    
    navigator.clipboard.writeText(text)
      .then(() => alert('Отчет скопирован в буфер обмена'))
      .catch(err => console.error('Не удалось скопировать: ', err));
  };
  
  return (
    <div className="app-container">
      <div id="report-screen" className="screen">
        <div className="report-header">
          <h1>Отчет за период</h1>
        </div>
        
        <div className="period-tabs slide-up">
          <button 
            className={`period-tab ${periodType === 'week' ? 'active' : ''}`}
            onClick={() => setPeriodType('week')}
          >
            Неделя
          </button>
          <button 
            className={`period-tab ${periodType === 'month' ? 'active' : ''}`}
            onClick={() => setPeriodType('month')}
          >
            Месяц
          </button>
          <button 
            className={`period-tab ${periodType === 'quarter' ? 'active' : ''}`}
            onClick={() => setPeriodType('quarter')}
          >
            Квартал
          </button>
          <button 
            className={`period-tab ${periodType === 'custom' ? 'active' : ''}`}
            onClick={() => setPeriodType('custom')}
          >
            Свой
          </button>
        </div>
        
        <div className="date-selector slide-up">
          <button className="date-nav prev" onClick={goToPrevPeriod}>◀</button>
          <span className="date-range">{dateRange}</span>
          <button className="date-nav next" onClick={goToNextPeriod}>▶</button>
        </div>
        
        {isLoading ? (
          <div className="loading-state">Загрузка отчета...</div>
        ) : (
          <>
            <div className="chart-container slide-up">
              <div className="chart-title">Активность по дням</div>
              <ActivityChart 
                data={reportData?.dailySummaries || []} 
                height={180}
                barColor="var(--primary-color)"
              />
            </div>
            
            <div className="project-summary">
              <h2 className="project-summary-title">Проекты</h2>
              <div className="project-list">
                {reportData && reportData.projectSummaries.map((project, index) => (
                  <div key={project.project_type} className="project-item">
                    <div className="project-item-info">
                      <span className="project-item-name">{reportService.getProjectName(project.project_type)}</span>
                      <span className="project-item-time">{reportService.formatTime(project.total_duration)}</span>
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
                  <div className="empty-state">Нет данных о проектах за выбранный период</div>
                )}
              </div>
            </div>
            
            <div className="report-total slide-up">
              <div className="report-total-label">Всего за период</div>
              <div className="report-total-value">
                {reportData ? reportService.formatFullTime(reportData.totalDuration) : '00:00:00'}
              </div>
            </div>
            
            <div className="report-actions slide-up">
              <button className="report-action" onClick={handlePrint}>
                <span className="report-action-icon">🖨️</span>
                <span className="report-action-text">Печать</span>
              </button>
              <button className="report-action" onClick={handleCopy}>
                <span className="report-action-icon">📋</span>
                <span className="report-action-text">Копировать</span>
              </button>
              <button className="report-action" onClick={handleExport}>
                <span className="report-action-icon">📤</span>
                <span className="report-action-text">Экспорт</span>
              </button>
            </div>
          </>
        )}
        
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