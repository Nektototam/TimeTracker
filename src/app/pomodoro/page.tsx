"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import NavBar from '../../components/NavBar';
import TopBar from '../../components/TopBar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

function PomodoroApp() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  
  // Настройки помидора
  const [settings, setSettings] = useState({
    workTime: 25,
    restTime: 5,
    longRestTime: 15,
    autoStart: false
  });
  
  // Состояние таймера
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState<'work' | 'rest'>('work');
  const [timeLeft, setTimeLeft] = useState(settings.workTime * 60);
  const [cycle, setCycle] = useState(1);
  
  // Эффект для загрузки настроек
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Эффект для обновления таймера
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Таймер закончился
            clearInterval(interval!);
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused]);
  
  // Обработка окончания таймера
  const handleTimerComplete = () => {
    // Играем звук уведомления
    try {
      const audio = new Audio('/sounds/bell.mp3');
      audio.play();
    } catch (error) {
      console.error('Ошибка воспроизведения звука', error);
    }
    
    // Переключаем режим
    if (mode === 'work') {
      // Переход к отдыху
      const newMode = 'rest';
      setMode(newMode);
      setTimeLeft(settings.restTime * 60);
      
      // Если включен автозапуск, сразу стартуем таймер
      if (settings.autoStart) {
        setIsActive(true);
        setIsPaused(false);
      } else {
        setIsActive(false);
      }
      
      // Увеличиваем счетчик циклов
      setCycle(prevCycle => prevCycle + 1);
    } else {
      // Переход к работе
      setMode('work');
      setTimeLeft(settings.workTime * 60);
      
      // Если включен автозапуск, сразу стартуем таймер
      if (settings.autoStart) {
        setIsActive(true);
        setIsPaused(false);
      } else {
        setIsActive(false);
      }
    }
  };
  
  // Форматирование времени
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Расчет процента для прогресс-кольца
  const calculateProgress = (): number => {
    const total = mode === 'work' ? settings.workTime * 60 : settings.restTime * 60;
    return ((total - timeLeft) / total) * 100;
  };
  
  // Запуск таймера
  const startTimer = () => {
    setIsActive(true);
    setIsPaused(false);
  };
  
  // Пауза таймера
  const pauseTimer = () => {
    setIsPaused(true);
  };
  
  // Сброс таймера
  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(mode === 'work' ? settings.workTime * 60 : settings.restTime * 60);
  };
  
  // Обновление настроек
  const updateSettings = (key: string, value: number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Если меняем время работы/отдыха и таймер не активен, обновляем timeLeft
    if (key === 'workTime' && mode === 'work' && !isActive) {
      setTimeLeft((value as number) * 60);
    } else if (key === 'restTime' && mode === 'rest' && !isActive) {
      setTimeLeft((value as number) * 60);
    }
  };
  
  // Расчет стилей для SVG-прогресса
  const progressStyle = {
    strokeDasharray: 264, // 2 * Math.PI * 42 (окружность круга с r=42)
    strokeDashoffset: 264 - (264 * calculateProgress() / 100),
    stroke: mode === 'work' ? 'var(--primary-color)' : 'var(--success-color)'
  };
  
  return (
    <div className="app-container">
      <div className="screen">
        <TopBar 
          title={t('nav.pomodoro')}
          showPeriodSelector={false}
          showSettingsButton={true}
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
            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-10">
                {t('pomodoro.description')}
              </p>
              
              {/* Таймер */}
              <div className="relative w-72 h-72 mx-auto">
                {/* Фоновый градиент */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-100 to-primary-50 dark:from-primary-900/20 dark:to-primary-800/10 rounded-full blur-lg opacity-70"></div>
                
                {/* Основной круг */}
                <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-full shadow-lg"></div>
                
                {/* Прогресс */}
                <div className="absolute inset-0">
                  <svg width="100%" height="100%" viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke={mode === 'work' ? 'var(--primary-color)' : 'var(--success-color)'}
                      strokeWidth="4"
                      strokeDasharray="264"
                      strokeDashoffset={progressStyle.strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-500 ease-linear"
                    />
                  </svg>
                </div>
                
                {/* Внутренний круг с информацией */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    {mode === 'work' ? t('pomodoro.work') : t('pomodoro.rest')}
                  </div>
                  <div className="text-5xl font-bold text-gray-800 dark:text-white mb-2">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-sm text-primary dark:text-primary-300">
                    {t('pomodoro.cycle')}: {cycle}
                  </div>
                </div>
              </div>
              
              {/* Кнопки управления */}
              <div className="flex justify-center mt-8 mb-12 space-x-4">
                {!isActive ? (
                  <button
                    onClick={startTimer}
                    className="px-8 py-3 bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    {t('pomodoro.start')}
                  </button>
                ) : (
                  <button
                    onClick={pauseTimer}
                    className="px-8 py-3 bg-gradient-to-r from-error to-error-dark hover:from-error-dark hover:to-error text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {t('pomodoro.pause')}
                  </button>
                )}
                
                <button
                  onClick={resetTimer}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              {/* Настройки */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-24">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  {t('pomodoro.settings')}
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('pomodoro.workDuration')} ({t('pomodoro.minutes')})
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={settings.workTime}
                      onChange={(e) => updateSettings('workTime', parseInt(e.target.value))}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-center focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('pomodoro.restDuration')} ({t('pomodoro.minutes')})
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={settings.restTime}
                      onChange={(e) => updateSettings('restTime', parseInt(e.target.value))}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-center focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        <NavBar />
      </div>
    </div>
  );
}

export default function Pomodoro() {
  return (
    <ProtectedRoute>
      <PomodoroApp />
    </ProtectedRoute>
  );
} 