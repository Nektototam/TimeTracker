import React, { useEffect, useState } from 'react';

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
  const [progressRotation, setProgressRotation] = useState(0);
  const [rightVisible, setRightVisible] = useState(false);
  const [rightRotation, setRightRotation] = useState('0deg');

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
    // Для демонстрации прогресса используем 1 час как полный круг
    const oneHour = 60 * 60 * 1000;
    const progress = (elapsedTime % oneHour) / oneHour; // От 0 до 1
    
    if (progress <= 0.5) {
      setProgressRotation(progress * 360);
      setRightVisible(false);
    } else {
      setProgressRotation(180);
      setRightVisible(true);
      setRightRotation(`${(progress - 0.5) * 360}deg`);
    }
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
          <div className="timer-circle-project">{project}</div>
        </div>
      </div>
    </div>
  );
} 