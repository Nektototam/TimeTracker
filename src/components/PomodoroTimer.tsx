import React from 'react';
import { usePomodoro } from '../contexts/PomodoroContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

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
            variant="buttonStart"
            onClick={startTimer}
            leftIcon="▶"
            className="relative w-44"
          >
            Старт
          </Button>
        ) : (
          <Button 
            variant="timerStop"
            size="lg"
            onClick={pauseTimer}
            leftIcon="⏸"
          >
            Пауза
          </Button>
        )}
        
        <Button 
          variant="secondary"
          size="lg"
          onClick={resetTimer}
          leftIcon="↺"
        >
          Сброс
        </Button>
      </div>
      
      <div className="pomodoro-settings">
        <h3 className="pomodoro-settings-title text-lg font-medium mb-5 text-gray-700">Настройки</h3>
        
        <div className="pomodoro-settings-row flex items-center justify-between mb-4">
          <label className="pomodoro-settings-label text-sm text-gray-600">
            Длительность работы (мин)
          </label>
          <Input
            type="number"
            min="1"
            max="60"
            value={workDuration}
            onChange={handleWorkDurationChange}
            className="w-28 text-sm"
            fullWidth={false}
            disabled={isRunning}
          />
        </div>
        
        <div className="pomodoro-settings-row flex items-center justify-between mb-4">
          <label className="pomodoro-settings-label text-sm text-gray-600">
            Длительность отдыха (мин)
          </label>
          <Input
            type="number"
            min="1"
            max="30"
            value={restDuration}
            onChange={handleRestDurationChange}
            className="w-28 text-sm"
            fullWidth={false}
            disabled={isRunning}
          />
        </div>
      </div>
    </div>
  );
} 