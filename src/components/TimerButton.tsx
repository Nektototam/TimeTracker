import React from 'react';
import { useTranslation } from 'react-i18next';

interface TimerButtonProps {
  isRunning: boolean;
  onClick: () => void;
  onFinish?: () => void;
}

export default function TimerButton({ isRunning, onClick, onFinish }: TimerButtonProps) {
  const { t } = useTranslation();
  
  return (
    <div className="timer-buttons">
      <button 
        onClick={onClick}
        className={isRunning ? "timer-stop-button" : "timer-start-button"}
      >
        {isRunning ? t('timer.pause') : t('timer.start')}
      </button>
      
      {isRunning && onFinish && (
        <button 
          onClick={onFinish}
          className="timer-stop-button"
        >
          {t('timer.stop')}
        </button>
      )}
    </div>
  );
} 