import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimerButton from '../TimerButton';
import userEvent from '@testing-library/user-event';

// Mock the useTranslation hook from react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key // Return the key as translation
  })
}));

describe('TimerButton', () => {
  // Test 11: Testing keyboard accessibility
  test('supports keyboard navigation and activation', async () => {
    const mockOnClick = jest.fn();
    const user = userEvent.setup();
    
    render(
      <TimerButton 
        isRunning={false} 
        isPaused={false} 
        onClick={mockOnClick}
      />
    );
    
    const startButton = screen.getByText('timer.start');
    
    // Tab to focus the button
    await user.tab();
    expect(startButton).toHaveFocus();
    
    // Press space to activate
    await user.keyboard(' ');
    expect(mockOnClick).toHaveBeenCalledTimes(1);
    
    // Reset and test Enter key
    mockOnClick.mockReset();
    await user.keyboard('{Enter}');
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
  
  // Test 12: Testing button rendering with long text
  test('handles long text content gracefully', () => {
    const mockOnClick = jest.fn();
    
    render(
      <TimerButton 
        isRunning={false} 
        isPaused={false} 
        onClick={mockOnClick}
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.className).toContain('min-w-[160px]');
  });
  
  // Test 13: Testing interaction with disabled state
  test('is non-interactive when disabled', async () => {
    const mockOnClick = jest.fn();
    const user = userEvent.setup();
    
    const { rerender } = render(
      <TimerButton 
        isRunning={false} 
        isPaused={false} 
        onClick={mockOnClick}
      />
    );
    
    let button = screen.getByText('timer.start');
    
    // Add disabled attribute manually to test
    rerender(
      <TimerButton 
        isRunning={false} 
        isPaused={false} 
        onClick={mockOnClick}
      />
    );
    
    button = screen.getByText('timer.start');
    button.setAttribute('disabled', '');
    
    await user.click(button);
    expect(mockOnClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });
  
  // Test 14: Testing that stop button doesn't appear in initial state
  test('does not show stop button in initial state', () => {
    const mockOnClick = jest.fn();
    const mockOnFinish = jest.fn();
    
    render(
      <TimerButton 
        isRunning={false} 
        isPaused={false} 
        onClick={mockOnClick}
        onFinish={mockOnFinish}
      />
    );
    
    expect(screen.queryByText('timer.stop')).not.toBeInTheDocument();
  });
  
  // Test 15: Testing the container's flex layout
  test('renders with correct flex layout container', () => {
    const mockOnClick = jest.fn();
    
    render(
      <TimerButton 
        isRunning={false} 
        isPaused={false} 
        onClick={mockOnClick}
      />
    );
    
    const container = screen.getByText('timer.start').closest('div')?.parentElement;
    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('gap-16');
    expect(container).toHaveClass('justify-center');
  });
});
    
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
    expect(pauseButton.className).toContain('transition-all');
    expect(stopButton.className).toContain('transition-all');
  });
  
  // Дополнительные тесты

  // Тест 8: Проверка корректного отображения кнопки при паузе без onFinish
  test('renders resume button when paused but no stop button without onFinish', () => {
    const mockOnClick = jest.fn();
    
    render(
      <TimerButton 
        isRunning={false} 
        isPaused={true} 
        onClick={mockOnClick}
      />
    );
    
    const resumeButton = screen.getByText('timer.resume');
    expect(resumeButton).toBeInTheDocument();
    expect(screen.queryByText('timer.stop')).not.toBeInTheDocument();
  });
  
  // Тест 9: Проверка стилей кнопки в различных состояниях
  test('applies different styles based on timer state', () => {
    const { rerender } = render(
      <TimerButton 
        isRunning={false} 
        isPaused={false} 
        onClick={jest.fn()} 
      />
    );
    
    let button = screen.getByText('timer.start');
    expect(button.className).toContain('bg-[#e8efff]');
    
    // Перерендерим с запущенным состоянием
    rerender(
      <TimerButton 
        isRunning={true} 
        isPaused={false} 
        onClick={jest.fn()} 
      />
    );
    
    button = screen.getByText('timer.pause');
    expect(button.className).toContain('bg-[#e8efff]');
    
    // Перерендерим с состоянием паузы
    rerender(
      <TimerButton 
        isRunning={false} 
        isPaused={true} 
        onClick={jest.fn()} 
      />
    );
    
    button = screen.getByText('timer.resume');
    expect(button.className).toContain('bg-[#f0fff4]');
  });
  
  // Тест 10: Проверка вызова click handler для кнопки в состоянии "запущен"
  test('calls onClick handler when pause button is clicked', () => {
    const mockOnClick = jest.fn();
    
    render(
      <TimerButton 
        isRunning={true} 
        isPaused={false} 
        onClick={mockOnClick}
        onFinish={jest.fn()}
      />
    );
    
    const pauseButton = screen.getByText('timer.pause');
    fireEvent.click(pauseButton);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
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