"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import NavBar from '../../components/NavBar';
import TopBar from '../../components/TopBar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

function StatsApp() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [stats, setStats] = useState({
    weekTotal: '01:28',
    monthTotal: '01:28',
    allTimeTotal: '03:38',
    weeklyActivity: [
      { date: '01 апр.', duration: '01:28' },
      { date: '02 апр.', duration: '00:00' },
      { date: '03 апр.', duration: '00:00' },
      { date: '04 апр.', duration: '00:00' },
      { date: '05 апр.', duration: '00:00' },
      { date: '06 апр.', duration: '00:00' },
      { date: '07 апр.', duration: '00:00' },
    ],
    timeDistribution: [
      { type: 'Веб-разработка', duration: '01:28', percentage: 100 }
    ],
    recentActivity: [
      { id: 1, date: 'Сегодня, 18:26', type: 'Веб-разработка', duration: '00:00' },
      { id: 2, date: 'Сегодня, 18:25', type: 'Веб-разработка', duration: '00:00' },
      { id: 3, date: 'Сегодня, 18:19', type: 'Веб-разработка', duration: '00:00' },
      { id: 4, date: 'Сегодня, 18:10', type: 'Веб-разработка', duration: '00:20' },
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
          title={t('nav.stats')}
          showPeriodSelector={true}
          showSettingsButton={true}
          onPeriodChange={(period) => setPeriod(period)}
        />
        
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
            {/* Общее время */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mt-6 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.weekTotal}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('stats.forWeek')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.monthTotal}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('stats.forMonth')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.allTimeTotal}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('stats.total')}</div>
              </div>
            </div>
            
            {/* Активность за неделю */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mt-6">
              <h2 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">
                {t('stats.activityForWeek')}
              </h2>
              <div className="h-48 relative">
                {/* График */}
                <div className="flex h-full items-end justify-between">
                  {stats.weeklyActivity.map((day, index) => (
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
            
            {/* Распределение времени */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mt-6">
              <h2 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">
                {t('stats.timeDistribution')}
              </h2>
              <div className="space-y-4">
                {stats.timeDistribution.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <div className="font-medium text-gray-700 dark:text-gray-300">{item.type}</div>
                      <div className="font-bold text-primary">{item.duration}</div>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-primary-600 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Недавняя активность */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mt-6 mb-24">
              <h2 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">
                {t('stats.recentActivity')}
              </h2>
              <div className="space-y-4">
                {stats.recentActivity.map((activity) => (
                  <div 
                    key={activity.id}
                    className="p-3 bg-gray-50 dark:bg-gray-750 rounded-lg hover:shadow-sm transition-all border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex justify-between mb-1">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{activity.date}</div>
                      <div className="font-bold text-primary">{activity.duration}</div>
                    </div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">{activity.type}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        <NavBar />
      </div>
    </div>
  );
}

export default function Stats() {
  return (
    <ProtectedRoute>
      <StatsApp />
    </ProtectedRoute>
  );
} 