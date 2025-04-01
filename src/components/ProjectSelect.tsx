import React, { useState, useEffect, useMemo } from 'react';
import { useCustomProjectTypes } from '../hooks/useCustomProjectTypes';
import { useAuth } from '../contexts/AuthContext';
import { useTimer } from '../contexts/TimerContext';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/Button';

interface ProjectOption {
  value: string;
  label: string;
}

interface ProjectSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ProjectSelect({ value, onChange }: ProjectSelectProps) {
  const { user } = useAuth();
  const { projectTypes, isLoading, addProjectType } = useCustomProjectTypes(user?.id);
  const { switchProject, setTimeLimit, timeLimit, setProjectText, projectText } = useTimer();
  const { t } = useTranslation();
  
  // Стандартные типы работ, мемоизируем для стабильности
  const standardProjectOptions = useMemo(() => [
    { value: 'development', label: t('timer.standard.development') },
    { value: 'design', label: t('timer.standard.design') },
    { value: 'marketing', label: t('timer.standard.marketing') },
    { value: 'meeting', label: t('timer.standard.meeting') },
    { value: 'other', label: t('timer.standard.other') },
    { value: 'new', label: t('timer.standard.new') },
  ], [t]);
  
  const [isAddingNewType, setIsAddingNewType] = useState(false);
  const [newTypeValue, setNewTypeValue] = useState('');
  const [isEditingTimeLimit, setIsEditingTimeLimit] = useState(false);
  const [timeLimitHours, setTimeLimitHours] = useState(8); // по умолчанию 8 часов
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(0); // 0 минут дополнительно
  
  // Преобразуем пользовательские типы из Supabase в формат для селекта
  const customOptions: ProjectOption[] = projectTypes.map(type => ({
    value: type.id as string,
    label: type.name
  }));
  
  // Создаем полный список опций, включая пользовательские типы
  const allOptions = useMemo(() => [
    ...standardProjectOptions.slice(0, -1), // Исключаем последний пункт "Добавить новый тип"
    ...customOptions,
    standardProjectOptions[standardProjectOptions.length - 1] // Добавляем "Добавить новый тип" в конец
  ], [standardProjectOptions, customOptions]);

  // Если выбранный тип отсутствует в списке опций, сбрасываем на development
  useEffect(() => {
    if (!isLoading && value !== 'new' && !allOptions.some(option => option.value === value)) {
      onChange('development');
    }
  }, [isLoading, value, allOptions, onChange]);

  // Обработчик изменения типа проекта
  const handleProjectChange = async (selectedValue: string) => {
    console.log('Выбран новый проект:', selectedValue);
    
    if (selectedValue === 'new') {
      setIsAddingNewType(true);
      return;
    }
    
    setIsAddingNewType(false);
    
    // Находим выбранную опцию для получения текста
    const selectedOption = allOptions.find(opt => opt.value === selectedValue);
    if (selectedOption) {
      console.log('Найдена опция проекта:', selectedOption.label);
      
      // Обновляем значение и сразу переключаемся на выбранный проект
      onChange(selectedValue);
      switchProject(selectedValue, selectedOption.label);
      console.log('Сразу переключились на проект:', selectedOption.label);
    } else {
      onChange(selectedValue);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    handleProjectChange(selectedValue);
  };

  const handleNewTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTypeValue(e.target.value);
  };

