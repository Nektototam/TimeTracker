"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import NavBar from '../../components/NavBar';
import TopBar from '../../components/TopBar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

function ReportsApp() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [viewType, setViewType] = useState<'summary' | 'daily'>('summary');
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'custom'>('week');
  const [dateRange, setDateRange] = useState('31 март 2025 - 7 май 2025');
  const [totalTime, setTotalTime] = useState('01:28:36');
  
  const [reportData, setReportData] = useState({
    dailyActivity: [
      { date: '31 мар.', duration: '00:00' },
      { date: '01 апр.', duration: '01:28' },
    ],
    projects: [
      { name: 'Веб-разработка', duration: '01:28', percentage: 100 }
    ]
  });

  useEffect(() => {
    // Имитация загрузки данных
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="app-container">
      <div className="screen">
        <TopBar 
          title={t('nav.reports')}
          showPeriodSelector={false}
          showSettingsButton={true}
        />
        
        <div className="mt-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            {t('reports.title')}
          </h1>
          
          {/* Переключатель периодов */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
            <div className="flex space-x-2 mb-6">
              {[
                { id: 'week', label: t('reports.week') },
                { id: 'month', label: t('reports.month') },
                { id: 'quarter', label: t('reports.quarter') },
                { id: 'custom', label: t('reports.custom') }
              ].map((item) => (
                <button
                  key={item.id}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    period === item.id 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setPeriod(item.id as any)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            
            {/* Диапазон дат */}
            <div className="flex items-center justify-between mb-6">
              <button className="text-gray-400 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {dateRange}
              </div>
              <button className="text-gray-400 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Переключатель вида отчета */}
            <div className="flex space-x-2">
              <button
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  viewType === 'summary'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                onClick={() => setViewType('summary')}
              >
                {t('reports.summaryReport')}
              </button>
              <button
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  viewType === 'daily'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                onClick={() => setViewType('daily')}
              >
                {t('reports.dailyReport')}
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-gray-500">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('loading')}...
            </div>
          ) : (
            <>
              {/* Активность по дням */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
                <h2 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">
                  {t('reports.activityByDay')}
                </h2>
                <div className="h-48 relative">
                  {/* График */}
                  <div className="flex h-full items-end justify-between">
                    {reportData.dailyActivity.map((day, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                          className="w-full mx-1 bg-gradient-to-t from-primary-300 to-primary rounded-t-md transition-all hover:from-primary-400 hover:to-primary-600" 
                          style={{ 
                            height: day.duration === '00:00' ? '0%' : '80%',
                            minHeight: day.duration === '00:00' ? '0' : '4px'
                          }}
                        ></div>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">{day.date}</div>
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{day.duration}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Горизонтальные линии */}
                  <div className="absolute left-0 top-0 w-full h-full flex flex-col justify-between pointer-events-none">
                    {['01:28', '01:06', '00:44', '00:22', '00:00'].map((time, index) => (
                      <div key={index} className="border-t border-gray-100 dark:border-gray-700 w-full h-0 flex items-center">
                        <span className="text-xs text-gray-400 dark:text-gray-500 pr-2">{time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Проекты */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
                <h2 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">
                  {t('reports.projects')}
                </h2>
                <div className="space-y-4">
                  {reportData.projects.map((project, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <div className="font-medium text-gray-700 dark:text-gray-300">{project.name}</div>
                        <div className="font-bold text-primary">{project.duration}</div>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary-600 rounded-full"
                          style={{ width: `${project.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Общее время за период */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 mb-6 text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {t('reports.totalForPeriod')}
                </div>
                <div className="text-3xl font-bold text-primary">
                  {totalTime}
                </div>
              </div>
              
              {/* Кнопки действий */}
              <div className="flex justify-center space-x-6 mb-24">
                <button className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span className="text-sm">{t('reports.print')}</span>
                </button>
                <button className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                  <span className="text-sm">{t('reports.copy')}</span>
                </button>
                <button className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span className="text-sm">{t('reports.export')}</span>
                </button>
              </div>
            </>
          )}
        </div>
        
        <NavBar />
      </div>
    </div>
  );
}

export default function Reports() {
  return (
    <ProtectedRoute>
      <ReportsApp />
    </ProtectedRoute>
  );
} 