import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectSelect from '../ProjectSelect';

// Мокирование react-i18next уже сделано в jest.setup.js

describe('ProjectSelect', () => {
  // Тест 1: Проверка базового рендеринга
  test('renders select box with default options', () => {
    const mockOnChange = jest.fn();
    
    render(
      <ProjectSelect 
        value="development" 
        onChange={mockOnChange} 
      />
    );
    
    // Проверяем, что селект отрендерился
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
    
    // Проверяем, что значение по умолчанию установлено
    expect(selectElement).toHaveValue('development');
  });
  
  // Тест 2: Проверка изменения значения
  test('calls onChange when value changes', () => {
    const mockOnChange = jest.fn();
    
    render(
      <ProjectSelect 
        value="development" 
        onChange={mockOnChange} 
      />
    );
    
    const selectElement = screen.getByRole('combobox');
    
    // Устанавливаем новое значение
    fireEvent.change(selectElement, { target: { value: 'design' } });
    
    // Проверяем, что обработчик был вызван с правильным значением
    expect(mockOnChange).toHaveBeenCalledWith('design');
  });
  
  // Тест 3: Проверка доступности всех опций
  test('displays all project options', () => {
    const mockOnChange = jest.fn();
    
    render(
      <ProjectSelect 
        value="development" 
        onChange={mockOnChange} 
      />
    );
    
    // Открываем выпадающий список
    const selectElement = screen.getByRole('combobox');
    fireEvent.click(selectElement);
    
    // Проверяем наличие основных опций (переведенные ключи)
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(1); // Должно быть несколько вариантов
    
    // Проверяем, что опция "development" существует и выбрана
    const developmentOption = screen.getByRole('option', { name: /development/i });
    expect(developmentOption).toBeInTheDocument();
    expect(developmentOption).toHaveAttribute('selected');
  });
  
  // Тест 4: Проверка доступности компонента
  test('select has proper accessibility attributes', () => {
    const mockOnChange = jest.fn();
    
    render(
      <ProjectSelect 
        value="development" 
        onChange={mockOnChange} 
      />
    );
    
    const selectElement = screen.getByRole('combobox');
    
    // Проверяем атрибуты доступности
    expect(selectElement).toHaveAttribute('id', 'project-select');
    expect(screen.getByText(/timer.selectProject/i)).toBeInTheDocument();
  });
  
  // Тест 5: Проверка работы без значения по умолчанию
  test('works correctly without default value', () => {
    const mockOnChange = jest.fn();
    
    render(
      <ProjectSelect 
        value="" 
        onChange={mockOnChange} 
      />
    );
    
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toHaveValue('');
  });
});