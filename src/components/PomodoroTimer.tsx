import React, { useState, useEffect, useRef } from 'react';

interface PomodoroTimerProps {
  // Пропсы не требуются, так как таймер самостоятелен
}

type TimerMode = 'work' | 'rest';

export default function PomodoroTimer({}: PomodoroTimerProps) {
  // Настройки таймера по умолчанию (в минутах)
  const [workDuration, setWorkDuration] = useState(25);
  const [restDuration, setRestDuration] = useState(5);
  
  // Состояние таймера
  const [mode, setMode] = useState<TimerMode>('work');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(workDuration * 60); // в секундах
  const [cycles, setCycles] = useState(0);
  
  // Ссылки на аудио элементы для сигналов
  const workCompleteSound = useRef<HTMLAudioElement | null>(null);
  const restCompleteSound = useRef<HTMLAudioElement | null>(null);
  
  // Инициализация аудио при монтировании компонента
  useEffect(() => {
    if (typeof window !== 'undefined') {
      workCompleteSound.current = new Audio('/sounds/work-complete.mp3');
      restCompleteSound.current = new Audio('/sounds/rest-complete.mp3');
      
      // Заменяем на базовые звуки, если файлы не найдены
      workCompleteSound.current.onerror = () => {
        console.warn('Work complete sound not found, using default');
        if (workCompleteSound.current) {
          workCompleteSound.current = createBeepSound(800);
        }
      };
      
      restCompleteSound.current.onerror = () => {
        console.warn('Rest complete sound not found, using default');
        if (restCompleteSound.current) {
          restCompleteSound.current = createBeepSound(600);
        }
      };
    }
    
    // Очистка ресурсов при размонтировании
    return () => {
      workCompleteSound.current = null;
      restCompleteSound.current = null;
    };
  }, []);
  
  // Создание простого звукового сигнала, если файлы не найдены
  const createBeepSound = (frequency: number): HTMLAudioElement => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      
      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
      
      // Создаем фиктивный аудио элемент для совместимости с API
      return new Audio();
    } catch (e) {
      console.error('Failed to create beep sound:', e);
      return new Audio();
    }
  };
  
  // Обновление состояния таймера при запуске/остановке
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Переключение между режимами работы и отдыха
      handleTimerComplete();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);
  
  // Обработка окончания таймера и переход к следующему режиму
  const handleTimerComplete = () => {
    if (mode === 'work') {
      // Работа завершена, переход к отдыху
      if (workCompleteSound.current) {
        workCompleteSound.current.play().catch(e => console.error('Failed to play work complete sound:', e));
      }
      setMode('rest');
      setTimeLeft(restDuration * 60);
      // Увеличиваем счетчик циклов только после завершения работы
      setCycles(cycles + 1);
    } else {
      // Отдых завершен, переход к работе
      if (restCompleteSound.current) {
        restCompleteSound.current.play().catch(e => console.error('Failed to play rest complete sound:', e));
      }
      setMode('work');
      setTimeLeft(workDuration * 60);
    }
    
    // Показываем уведомление
    showNotification();
  };
  
  // Показ браузерного уведомления при поддержке
  const showNotification = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(mode === 'work' ? 'Время отдохнуть!' : 'Время работать!', {
          body: mode === 'work' 
            ? `Вы завершили ${cycles + 1}-й рабочий период. Отдохните ${restDuration} минут.` 
            : `Отдых завершен. Начните новый ${workDuration}-минутный рабочий период.`,
          icon: '/icons/pomodoro-icon.png'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  };
  
  // Форматирование времени в формат MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Управление таймером
  const startTimer = () => {
    setIsRunning(true);
  };
  
  const pauseTimer = () => {
    setIsRunning(false);
  };
  
  const resetTimer = () => {
    setIsRunning(false);
    setMode('work');
    setTimeLeft(workDuration * 60);
    setCycles(0);
  };
  
  // Обработка изменения настроек
  const handleWorkDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setWorkDuration(value);
      if (mode === 'work' && !isRunning) {
        setTimeLeft(value * 60);
      }
    }
  };
  
  const handleRestDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setRestDuration(value);
      if (mode === 'rest' && !isRunning) {
        setTimeLeft(value * 60);
      }
    }
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
      
      <div className="pomodoro-buttons">
        {!isRunning ? (
          <button 
            className="pomodoro-button start"
            onClick={startTimer}
          >
            <span>▶</span> Старт
          </button>
        ) : (
          <button 
            className="pomodoro-button stop"
            onClick={pauseTimer}
          >
            <span>⏸</span> Пауза
          </button>
        )}
        
        <button 
          className="pomodoro-button reset"
          onClick={resetTimer}
        >
          <span>↺</span> Сброс
        </button>
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