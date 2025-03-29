import React from 'react';

interface TimerButtonProps {
  isRunning: boolean;
  onClick: () => void;
}

export default function TimerButton({ isRunning, onClick }: TimerButtonProps) {
  return (
    <button 
      className="timer-button"
      onClick={onClick}
    >
      <span>{isRunning ? '⏸' : '▶'}</span>
      <span>{isRunning ? 'Пауза' : 'Старт'}</span>
    </button>
  );
} 