"use client";

import React, { useState, useEffect, useRef } from 'react';
import NavBar from '../components/NavBar';
import ProjectSelect from '../components/ProjectSelect';
import TimerCircle from '../components/TimerCircle';
import TimerButton from '../components/TimerButton';
import { useTimeEntries } from '../hooks/useTimeEntries';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

function TimerApp() {
  const { user } = useAuth();
  const userId = user?.id || '';
  
  const [project, setProject] = useState('development');
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerStatus, setTimerStatus] = useState('Готов');
  const [timerValue, setTimerValue] = useState('00:00:00');
  const [projectText, setProjectText] = useState('Веб-разработка');
  const [dailyTotal, setDailyTotal] = useState('00:00:00');
  const [lastHourMark, setLastHourMark] = useState(0);
  
  // Ref для аудио элементов
  const workCompleteAudioRef = useRef<HTMLAudioElement | null>(null);
  const bigBenAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Используем хук для работы с записями времени
  const { entries, isLoading, error, addTimeEntry, getTodayEntries } = useTimeEntries();
  
  // Инициализация аудио элементов
  useEffect(() => {
    workCompleteAudioRef.current = new Audio('/sounds/work-complete.mp3');
    bigBenAudioRef.current = new Audio('/sounds/big-ben-chime.mp3');
  }, []);
  
  // Загрузка суммарного времени за день при монтировании компонента
  useEffect(() => {
    async function loadDailyTotal() {
      try {
        const todayEntries = await getTodayEntries();
        
        // Считаем общую длительность
        const totalMilliseconds = todayEntries.reduce(
          (total, entry) => total + entry.duration, 
          0
        );
        
        setDailyTotal(formatTime(totalMilliseconds));
      } catch (err) {
        console.error('Ошибка при загрузке суммарного времени за день:', err);
      }
    }
    
    loadDailyTotal();
  }, [getTodayEntries]);
  
  // Обработчик изменения проекта
  const handleProjectChange = (value: string) => {
    setProject(value);
    
    // Обновляем текстовое представление проекта
    if (value.startsWith('custom-')) {
      // Для пользовательских типов достаем timestamp из id и преобразуем в читаемый текст
      const timestamp = value.split('custom-')[1];
      try {
        const date = new Date(parseInt(timestamp));
        // Если дата корректна, используем метку времени как дополнительную информацию
        if (!isNaN(date.getTime())) {
          // Найдем соответствующий пользовательский тип в списке options компонента ProjectSelect
          // Но так как у нас нет прямого доступа к нему, используем временное решение:
          // Будем хранить названия пользовательских типов в localStorage
          const customTypesStr = localStorage.getItem('timetracker-custom-types');
          if (customTypesStr) {
            try {
              const customTypes = JSON.parse(customTypesStr);
              const customType = customTypes.find((t: any) => t.value === value);
              if (customType) {
                setProjectText(customType.label);
                return;
              }
            } catch (e) {
              console.error('Error parsing custom types from localStorage:', e);
            }
          }
        }
      } catch (e) {
        console.error('Error parsing timestamp from custom id:', e);
      }
      
      // Если не смогли найти в localStorage, просто используем встроенное значение
      setProjectText('Пользовательский тип');
      return;
    }
    
    // Для стандартных типов используем предопределенные значения
    switch(value) {
      case 'development': setProjectText('Веб-разработка'); break;
      case 'design': setProjectText('Дизайн'); break;
      case 'marketing': setProjectText('Маркетинг'); break;
      case 'meeting': setProjectText('Совещание'); break;
      case 'other': setProjectText('Другое'); break;
      default: setProjectText('Неизвестный тип');
    }
  };
  
  // Форматирование времени
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };
  
  // Воспроизведение звука Биг Бен
  const playBigBenSound = () => {
    if (bigBenAudioRef.current) {
      bigBenAudioRef.current.currentTime = 0;
      bigBenAudioRef.current.play().catch(err => {
        console.error('Ошибка воспроизведения звука Биг Бен:', err);
      });
    }
  };
  
  // Обновление таймера
  const updateTimer = () => {
    const currentTime = Date.now();
    const newElapsedTime = currentTime - startTime;
    setElapsedTime(newElapsedTime);
    setTimerValue(formatTime(newElapsedTime));
    
    // Проверяем, прошел ли час с момента старта или последнего часового сигнала
    const hourInMs = 3600000; // 1 час в миллисекундах
    const elapsedTimeInHours = Math.floor(newElapsedTime / hourInMs);
    const lastHourMarkInHours = Math.floor(lastHourMark / hourInMs);
    
    if (elapsedTimeInHours > lastHourMarkInHours) {
      // Прошел час, воспроизводим звук Биг Бен
      playBigBenSound();
      setLastHourMark(elapsedTimeInHours * hourInMs);
    }
  };
  
  // Запуск и остановка таймера
  const toggleTimer = async () => {
    if (isRunning) {
      // Остановка таймера
      setIsRunning(false);
      setTimerStatus('Приостановлен');
      
      // Сохраняем запись в БД
      const now = new Date();
      const entryData = {
        user_id: userId,
        project_type: project,
        start_time: new Date(startTime),
        end_time: now,
        duration: elapsedTime
      };
      
      try {
        await addTimeEntry(entryData);
        
        // Воспроизводим звук завершения работы
        if (workCompleteAudioRef.current) {
          workCompleteAudioRef.current.currentTime = 0;
          workCompleteAudioRef.current.play().catch(err => {
            console.error('Ошибка воспроизведения звука завершения работы:', err);
          });
        }
        
        // Обновляем суммарное время за день
        const todayEntries = await getTodayEntries();
        const totalMilliseconds = todayEntries.reduce(
          (total, entry) => total + entry.duration, 
          0
        );
        setDailyTotal(formatTime(totalMilliseconds));
      } catch (err) {
        console.error('Ошибка при сохранении записи:', err);
      }
    } else {
      // Запуск таймера
      const now = Date.now();
      if (elapsedTime === 0) {
        setStartTime(now);
        setLastHourMark(0); // Сбрасываем метку последнего часа
      } else {
        setStartTime(now - elapsedTime);
        // Сохраняем последнюю отметку часа
      }
      
      setIsRunning(true);
      setTimerStatus('Идет отсчет');
    }
  };
  
  // Обновление таймера при запуске
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(updateTimer, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime]);
  
  return (
    <div className="app-container">
      <div className="screen">
        <h1 className="text-center text-[#32325d] font-bold text-2xl mb-4">TimeTracker</h1>
        
        <ProjectSelect value={project} onChange={handleProjectChange} />
        
        <TimerCircle
          isRunning={isRunning}
          startTime={startTime}
          elapsedTime={elapsedTime}
          status={timerStatus}
          timeValue={timerValue}
          project={projectText}
        />
        
        <TimerButton isRunning={isRunning} onClick={toggleTimer} />
        
        <div className="daily-total">
          <div className="daily-total-label">Сегодня отработано</div>
          <div className="daily-total-value">{dailyTotal}</div>
        </div>
        
        <NavBar />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <TimerApp />
    </ProtectedRoute>
  );
}
