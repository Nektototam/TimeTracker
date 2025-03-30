import React, { useState, useEffect } from 'react';
import { useCustomProjectTypes } from '../hooks/useCustomProjectTypes';
import { useAuth } from '../contexts/AuthContext';
import { useTimer } from '../contexts/TimerContext';

interface ProjectOption {
  value: string;
  label: string;
}

interface ProjectSelectProps {
  value: string;
  onChange: (value: string) => void;
}

// Стандартные типы работ
const standardProjectOptions: ProjectOption[] = [
  { value: 'development', label: 'Веб-разработка' },
  { value: 'design', label: 'Дизайн' },
  { value: 'marketing', label: 'Маркетинг' },
  { value: 'meeting', label: 'Совещание' },
  { value: 'other', label: 'Другое' },
  { value: 'new', label: '+ Добавить новый тип' },
];

export default function ProjectSelect({ value, onChange }: ProjectSelectProps) {
  const { user } = useAuth();
  const { projectTypes, isLoading, addProjectType } = useCustomProjectTypes(user?.id);
  const { switchProject, setTimeLimit, timeLimit, setProjectText, projectText } = useTimer();
  
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
  const allOptions = [
    ...standardProjectOptions.slice(0, -1), // Исключаем последний пункт "Добавить новый тип"
    ...customOptions,
    standardProjectOptions[standardProjectOptions.length - 1] // Добавляем "Добавить новый тип" в конец
  ];

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
        <div className="text-sm text-gray-500">Текущая задача:</div>
        <div className="text-lg font-semibold">{projectText || 'Не выбрано'}</div>
      </div>
      
      <div className="flex justify-between items-center mb-2">
        <label className="select-label">
          Тип работы:
        </label>
        {timeLimit !== null ? (
          <div className="flex items-center">
            <span className="time-limit-badge text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md mr-2">
              Ограничение: {Math.floor(timeLimit / 3600000)}ч {Math.floor((timeLimit % 3600000) / 60000)}м
            </span>
            <button 
              onClick={showTimeLimitEditor}
              className="text-xs text-blue-600 mr-1"
            >
              📝
            </button>
            <button 
              onClick={clearTimeLimit}
              className="text-xs text-red-600"
            >
              ❌
            </button>
          </div>
        ) : (
          <button 
            onClick={showTimeLimitEditor}
            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md"
          >
            + Ограничение
          </button>
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
              placeholder="Введите название нового типа"
              autoFocus
            />
            <button 
              type="submit" 
              className="bg-primary text-white py-2 px-3 rounded-[10px] hover:bg-primary-dark transition-colors"
            >
              ✓
            </button>
            <button 
              type="button" 
              onClick={handleCancelNewType}
              className="bg-[#f8f9fe] text-secondary py-2 px-3 rounded-[10px] hover:bg-[#eceef7] transition-colors"
            >
              ✕
            </button>
          </div>
        </form>
      ) : isEditingTimeLimit ? (
        <div className="time-limit-form p-3 bg-white rounded-lg shadow-md">
          <div className="mb-2 font-medium text-gray-700 text-sm">Установите ограничение времени:</div>
          <div className="flex flex-row gap-2 mb-3 justify-center">
            <div className="w-24">
              <label className="block text-xs text-gray-600 mb-1">Часы</label>
              <select
                value={timeLimitHours}
                onChange={(e) => setTimeLimitHours(parseFloat(e.target.value))}
                className="select-input w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm"
              >
                {hourOptions.map(hour => (
                  <option key={hour} value={hour}>
                    {hour % 1 === 0 ? hour : hour.toFixed(1)} ч
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-24">
              <label className="block text-xs text-gray-600 mb-1">Минуты</label>
              <select
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(parseInt(e.target.value))}
                className="select-input w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm"
              >
                {[0, 15, 30, 45].map(min => (
                  <option key={min} value={min}>
                    {min} мин
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={handleTimeLimitSave}
              className="bg-primary text-white py-1 px-3 rounded-md hover:bg-primary-dark transition-colors text-sm"
            >
              Сохранить
            </button>
            <button
              type="button" 
              onClick={handleTimeLimitCancel}
              className="bg-gray-100 text-gray-700 py-1 px-3 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <select
          className="select-input w-full"
          value={value}
          onChange={handleChange}
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