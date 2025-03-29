import React, { useState, useEffect } from 'react';
import { useCustomProjectTypes } from '../hooks/useCustomProjectTypes';
import { useAuth } from '../contexts/AuthContext';

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
  
  const [isAddingNewType, setIsAddingNewType] = useState(false);
  const [newTypeValue, setNewTypeValue] = useState('');
  
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

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    
    if (selectedValue === 'new') {
      setIsAddingNewType(true);
      return;
    }
    
    setIsAddingNewType(false);
    onChange(selectedValue);
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
        // Выбираем новый тип
        onChange(newType.id);
      }
      
      setIsAddingNewType(false);
      setNewTypeValue('');
    } catch (error) {
      console.error('Ошибка при добавлении типа:', error);
    }
  };

  const handleCancelNewType = () => {
    setIsAddingNewType(false);
    onChange(value !== 'new' ? value : 'development');
    setNewTypeValue('');
  };

  return (
    <div className="select-container">
      <label className="select-label">
        Тип работы:
      </label>
      
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
      ) : (
        <select
          className="select-input"
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