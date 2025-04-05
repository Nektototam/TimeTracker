import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimerButton from '../TimerButton';

// Мокирование react-i18next уже сделано в jest.setup.js

describe('TimerButton', () => {
  // Тест 1: Проверка корректного отображения в состоянии "готов к запуску"
  test('renders start button correctly when not running and not paused', () => {
    const mockOnClick = jest.fn();
    
    render(
      <TimerButton 
        isRunning={false} 
        isPaused={false} 
        onClick={mockOnClick}
      />
    );
    
    const startButton = screen.getByText('timer.start');
    expect(startButton).toBeInTheDocument();
    expect(screen.queryByText('timer.stop')).not.toBeInTheDocument();
  });
  
  // Тест 2: Проверка корректного отображения в состоянии "запущен"
  test('renders pause button when timer is running', () => {
    const mockOnClick = jest.fn();
    const mockOnFinish = jest.fn();
    
    render(
      <TimerButton 
        isRunning={true} 
        isPaused={false} 
        onClick={mockOnClick}
        onFinish={mockOnFinish}
      />
    );
    
    const pauseButton = screen.getByText('timer.pause');
    const stopButton = screen.getByText('timer.stop');
    
    expect(pauseButton).toBeInTheDocument();
    expect(stopButton).toBeInTheDocument();
  });
  
  // Тест 3: Проверка корректного отображения в состоянии "пауза"
  test('renders resume button when timer is paused', () => {
    const mockOnClick = jest.fn();
    const mockOnFinish = jest.fn();
    
    render(
      <TimerButton 
        isRunning={false} 
        isPaused={true} 
        onClick={mockOnClick}
        onFinish={mockOnFinish}
      />
    );
    
    const resumeButton = screen.getByText('timer.resume');
    const stopButton = screen.getByText('timer.stop');
    
    expect(resumeButton).toBeInTheDocument();
    expect(stopButton).toBeInTheDocument();
  });
  
  // Тест 4: Проверка вызова обработчика клика для кнопки старта/паузы/продолжения
  test('calls onClick handler when start/pause/resume button is clicked', () => {
    const mockOnClick = jest.fn();
    
    render(
      <TimerButton 
        isRunning={false} 
        isPaused={false} 
        onClick={mockOnClick}
      />
    );
    
    const startButton = screen.getByText('timer.start');
    fireEvent.click(startButton);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
  
  // Тест 5: Проверка вызова обработчика клика для кнопки завершения
  test('calls onFinish handler when stop button is clicked', () => {
    const mockOnClick = jest.fn();
    const mockOnFinish = jest.fn();
    
    render(
      <TimerButton 
        isRunning={true} 
        isPaused={false} 
        onClick={mockOnClick}
        onFinish={mockOnFinish}
      />
    );
    
    const stopButton = screen.getByText('timer.stop');
    fireEvent.click(stopButton);
    
    expect(mockOnFinish).toHaveBeenCalledTimes(1);
    expect(mockOnClick).not.toHaveBeenCalled();
  });
  
  // Тест 6: Проверка отсутствия кнопки завершения, если не передан обработчик
  test('does not render stop button if onFinish is not provided', () => {
    const mockOnClick = jest.fn();
    
    render(
      <TimerButton 
        isRunning={true} 
        isPaused={false} 
        onClick={mockOnClick}
      />
    );
    
    expect(screen.queryByText('timer.stop')).not.toBeInTheDocument();
  });
  
  // Тест 7: Проверка доступности кнопок (CSS классы)
  test('buttons have correct accessibility classes', () => {
    const mockOnClick = jest.fn();
    const mockOnFinish = jest.fn();
    
    render(
      <TimerButton 
        isRunning={true} 
        isPaused={false} 
        onClick={mockOnClick}
        onFinish={mockOnFinish}
      />
    );
    
    const pauseButton = screen.getByText('timer.pause');
    const stopButton = screen.getByText('timer.stop');
    
    // Проверка наличия CSS классов доступности
    expect(pauseButton).toHaveClass('transition-all');
    expect(stopButton).toHaveClass('transition-all');
  });
});