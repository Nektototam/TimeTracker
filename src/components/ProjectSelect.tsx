import React, { useState, useEffect, useMemo } from 'react';
import { useCustomProjectTypes } from '../hooks/useCustomProjectTypes';
import { useAuth } from '../contexts/AuthContext';
import { useTimer } from '../contexts/TimerContext';
import { useTranslation } from 'react-i18next';

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
  
  // Стандартные типы работ
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
  
  // Преобразуем пользовательские типы в формат для селекта
  const customOptions: ProjectOption[] = projectTypes.map(type => ({
    value: type.id as string,
    label: type.name
  }));
  
  // Создаем полный список опций
  const allOptions = useMemo(() => [
    ...standardProjectOptions.slice(0, -1), // Исключаем последний пункт "Добавить новый тип"
    ...customOptions,
    standardProjectOptions[standardProjectOptions.length - 1] // Добавляем "Добавить новый тип" в конец
  ], [standardProjectOptions, customOptions]);

  // Проверка наличия выбранного типа в списке
  useEffect(() => {
    if (!isLoading && value !== 'new' && !allOptions.some(option => option.value === value)) {
      onChange('development');
    }
  }, [isLoading, value, allOptions, onChange]);

  // Обработчик изменения типа проекта
  const handleProjectChange = async (selectedValue: string) => {
    if (selectedValue === 'new') {
      setIsAddingNewType(true);
      return;
    }
    
    setIsAddingNewType(false);
    
    // Находим выбранную опцию для получения текста
    const selectedOption = allOptions.find(opt => opt.value === selectedValue);
    if (selectedOption) {
      // Обновляем значение и переключаемся на выбранный проект
      onChange(selectedValue);
      switchProject(selectedValue, selectedOption.label);
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
      setTimeLimit(limitMs);
    } else {
      // Если выбрано 0ч и 0мин, показываем предупреждение
      alert('Пожалуйста, установите ограничение времени больше 0 или отмените выбор');
      return;
    }
    
    setIsEditingTimeLimit(false);
  };
  
  const handleTimeLimitCancel = () => {
    setIsEditingTimeLimit(false);
  };
  
  const clearTimeLimit = () => {
    setTimeLimit(null);
  };
  
  // Часы с шагом 1
  const hourOptions = [];
  for (let i = 0; i <= 24; i += 1) {
    hourOptions.push(i);
  }

  // Форматирование времени ограничения для отображения
  const formatTimeLimit = () => {
    if (!timeLimit) return null;
    
    const hours = Math.floor(timeLimit / 3600000);
    const minutes = Math.floor((timeLimit % 3600000) / 60000);
    
    if (minutes === 0) {
      return `${hours}ч`;
    }
    
    return `${hours}ч ${minutes}м`;
  };

  return (
    <div className="project-select">
      {/* Текущая активная задача */}
      <div className="task-info">
        <div className="task-label">{t('timer.currentTask')}:</div>
        <div className="task-name">{projectText || t('timer.notSelected')}</div>
      </div>
      
      <div className="project-select-header">
        <div className="project-select-label">
          {t('timer.workType')}:
        </div>
        {timeLimit !== null ? (
          <div className="project-limit-badge">
            <span>{t('timer.limitValue')} {formatTimeLimit()}</span>
            <button 
              onClick={showTimeLimitEditor}
              className="project-limit-action"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 3.99998H6.8C5.11984 3.99998 4.27976 3.99998 3.63803 4.32696C3.07354 4.61458 2.6146 5.07353 2.32698 5.63801C2 6.27975 2 7.11983 2 8.79998V17.2C2 18.8801 2 19.7202 2.32698 20.3619C2.6146 20.9264 3.07354 21.3854 3.63803 21.673C4.27976 22 5.11984 22 6.8 22H15.2C16.8802 22 17.7202 22 18.362 21.673C18.9265 21.3854 19.3854 20.9264 19.673 20.3619C20 19.7202 20 18.8801 20 17.2V13M7.99997 16H9.67452C10.1637 16 10.4083 16 10.6385 15.9447C10.8425 15.8957 11.0376 15.8149 11.2166 15.7053C11.4184 15.5816 11.5914 15.4086 11.9373 15.0627L21.5 5.49998C22.3284 4.67156 22.3284 3.32841 21.5 2.49998C20.6716 1.67156 19.3284 1.67156 18.5 2.49998L8.93723 12.0627C8.59133 12.4086 8.41838 12.5816 8.29469 12.7834C8.18504 12.9624 8.10423 13.1574 8.05523 13.3615C7.99997 13.5916 7.99997 13.8362 7.99997 14.3254V16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              onClick={clearTimeLimit}
              className="project-limit-action"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        ) : (
          <button 
            onClick={showTimeLimitEditor}
            className="project-limit-badge"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12L15 15M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{t('timer.addLimitation')}</span>
          </button>
        )}
      </div>
      
      {isAddingNewType ? (
        <form onSubmit={handleNewTypeSubmit} className="new-project-form">
          <input
            type="text"
            value={newTypeValue}
            onChange={handleNewTypeChange}
            className="new-project-input"
            placeholder={t('timer.timeLimit.enterValue')}
            autoFocus
          />
          <div className="new-project-buttons">
            <button 
              type="button"
              onClick={handleCancelNewType}
              className="cancel-button"
            >
              {t('cancel')}
            </button>
            <button 
              type="submit"
              className="save-button"
            >
              {t('save')}
            </button>
          </div>
        </form>
      ) : isEditingTimeLimit ? (
        <div className="time-limit-form">
          <div className="time-limit-title">{t('timer.timeLimit.setLimit')}</div>
          <div className="time-limit-inputs">
            <div className="time-input-group">
              <label className="time-input-label">{t('timer.hours')}</label>
              <select
                value={timeLimitHours}
                onChange={(e) => setTimeLimitHours(parseInt(e.target.value))}
                className="time-input"
              >
                {hourOptions.map(hour => (
                  <option key={hour} value={hour}>{hour}</option>
                ))}
              </select>
            </div>
            <div className="time-input-group">
              <label className="time-input-label">{t('timer.minutes')}</label>
              <select
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(parseInt(e.target.value))}
                className="time-input"
              >
                {[0, 15, 30, 45].map(minute => (
                  <option key={minute} value={minute}>{minute}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="time-limit-buttons">
            <button
              onClick={handleTimeLimitCancel}
              className="cancel-button"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleTimeLimitSave}
              className="save-button"
            >
              {t('save')}
            </button>
          </div>
        </div>
      ) : (
        <div className="project-select-dropdown">
          <select
            className="custom-select"
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
        </div>
      )}
    </div>
  );
} 