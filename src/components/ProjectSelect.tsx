import React, { useState, useEffect } from 'react';

interface ProjectSelectProps {
  value: string;
  onChange: (value: string) => void;
}

interface ProjectOption {
  value: string;
  label: string;
}

const projectOptions: ProjectOption[] = [
  { value: 'development', label: 'Веб-разработка' },
  { value: 'design', label: 'Дизайн' },
  { value: 'marketing', label: 'Маркетинг' },
  { value: 'meeting', label: 'Совещание' },
  { value: 'other', label: 'Другое' },
  { value: 'new', label: '+ Добавить новый тип' },
];

// Ключ для хранения пользовательских типов в localStorage
const STORAGE_KEY = 'timetracker-custom-types';

export default function ProjectSelect({ value, onChange }: ProjectSelectProps) {
  const [isAddingNewType, setIsAddingNewType] = useState(false);
  const [newTypeValue, setNewTypeValue] = useState('');
  const [customTypes, setCustomTypes] = useState<ProjectOption[]>([]);
  
  // Загружаем сохраненные пользовательские типы при монтировании компонента
  useEffect(() => {
    const loadCustomTypes = () => {
      try {
        const savedTypesStr = localStorage.getItem(STORAGE_KEY);
        if (savedTypesStr) {
          const savedTypes = JSON.parse(savedTypesStr);
          if (Array.isArray(savedTypes)) {
            setCustomTypes(savedTypes);
          }
        }
      } catch (e) {
        console.error('Error loading custom types from localStorage:', e);
      }
    };
    
    loadCustomTypes();
  }, []);
  
  // Сохраняем пользовательские типы при их изменении
  useEffect(() => {
    if (customTypes.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customTypes));
      } catch (e) {
        console.error('Error saving custom types to localStorage:', e);
      }
    }
  }, [customTypes]);
  
  // Создаем полный список опций, включая пользовательские типы
  const allOptions = [
    ...projectOptions.slice(0, -1), // Исключаем последний пункт "Добавить новый тип"
    ...customTypes,
    projectOptions[projectOptions.length - 1] // Добавляем "Добавить новый тип" в конец
  ];

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

  const handleNewTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTypeValue.trim()) return;
    
    // Создаем новый тип с уникальным id и названием
    const newTypeId = `custom-${Date.now()}`;
    const newType: ProjectOption = {
      value: newTypeId,
      label: newTypeValue.trim()
    };
    
    // Добавляем новый тип в список кастомных типов
    setCustomTypes(prev => [...prev, newType]);
    
    // Выбираем новый тип
    onChange(newTypeId);
    setIsAddingNewType(false);
    setNewTypeValue('');
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