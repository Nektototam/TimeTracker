import React, { useEffect, useState } from 'react';
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
  const [progressRotation, setProgressRotation] = useState(0);
  const [rightVisible, setRightVisible] = useState(false);
  const [rightRotation, setRightRotation] = useState('0deg');
  const [pulseEffect, setPulseEffect] = useState(false);
  
  // Добавляем эффект пульсации при запуске таймера
  useEffect(() => {
    if (isRunning) {
      setPulseEffect(true);
      const timer = setTimeout(() => setPulseEffect(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isRunning]);
  
  useEffect(() => {
    // Выводим имя проекта при изменении
    console.log('TimerCircle: Имя проекта:', project);
  }, [project]);

  // Обновление кругового прогресса
  useEffect(() => {
    updateCircleProgress();
    
    if (isRunning) {
      const interval = setInterval(() => {
        updateCircleProgress();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning, elapsedTime]);

  const updateCircleProgress = () => {
    // Если есть временное ограничение, используем его как 100% прогресса
    const maxTime = timeLimit || 3600000; // 1 час по умолчанию
    const progress = timeLimit ? Math.min(elapsedTime / maxTime, 1) : (elapsedTime % 3600000) / 3600000;
    
    if (progress <= 0.5) {
      setProgressRotation(progress * 360);
      setRightVisible(false);
    } else {
      setProgressRotation(180);
      setRightVisible(true);
      setRightRotation(`${(progress - 0.5) * 360}deg`);
    }
  };

  // Форматируем отображение времени ограничения
  const getTimeLimitDisplay = () => {
    if (!timeLimit) return null;
    
    const remainingTime = Math.max(0, timeLimit - elapsedTime);
    const isAlmostFinished = remainingTime < timeLimit * 0.1; // Меньше 10% времени осталось
    
    return (
      <div className={`time-limit-info ${isAlmostFinished ? 'bg-red-100 text-red-600' : ''}`}>
        {t('timer.limitValue')} {formatTime(remainingTime)}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center my-6 mb-10">
      <div className={`timer-circle ${pulseEffect ? 'animate-pulse' : ''} ${isRunning ? 'scale-105' : ''}`}>
        {/* Фон круга */}
        <div className="timer-circle-bg"></div>
        
        {/* Круговой прогресс */}
        <div className="timer-circle-progress">
          <div 
            className="left-side"
            style={{ 
              transform: `rotate(${progressRotation}deg)`,
              transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          ></div>
          <div 
            className="right-side"
            style={{ 
              visibility: rightVisible ? 'visible' : 'hidden',
              transform: `rotate(${rightRotation})`,
              transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          ></div>
        </div>
        
        {/* Внутренний круг */}
        <div className={`timer-circle-inner ${isRunning ? 'ring-2 ring-primary-light ring-opacity-20' : ''}`}>
          <div className="timer-circle-status">{status}</div>
          <div className={`timer-circle-time ${isRunning ? 'text-primary-dark' : ''}`}>{timeValue}</div>
          <div className="timer-circle-project" data-testid="project-name">
            {project || t('timer.notSelected')}
          </div>
          {getTimeLimitDisplay()}
        </div>
      </div>
    </div>
  );
} 