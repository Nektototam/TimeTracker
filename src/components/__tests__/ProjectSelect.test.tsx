import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectSelect from '../ProjectSelect';
import { TimerProvider } from '../../contexts/TimerContext';

// Мокирование react-i18next уже сделано в jest.setup.js

// Вспомогательная функция для оборачивания компонентов в необходимые провайдеры
const renderWithProviders = (ui) => {
  return render(
    <TimerProvider>
      {ui}
    </TimerProvider>
  );
};

describe('ProjectSelect', () => {
  // Тест 1: Проверка базового рендеринга
  test('renders select box with default options', async () => {
    const mockOnChange = jest.fn();
    
    await act(async () => {
      renderWithProviders(
        <ProjectSelect 
          value="development" 
          onChange={mockOnChange} 
        />
      );
    });
    
    // Проверяем, что селект отрендерился
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
    
    // Проверяем, что значение по умолчанию установлено
    expect(selectElement).toHaveValue('development');
  });
  
  // Тест 2: Проверка изменения значения
  test('calls onChange when value changes', async () => {
    const mockOnChange = jest.fn();
    
    await act(async () => {
      renderWithProviders(
        <ProjectSelect 
          value="development" 
          onChange={mockOnChange} 
        />
      );
    });
    
    const selectElement = screen.getByRole('combobox');
    
    // Устанавливаем новое значение
    await act(async () => {
      fireEvent.change(selectElement, { target: { value: 'design' } });
    });
    
    // Проверяем, что обработчик был вызван с правильным значением
    expect(mockOnChange).toHaveBeenCalledWith('design');
  });
  
  // Тест 3: Проверка доступности всех опций
  test('displays all project options', async () => {
    const mockOnChange = jest.fn();
    
    await act(async () => {
      renderWithProviders(
        <ProjectSelect 
          value="development" 
          onChange={mockOnChange} 
        />
      );
    });
    
    // Проверяем, что селект имеет правильное значение
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toHaveValue('development');
    
    // Проверяем наличие основных опций (переведенные ключи)
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(1); // Должно быть несколько вариантов
    
    // Проверяем, что опция "development" существует
    const developmentOption = screen.getByRole('option', { name: /development/i });
    expect(developmentOption).toBeInTheDocument();
  });
  
  // Тест 4: Проверка доступности компонента
  test('select has basic accessibility attributes', async () => {
    const mockOnChange = jest.fn();
    
    await act(async () => {
      renderWithProviders(
        <ProjectSelect 
          value="development" 
          onChange={mockOnChange} 
        />
      );
    });
    
    // Проверяем, что селект отображается и имеет роль combobox для доступности
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
  });
  
  // Тест 5: Проверка работы без значения по умолчанию
  test('handles invalid values gracefully', async () => {
    const mockOnChange = jest.fn();
    
    // Рендерим с невалидным значением
    await act(async () => {
      renderWithProviders(
        <ProjectSelect 
          value="invalid_value" 
          onChange={mockOnChange} 
        />
      );
    });
    
    // Компонент должен отрендериться без ошибок
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
    
    // Ждем, пока useEffect вызовет onChange для сброса на development
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('development');
    }, { timeout: 1000 });
  });
});