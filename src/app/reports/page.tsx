"use client";

import React, { useState, useEffect } from 'react';
import AppShell from '../../components/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import ActivityChart from '../../components/ActivityChart';
import DailyTimelineView from '../../components/DailyTimelineView';
import { reportService, ReportData, ProjectSummary, PeriodType } from '../../lib/reportService';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { ErrorBoundary } from '../../components/ErrorBoundary';

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
      const date = new Date(entry.startTime).toISOString().split('T')[0];
      const current = dailyMap.get(date) || 0;
      dailyMap.set(date, current + entry.durationMs);
    });

    // Преобразуем в массив объектов для графика
    const dailyData = Array.from(dailyMap.entries()).map(([date, duration]) => ({
      date,
      totalDuration: duration
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
      text += `${project.project.name}: ${formatTime(project.totalDuration)} (${project.percentage}%)\n`;
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
      ['ID проекта', 'Название', 'Длительность (мин)', 'Процент'],
      ...reportData.projectSummaries.map(project => [
        project.project.id,
        project.project.name,
        (project.totalDuration / 60000).toFixed(2),
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
    <AppShell title="Отчеты">
      <ErrorBoundary sectionName="Reports">
        <div className="space-y-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-foreground">Отчеты</h1>
            <p className="text-sm text-muted-foreground">{dateRange}</p>
          </div>
          
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
              <div className="w-full max-w-[200px]">
                <Select
                  value={periodType}
                  onChange={(e) => setPeriodType(e.target.value as PeriodType)}
                  className="w-full"
                >
                  <option value="week">Неделя</option>
                  <option value="month">Месяц</option>
                  <option value="quarter">Квартал</option>
                  <option value="custom">Произвольный</option>
                </Select>
              </div>
              
              <div className="flex justify-center gap-3">
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
          
          {isLoading ? (
            <div className="flex h-40 items-center justify-center rounded-2xl border border-border bg-card text-sm text-muted-foreground">
              Загрузка отчета...
            </div>
          ) : (
            viewType === 'summary' ? (
              <>
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h2 className="mb-3 text-lg font-semibold text-foreground">Активность по дням</h2>
                  <ActivityChart 
                    data={getDailyChartData()} 
                    height={180}
                    barColor="hsl(230 74% 62%)"
                  />
                </div>
                
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h2 className="mb-4 text-lg font-semibold text-foreground">Проекты</h2>
                  <div className="space-y-4">
                    {reportData && reportData.projectSummaries.map((project, index) => (
                      <div key={project.project.id}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{project.project.name}</span>
                          <span className="text-sm text-muted-foreground">{formatTime(project.totalDuration)}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${project.percentage}%`,
                              backgroundColor: project.project.color
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                    
                    {reportData && reportData.projectSummaries.length === 0 && (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        Нет данных о проектах за выбранный период
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <DailyTimelineView 
                  entries={reportData?.entries || []} 
                  formatTime={formatTime}
                />
              </div>
            )
          )}
          
          <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-6 py-4 shadow-sm">
            <div className="text-sm font-semibold text-foreground">Всего за период</div>
            <div className="text-lg font-semibold text-primary">
              {reportData ? formatFullTime(reportData.totalDuration) : '00:00:00'}
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
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
        </div>
      </ErrorBoundary>
    </AppShell>
  );
}

export default function Reports() {
  return (
    <ProtectedRoute>
      <ReportsPage />
    </ProtectedRoute>
  );
}