  const handleNewTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTypeValue.trim() || !user) return;
    
    try {
      const newType = await addProjectType(newTypeValue.trim(), user.id);
      
      if (newType && newType.id) {
        // Сразу переключаемся на новый тип
        onChange(newType.id);
        switchProject(newType.id, newType.name);
      }
      
      setIsAddingNewType(false);
      setNewTypeValue('');
    } catch (error) {
      console.error('Ошибка при добавлении типа:', error);
    }
  };

  const handleCancelNewType = () => {
    setIsAddingNewType(false);
    const newValue = value !== 'new' ? value : 'development';
    onChange(newValue);
    
    // Обновляем текст проекта
    const selectedOption = allOptions.find(opt => opt.value === newValue);
    if (selectedOption) {
      setProjectText(selectedOption.label);
    } else {
      setProjectText('Веб-разработка'); // значение по умолчанию
    }
    
    setNewTypeValue('');
  };
  
  // Показать диалог редактирования временного ограничения
  const showTimeLimitEditor = () => {
    setIsEditingTimeLimit(true);
    
    // Если уже есть ограничение, установим его значения
    if (timeLimit) {
      setTimeLimitHours(Math.floor(timeLimit / 3600000));
      setTimeLimitMinutes(Math.floor((timeLimit % 3600000) / 60000));
    }
  };
  
  const handleTimeLimitSave = () => {
    // Преобразуем часы и минуты в миллисекунды
    const limitMs = (timeLimitHours * 60 * 60 * 1000) + (timeLimitMinutes * 60 * 1000);
    
    // Устанавливаем лимит времени, если он больше 0
    if (limitMs > 0) {
      console.log('Установлено ограничение времени:', formatTime(limitMs));
      setTimeLimit(limitMs);
    } else {
      // Если выбрано 0ч и 0мин, показываем предупреждение
      alert('Пожалуйста, установите ограничение времени больше 0 или отмените выбор');
      return; // Прерываем выполнение функции
    }
    
    setIsEditingTimeLimit(false);
  };
  
  const handleTimeLimitCancel = () => {
    setIsEditingTimeLimit(false);
  };
  
  const clearTimeLimit = () => {
    setTimeLimit(null);
  };
  
  // Часы с шагом 0.5
  const hourOptions = [];
  for (let i = 0; i <= 24; i += 0.5) {
    hourOptions.push(i);
  }

  // Форматирование времени для отображения
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}ч ${minutes}мин`;
  };

  return (
    <div className="select-container">
      {/* Текущая активная задача - всегда показываем */}
      <div className="current-task mb-3 text-center">
        <div className="text-sm text-gray-500">{t('timer.currentTask')}:</div>
        <div className="text-lg font-semibold">{projectText || t('timer.notSelected')}</div>
      </div>
      
      <div className="flex justify-between items-center mb-2">
        <label className="select-label">
          {t('timer.workType')}:
        </label>
        {timeLimit !== null ? (
          <div className="flex items-center">
            <span className="time-limit-badge text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md mr-2">
              {t('timer.limitValue')} {Math.floor(timeLimit / 3600000)}ч {Math.floor((timeLimit % 3600000) / 60000)}м
            </span>
            <Button 
              onClick={showTimeLimitEditor}
              variant="ghost"
              size="icon"
              className="text-blue-600"
            >
              📝
            </Button>
            <Button 
              onClick={clearTimeLimit}
              variant="ghost"
              size="icon"
              className="text-red-600"
            >
              ❌
            </Button>
          </div>
        ) : (
          <Button 
            onClick={showTimeLimitEditor}
            variant="outline"
            size="sm"
            rounded="none"
            className="border border-gray-300 bg-white"
          >
            {t('timer.addLimitation')}
          </Button>
        )}
      </div>
      
      {isAddingNewType ? (
        <form onSubmit={handleNewTypeSubmit} className="new-type-form">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={newTypeValue}
              onChange={handleNewTypeChange}
              className="select-input flex-1"
              placeholder={t('timer.timeLimit.enterValue')}
              autoFocus
            />
            <Button 
              type="submit"
              variant="primary"
              size="sm"
              rounded="lg"
            >
              ✓
            </Button>
            <Button 
              type="button"
              variant="outline"
              size="sm"
              rounded="lg"
              onClick={handleCancelNewType}
            >
              ✕
            </Button>
          </div>
        </form>
      ) : isEditingTimeLimit ? (
        <div className="time-limit-form p-3 bg-white rounded-lg shadow-md">
          <div className="mb-2 font-medium text-gray-700 text-sm">{t('timer.timeLimit.setLimit')}</div>
          <div className="flex flex-row gap-2 mb-3 justify-center">
            <div className="w-24">
              <label className="block text-xs text-gray-600 mb-1">{t('timer.hours')}</label>
              <select
                value={timeLimitHours}
                onChange={(e) => setTimeLimitHours(parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              >
                {hourOptions.map(hour => (
                  <option key={hour} value={hour}>{hour}</option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label className="block text-xs text-gray-600 mb-1">{t('timer.minutes')}</label>
              <select
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              >
                {[0, 15, 30, 45].map(minute => (
                  <option key={minute} value={minute}>{minute}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={handleTimeLimitSave}
              size="sm"
            >
              {t('save')}
            </Button>
            <Button
              variant="outline"
              onClick={handleTimeLimitCancel}
              size="sm"
            >
              {t('cancel')}
            </Button>
          </div>
        </div>
      ) : (
        <select
          className="select-input w-full"
          value={value}
          onChange={handleChange}
          disabled={isLoading}
        >
          {allOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
} 