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
  
  const modeAccent = mode === 'work' ? 'text-primary' : 'text-emerald-600';
  const modeRing = mode === 'work' ? 'ring-primary/20' : 'ring-emerald-500/20';

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className={`relative flex h-64 w-64 items-center justify-center rounded-full border border-border bg-card shadow-sm ring-8 ${modeRing}`}>
        <div className="flex h-[85%] w-[85%] flex-col items-center justify-center rounded-full bg-background">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {mode === 'work' ? 'Работа' : 'Отдых'}
          </div>
          <div className={`text-4xl font-semibold ${modeAccent}`}>
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm text-muted-foreground">
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
      
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-5 text-lg font-semibold text-foreground">Настройки</h3>
        
        <div className="mb-4 flex items-center justify-between gap-4">
          <label className="text-sm font-medium text-muted-foreground">
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
        
        <div className="flex items-center justify-between gap-4">
          <label className="text-sm font-medium text-muted-foreground">
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