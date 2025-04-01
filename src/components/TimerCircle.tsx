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
      <div className="text-xs text-gray-500 mt-2">
        {t('timer.limitValue')} {formatTime(remainingTime)}
      </div>
    );
  };

  return (
    <div className="timer-container">
      {/* Фоновый эффект свечения */}
      <div className="timer-circle-outer"></div>
      
      <div className="timer-circle-bg">
        {/* Основное SVG с прогрессом */}
        <svg 
          className="w-full h-full" 
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Фоновый серый круг */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f0f0f7"
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
              <stop offset="50%" stopColor="#9285F4" />
              <stop offset="100%" stopColor="#7163DE" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Внутренний круг с контентом */}
      <div className="timer-inner-content">
        <div className="timer-status">
          {status}
        </div>
        <div className="timer-time">
          {timeValue}
        </div>
        <div className="timer-project" data-testid="project-name">
          {project || t('timer.notSelected')}
        </div>
        {getTimeLimitDisplay()}
        
        {/* Пульсирующий индикатор активности */}
        {isRunning && (
          <div className="timer-active-indicator"></div>
        )}
      </div>
    </div>
  );
} 