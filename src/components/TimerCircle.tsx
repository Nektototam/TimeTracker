import React, { useEffect, useState, useRef } from 'react';
import { useTimer } from '../contexts/TimerContext';
import { useTranslation } from 'react-i18next';

interface TimerCircleProps {
  isRunning: boolean;
  startTime: number;
  elapsedTime: number;
  status: string;
  timeValue: string;
  project: string;
}

export default function TimerCircle({
  isRunning,
  startTime,
  elapsedTime,
  status,
  timeValue,
  project,
}: TimerCircleProps) {
  const { timeLimit, formatTime } = useTimer();
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const circleRef = useRef<SVGCircleElement>(null);
  
  // Размеры SVG и круга
  const size = 280;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  useEffect(() => {
    // Обновляем прогресс
    const maxTime = timeLimit || 3600000; // 1 час по умолчанию
    const currentProgress = timeLimit 
      ? Math.min(elapsedTime / maxTime, 1) 
      : (elapsedTime % 3600000) / 3600000;
    
    setProgress(currentProgress);
    
    // Создаем интервал для обновления прогресса, если таймер запущен
    if (isRunning) {
      const interval = setInterval(() => {
        const updatedElapsedTime = elapsedTime + (Date.now() - startTime);
        const updatedProgress = timeLimit 
          ? Math.min(updatedElapsedTime / maxTime, 1) 
          : (updatedElapsedTime % 3600000) / 3600000;
        
        setProgress(updatedProgress);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isRunning, elapsedTime, startTime, timeLimit]);
  
  // Рассчитываем смещение круга для прогресса
  const strokeDashoffset = circumference - (progress * circumference);
  
  // Форматируем отображение времени ограничения
  const getTimeLimitDisplay = () => {
    if (!timeLimit) return null;
    
    const remainingTime = Math.max(0, timeLimit - elapsedTime);
    return (
      <div className="text-xs text-gray-500 mt-1.5">
        {t('timer.limitValue')} {formatTime(remainingTime)}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center my-8 mb-10 relative">
      {/* Основная обводка */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-primary-300/20 to-primary-100/10 rounded-full blur-xl"></div>
      
      <div className="relative w-[280px] h-[280px] md:w-[280px] md:h-[280px]">
        {/* Фоновый круг */}
        <svg 
          className="w-full h-full -rotate-90 transform drop-shadow-lg"
          viewBox={`0 0 ${size} ${size}`}
          style={{ filter: "drop-shadow(0px 8px 16px rgba(113, 99, 222, 0.25))" }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#F0F0F7"
            strokeWidth={strokeWidth}
            className="opacity-50"
          />
          
          {/* Прогресс круг */}
          <circle
            ref={circleRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="url(#timer-gradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-in-out"
          />
          
          {/* Градиент для прогресса */}
          <defs>
            <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#BEB4FF" />
              <stop offset="60%" stopColor="#9285F4" />
              <stop offset="100%" stopColor="#7163DE" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Внутренний круг с контентом */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full w-[220px] h-[220px] flex flex-col items-center justify-center shadow-lg">
          <div className="text-xs uppercase font-semibold text-gray-500 mb-1.5 tracking-wider">
            {status}
          </div>
          <div className="text-4xl font-bold text-gray-800 mb-2">
            {timeValue}
          </div>
          <div className="text-sm font-medium text-primary" data-testid="project-name">
            {project || t('timer.notSelected')}
          </div>
          {getTimeLimitDisplay()}
          
          {/* Пульсирующий индикатор активности */}
          {isRunning && (
            <div className="absolute -bottom-1 w-3 h-3 rounded-full bg-primary">
              <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 