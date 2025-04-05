import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimerCircle from '../TimerCircle';

// Мок для TimerContext
jest.mock('../../contexts/TimerContext', () => ({
  useTimer: () => ({
    timeLimit: null,
    formatTime: (ms: number) => {
      const seconds = Math.floor((ms / 1000) % 60);
      const minutes = Math.floor((ms / 1000 / 60) % 60);
      const hours = Math.floor(ms / 1000 / 60 / 60);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }),
}));

describe('TimerCircle', () => {
  // Тест 1: Проверка базового рендеринга компонента
  test('renders timer circle with correct time and project', () => {
    render(
      <TimerCircle
        isRunning={false}
        startTime={0}
        elapsedTime={3661000} // 1 час 1 минута 1 секунда
        status="timer.status.ready"
        timeValue="01:01:01"
        project="Тестовый проект"
      />
    );
    
    expect(screen.getByText('timer.status.ready')).toBeInTheDocument();
    expect(screen.getByText('01:01:01')).toBeInTheDocument();
    expect(screen.getByText('Тестовый проект')).toBeInTheDocument();
  });
  
  // Тест 2: Проверка работы с отсутствующим названием проекта
  test('renders "not selected" when project name is empty', () => {
    render(
      <TimerCircle
        isRunning={false}
        startTime={0}
        elapsedTime={0}
        status="timer.status.ready"
        timeValue="00:00:00"
        project=""
      />
    );
    
    expect(screen.getByText('timer.notSelected')).toBeInTheDocument();
  });
  
  // Тест 3: Проверка статуса "запущено" и стилей
  test('adds running styles when timer is running', () => {
    render(
      <TimerCircle
        isRunning={true}
        startTime={Date.now() - 60000} // Запущен 1 минуту назад
        elapsedTime={60000}
        status="timer.status.running"
        timeValue="00:01:00"
        project="Тестовый проект"
      />
    );
    
    expect(screen.getByText('timer.status.running')).toBeInTheDocument();
    
    const timerCircle = document.querySelector('.timer-circle');
    expect(timerCircle).toHaveClass('scale-105');
  });
  
  // Тест 4: Проверка элемента с временным ограничением
  test('renders time limit information when timeLimit is provided', () => {
    // Переопределяем мок только для этого теста
    jest.spyOn(require('../../contexts/TimerContext'), 'useTimer').mockImplementation(() => ({
      timeLimit: 3600000, // 1 час
      formatTime: (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        return `${minutes} мин`;
      }
    }));
    
    render(
      <TimerCircle
        isRunning={true}
        startTime={Date.now() - 1800000} // Прошло 30 минут
        elapsedTime={1800000}
        status="timer.status.running"
        timeValue="00:30:00"
        project="Тестовый проект"
      />
    );
    
    // Проверяем наличие информации о временном ограничении
    expect(screen.getByText(/timer.limitValue/)).toBeInTheDocument();
  });
  
  // Тест 5: Проверка круговой индикации прогресса
  test('updates progress circle correctly', () => {
    render(
      <TimerCircle
        isRunning={true}
        startTime={Date.now() - 1800000} // Прошло 30 минут
        elapsedTime={1800000}
        status="timer.status.running"
        timeValue="00:30:00"
        project="Тестовый проект"
      />
    );
    
    // Проверяем, что элементы индикации прогресса присутствуют
    const leftSide = document.querySelector('.left-side');
    const rightSide = document.querySelector('.right-side');
    
    expect(leftSide).toBeInTheDocument();
    expect(rightSide).toBeInTheDocument();
  });
  
  // Тест 6: Проверка корректного отображения имени проекта
  test('displays project name correctly', () => {
    const projectName = 'Важный проект';
    render(
      <TimerCircle
        isRunning={false}
        startTime={0}
        elapsedTime={0}
        status="timer.status.ready"
        timeValue="00:00:00"
        project={projectName}
      />
    );
    
    const projectElement = screen.getByTestId('project-name');
    expect(projectElement).toHaveTextContent(projectName);
  });
  
  // Тест 7: Проверка обновления стилей при изменении состояния таймера
  test('reflects timer status changes via styles', () => {
    const { rerender } = render(
      <TimerCircle
        isRunning={false}
        startTime={0}
        elapsedTime={0}
        status="timer.status.ready"
        timeValue="00:00:00"
        project="Тестовый проект"
      />
    );
    
    let timerTime = screen.getByText('00:00:00');
    expect(timerTime).not.toHaveClass('text-primary-dark');
    
    // Перерендериваем с isRunning=true
    rerender(
      <TimerCircle
        isRunning={true}
        startTime={Date.now()}
        elapsedTime={0}
        status="timer.status.running"
        timeValue="00:00:00"
        project="Тестовый проект"
      />
    );
    
    timerTime = screen.getByText('00:00:00');
    const timerInner = document.querySelector('.timer-circle-inner');
    expect(timerInner).toHaveClass('ring-2');
  });
});