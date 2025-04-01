import React from 'react';
import { usePomodoro } from '../contexts/PomodoroContext';
import { Button } from './ui/Button';

interface PomodoroTimerProps {
  // Пропы не используются, контекст предоставляет все необходимое
}

export default function PomodoroTimer({}: PomodoroTimerProps) {
  // Используем хук контекста таймера Помидора
  const {
    workDuration,
    restDuration,
    mode,
    isRunning,
    timeLeft,
    cycles,
    setWorkDuration,
    setRestDuration,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime
  } = usePomodoro();
  
  // Обработка изменения настроек
  const handleWorkDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setWorkDuration(value);
  };
  
  const handleRestDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setRestDuration(value);
  };
  
  return (
    <div className="pomodoro-container">
      <div className={`pomodoro-timer ${mode}`}>
        <div className="pomodoro-timer-inner">
          <div className="pomodoro-status">
            {mode === 'work' ? 'Работа' : 'Отдых'}
          </div>
          <div className="pomodoro-time">
            {formatTime(timeLeft)}
          </div>
          <div className="pomodoro-cycles">
            Цикл: {cycles + 1}
          </div>
        </div>
      </div>
      
      <div className="flex gap-4 justify-center mt-4">
        {!isRunning ? (
          <Button 
            variant="timer"
            onClick={startTimer}
            className="px-8"
          >
            Старт
          </Button>
        ) : (
          <Button 
            variant="timerStop"
            size="lg"
            onClick={pauseTimer}
            className="px-8"
          >
            Пауза
          </Button>
        )}
        
        <Button 
          variant="secondary"
          size="lg"
          onClick={resetTimer}
          className="px-8"
        >
          Сброс
        </Button>
      </div>
      
      <div className="pomodoro-settings">
        <h3 className="pomodoro-settings-title">Настройки</h3>
        
        <div className="pomodoro-settings-row">
          <label className="pomodoro-settings-label">
            Длительность работы (мин)
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={workDuration}
            onChange={handleWorkDurationChange}
            className="pomodoro-settings-input"
            disabled={isRunning}
          />
        </div>
        
        <div className="pomodoro-settings-row">
          <label className="pomodoro-settings-label">
            Длительность отдыха (мин)
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={restDuration}
            onChange={handleRestDurationChange}
            className="pomodoro-settings-input"
            disabled={isRunning}
          />
        </div>
      </div>
    </div>
  );
} 