import React from 'react';

interface TimerButtonProps {
  isRunning: boolean;
  onClick: () => void;
  onFinish?: () => void;
}

export default function TimerButton({ isRunning, onClick, onFinish }: TimerButtonProps) {
  return (
    <div className="timer-buttons-container flex gap-4 justify-center mt-4">
      <button 
        className="timer-button"
        onClick={onClick}
      >
        <span>{isRunning ? '⏸' : '▶'}</span>
        <span>{isRunning ? 'Пауза' : 'Старт'}</span>
      </button>
      
      {isRunning && onFinish && (
        <button 
          className="timer-button finish-button bg-red-500 hover:bg-red-600"
          onClick={onFinish}
        >
          <span>✓</span>
          <span>Завершить</span>
        </button>
      )}
    </div>
  );
} 