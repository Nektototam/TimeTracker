"use client";

import React, { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';
import ProtectedRoute from '../../components/ProtectedRoute';
import ActivityChart from '../../components/ActivityChart';
import DailyTimelineView from '../../components/DailyTimelineView';
import { reportService, ReportData, ProjectSummary, PeriodType } from '../../lib/reportService';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';

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
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  
  // Состояние для выбранного периода
  const [periodType, setPeriodType] = useState<PeriodType>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState('');
  
  // Состояние для типа отображения (summary или daily)
  const [viewType, setViewType] = useState<'summary' | 'daily'>('summary');
  
  // Загрузка данных отчета
  const loadReportData = async (periodType: PeriodType = 'week', customStart?: string, customEnd?: string) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      let data;
      console.log('Запрос отчетных данных...');
      
      // Загрузка данных через правильный метод сервиса
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
          if (customStart && customEnd) {
            data = await reportService.getCustomReport(user.id, customStart, customEnd);
          } else {
            // Для примера используем текущий месяц
            const startDate = new Date();
            startDate.setDate(1);
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1, 0);
            
            data = await reportService.getCustomReport(
              user.id, 
              startDate.toISOString(), 
              endDate.toISOString()
            );
          }
          break;
      }
      
      console.log(`Получено ${data?.entries?.length || 0} записей после фильтрации на сервере`);
      
      // Сохраняем данные и обновляем состояние
      setReportData(data);
      
      // Обновляем отображаемые даты
      if (data?.startDate && data?.endDate) {
        updateDateRangeFromData(data.startDate, data.endDate);
      }
      
    } catch (error) {
      console.error('Ошибка при загрузке данных отчета:', error);
      //toast.error('Не удалось загрузить данные отчета');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Обновляем отчет при изменении периода или пользователя
  useEffect(() => {
    loadReportData(periodType);
  }, [user, periodType, currentDate]);
  
  // Обновляем отображаемый диапазон дат на основе полученных данных
  const updateDateRangeFromData = (startDate: Date, endDate: Date) => {
    // Форматтер для дат
    const formatDate = (date: Date) => {
      return `${date.getDate()} ${date.toLocaleString('ru-RU', { month: 'short' })} ${date.getFullYear()}`;
    };
    
    setDateRange(`${formatDate(startDate)} - ${formatDate(endDate)}`);
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
    
    let text = `Отчет по времени за период ${dateRange}\n\n`;
    
    text += "Проекты:\n";
    reportData.projectSummaries.forEach(project => {
      text += `${project.project_name}: ${formatTime(project.total_duration)} (${project.percentage}%)\n`;
    });
    
    text += `\nВсего: ${formatFullTime(reportData.totalDuration)}`;
    
    navigator.clipboard.writeText(text).then(() => {
      alert("Отчет скопирован в буфер обмена");
    }).catch(err => {
      console.error('Ошибка при копировании', err);
      alert("Не удалось скопировать отчет");
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
      <div className="screen">
        {/* Заголовок и контроль периода */}
        <h1 className="text-3xl font-bold mb-4">Отчеты</h1>
        
        <div className="card mb-6">
          <div className="card-content">
            <div className="period-selector">
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="w-full max-w-[180px]">
                  <select
                    value={periodType}
                    onChange={(e) => setPeriodType(e.target.value as PeriodType)}
                    className="w-full px-4 py-2 text-center rounded-full bg-[#e9edf5] text-gray-700 border-t border-l border-[#ffffff50] border-b-[#00000015] border-r-[#00000015] shadow-[inset_3px_3px_6px_rgba(0,0,0,0.1),inset_-3px_-3px_6px_rgba(255,255,255,0.7)] focus:outline-none focus:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.15),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]"
                  >
                    <option value="week">Неделя</option>
                    <option value="month">Месяц</option>
                    <option value="quarter">Квартал</option>
                    <option value="custom">Произвольный</option>
                  </select>
                </div>
                
                <div className="period-range text-center font-medium text-secondary-text-color">
                  {dateRange}
                </div>
              </div>
              
              <div className="view-type-selector mt-4">
                <div className="flex justify-center gap-4">
                  <Button 
                    variant={viewType === 'summary' ? 'primary' : 'outline'}
                    size="md"
                    rounded="full"
                    onClick={() => setViewType('summary')}
                  >
                    Сводка
                  </Button>
                  <Button 
                    variant={viewType === 'daily' ? 'primary' : 'outline'}
                    size="md"
                    rounded="full"
                    onClick={() => setViewType('daily')}
                  >
                    По дням
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Остальная часть страницы */}
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="loading-state">Загрузка отчета...</div>
          </div>
        ) : (
          viewType === 'summary' ? (
            // Суммарный отчет
            <>
              <div className="card mb-6 slide-up">
                <div className="card-content">
                  <h2 className="text-lg font-semibold mb-3">Активность по дням</h2>
                  <ActivityChart 
                    data={getDailyChartData()} 
                    height={180}
                    barColor="var(--primary-color)"
                  />
                </div>
              </div>
              
              <div className="card mb-6 slide-up">
                <div className="card-content">
                  <h2 className="text-lg font-semibold mb-4">Проекты</h2>
                  <div className="project-list space-y-4">
                    {reportData && reportData.projectSummaries.map((project, index) => (
                      <div key={project.project_type} className="project-item">
                        <div className="flex justify-between items-center mb-1">
                          <span className="project-item-name font-medium">{project.project_name}</span>
                          <span className="project-item-time text-secondary-text-color">{formatTime(project.total_duration)}</span>
                        </div>
                        <div className="project-item-bar h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="project-item-progress h-full rounded-full" 
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
                      <div className="text-center py-6 text-secondary-text-color">Нет данных о проектах за выбранный период</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Подробный отчет по дням
            <div className="card mb-6 slide-up">
              <div className="card-content">
                <DailyTimelineView 
                  entries={reportData?.entries || []} 
                  formatTime={formatTime}
                />
              </div>
            </div>
          )
        )}
        
        <div className="card mb-6 slide-up">
          <div className="card-content flex justify-between items-center">
            <div className="font-semibold">Всего за период</div>
            <div className="text-lg font-bold text-primary-color">
              {reportData ? formatFullTime(reportData.totalDuration) : '00:00:00'}
            </div>
          </div>
        </div>
        
        <div className="flex justify-center gap-4 mb-20 slide-up">
          <Button 
            variant="primary"
            size="md"
            leftIcon="🖨️"
            onClick={handlePrint}
          >
            Печать
          </Button>
          <Button 
            variant="primary"
            size="md"
            leftIcon="📋"
            onClick={handleCopy}
          >
            Копировать
          </Button>
          <Button 
            variant="primary"
            size="md"
            leftIcon="📤"
            onClick={handleExport}
          >
            Экспорт
          </Button>
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