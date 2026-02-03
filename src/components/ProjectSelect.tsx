import React, { useState, useEffect, useMemo } from 'react';
import { useCustomProjectTypes } from '../hooks/useCustomProjectTypes';
import { useAuth } from '../contexts/AuthContext';
import { useTimer } from '../contexts/TimerContext';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { TimeLimitForm } from './TimeLimitForm';

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
    <div className="w-full max-w-xl mx-auto rounded-xl border border-border bg-card p-5 shadow-app-sm">
      {/* Текущая активная задача - всегда показываем */}
      <div className="mb-6 rounded-lg border border-border bg-muted/40 p-4 text-center">
        <div className="mb-1 text-sm text-muted-foreground">{t('timer.currentTask')}:</div>
        <div className="text-lg font-semibold text-foreground">{projectText || t('timer.notSelected')}</div>
      </div>
      
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="text-base font-medium text-foreground">
          {t('timer.workType')}:
        </label>
        {timeLimit !== null ? (
          <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
            <span className="inline-flex items-center rounded-full border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground">
              {t('timer.limitValue')} {Math.floor(timeLimit / 3600000)}ч {Math.floor((timeLimit % 3600000) / 60000)}м
            </span>
            <div className="flex items-center gap-2">
              <Button 
                onClick={showTimeLimitEditor}
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full border border-border"
              >
                📝
              </Button>
              <Button 
                onClick={clearTimeLimit}
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full border border-border"
              >
                ❌
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            onClick={showTimeLimitEditor}
            variant="outline"
            size="sm"
            className="h-11"
          >
            {t('timer.addLimitation')}
          </Button>
        )}
      </div>
      
      {isAddingNewType ? (
        <form onSubmit={handleNewTypeSubmit} className="space-y-4">
          <div className="flex gap-3">
            <Input
              type="text"
              value={newTypeValue}
              onChange={handleNewTypeChange}
              className="flex-1"
              placeholder={t('timer.timeLimit.enterValue')}
              autoFocus
            />
            <div className="flex gap-2">
              <Button 
                type="submit"
                variant="primary"
                size="sm"
                className="h-11 w-11"
              >
                ✓
              </Button>
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelNewType}
                className="px-3 py-2 min-w-[44px] min-h-[44px] text-lg"
              >
                ✕
              </Button>
            </div>
          </div>
        </form>
      ) : isEditingTimeLimit ? (
        <TimeLimitForm 
          initialHours={timeLimitHours} 
          initialMinutes={timeLimitMinutes}
          onSave={(hours, minutes) => {
            const limitMs = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
            setTimeLimit(limitMs);
            setIsEditingTimeLimit(false);
          }}
          onCancel={handleTimeLimitCancel}
        />
      ) : (
        <Select
          className="w-full"
          value={value}
          onChange={handleChange}
          disabled={isLoading}
        >
          {allOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      )}
    </div>
  );
} 