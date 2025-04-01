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
    return (
      <div className="time-limit-info text-xs text-gray-500 mt-1">
        {t('timer.limitValue')} {formatTime(remainingTime)}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center my-5 mb-10">
      <div className="timer-circle">
        {/* Фон круга */}
        <div className="timer-circle-bg"></div>
        
        {/* Круговой прогресс */}
        <div className="timer-circle-progress">
          <div 
            className="left-side"
            style={{ transform: `rotate(${progressRotation}deg)` }}
          ></div>
          <div 
            className="right-side"
            style={{ 
              visibility: rightVisible ? 'visible' : 'hidden',
              transform: `rotate(${rightRotation})`
            }}
          ></div>
        </div>
        
        {/* Внутренний круг */}
        <div className="timer-circle-inner">
          <div className="timer-circle-status">{status}</div>
          <div className="timer-circle-time">{timeValue}</div>
          <div className="timer-circle-project" data-testid="project-name">
            {project || t('timer.notSelected')}
          </div>
          {getTimeLimitDisplay()}
        </div>
      </div>
    </div>
  );
} 