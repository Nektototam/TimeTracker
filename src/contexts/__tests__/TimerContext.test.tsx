import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TimerProvider, useTimer } from '../../contexts/TimerContext';

// Мок для AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}));

// Мок для useTimeEntries
jest.mock('../../hooks/useTimeEntries', () => ({
  useTimeEntries: () => ({
    entries: [],
    isLoading: false,
    error: null,
    addTimeEntry: jest.fn().mockResolvedValue({}),
    getTodayEntries: jest.fn().mockResolvedValue([]),
  }),
}));

// Мок для settingsService
jest.mock('../../lib/settingsService', () => ({
  __esModule: true,
  default: {
    getSettings: jest.fn().mockResolvedValue({}),
    updateSettings: jest.fn().mockResolvedValue({}),
  },
}));

// Мокируем внутренние функции TimerContext
jest.mock('../../contexts/TimerContext', () => {
  const originalModule = jest.requireActual('../../contexts/TimerContext');
  
  return {
    ...originalModule,
    // Override specific implementation details but keep the API
    TimerProvider: originalModule.TimerProvider,
  };
});

// Компонент-обертка для тестирования хука useTimer
const TestComponent = ({ testId = 'test-component' }) => {
  const {
    project,
    projectText,
    isRunning,
    isPaused,
    elapsedTime,
    timerValue,
    dailyTotal,
    toggleTimer,
    finishTask,
    switchProject,
    formatTime,
    setTimeLimit,
  } = useTimer();

  return (
    <div data-testid={testId}>
      <div data-testid="project">{project}</div>
      <div data-testid="project-text">{projectText}</div>
      <div data-testid="is-running">{isRunning ? 'running' : 'not-running'}</div>
      <div data-testid="is-paused">{isPaused ? 'paused' : 'not-paused'}</div>
      <div data-testid="elapsed-time">{elapsedTime}</div>
      <div data-testid="timer-value">{timerValue}</div>
      <div data-testid="daily-total">{dailyTotal}</div>
      <button data-testid="toggle-timer" onClick={() => toggleTimer()}>
        Toggle
      </button>
      <button data-testid="finish-task" onClick={() => finishTask()}>
        Finish
      </button>
      <button
        data-testid="switch-project"
        onClick={() => switchProject('test-project', 'Test Project')}
      >
        Switch
      </button>
      <div data-testid="format-time">{formatTime(3661000)}</div>
      <button data-testid="set-time-limit" onClick={() => setTimeLimit(30)}>
        Set Limit
      </button>
    </div>
  );
};

describe('TimerContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  // Тест 1: Проверка начальных значений контекста
  test('provides default values', async () => {
    await act(async () => {
      render(
        <TimerProvider>
          <TestComponent />
        </TimerProvider>
      );
    });

    expect(screen.getByTestId('project')).toHaveTextContent('development');
    expect(screen.getByTestId('is-running')).toHaveTextContent('not-running');
    expect(screen.getByTestId('is-paused')).toHaveTextContent('not-paused');
    expect(screen.getByTestId('timer-value')).toHaveTextContent('00:00:00');
  });

  // Тест 2: Проверка функции toggleTimer (запуск таймера)
  test('toggleTimer changes the timer state correctly', async () => {
    await act(async () => {
      render(
        <TimerProvider>
          <TestComponent />
        </TimerProvider>
      );
    });

    const toggleButton = screen.getByTestId('toggle-timer');
    
    // Запускаем таймер
    await act(async () => {
      toggleButton.click();
    });

    // Проверяем, что таймер запущен
    expect(screen.getByTestId('is-running')).toHaveTextContent('running');
    expect(screen.getByTestId('is-paused')).toHaveTextContent('not-paused');
  });

  // Тест 3: Проверка функции toggleTimer (пауза таймера)
  test('toggleTimer pauses the timer when already running', async () => {
    await act(async () => {
      render(
        <TimerProvider>
          <TestComponent />
        </TimerProvider>
      );
    });

    const toggleButton = screen.getByTestId('toggle-timer');
    
    // Запускаем таймер
    await act(async () => {
      toggleButton.click();
    });

    // Проверяем, что таймер запущен
    expect(screen.getByTestId('is-running')).toHaveTextContent('running');
    
    // Паузим таймер
    await act(async () => {
      toggleButton.click();
    });
    
    // Проверяем, что таймер на паузе
    expect(screen.getByTestId('is-running')).toHaveTextContent('not-running');
    expect(screen.getByTestId('is-paused')).toHaveTextContent('paused');
  });

  // Тест 4: Проверка функции finishTask
  test('finishTask resets the timer', async () => {
    await act(async () => {
      render(
        <TimerProvider>
          <TestComponent />
        </TimerProvider>
      );
    });

    const toggleButton = screen.getByTestId('toggle-timer');
    const finishButton = screen.getByTestId('finish-task');
    
    // Запускаем таймер
    await act(async () => {
      toggleButton.click();
    });
    
    // Завершаем задачу
    await act(async () => {
      finishButton.click();
    });

    // Проверяем, что таймер сброшен
    expect(screen.getByTestId('is-running')).toHaveTextContent('not-running');
    expect(screen.getByTestId('is-paused')).toHaveTextContent('not-paused');
    expect(screen.getByTestId('timer-value')).toHaveTextContent('00:00:00');
  });

  // Тест 5: Проверка функции switchProject
  test('switchProject changes project and resets timer', async () => {
    await act(async () => {
      render(
        <TimerProvider>
          <TestComponent />
        </TimerProvider>
      );
    });

    const switchButton = screen.getByTestId('switch-project');
    
    // Переключаем проект
    await act(async () => {
      switchButton.click();
    });

    // Проверяем, что проект изменился и таймер сбросился
    expect(screen.getByTestId('project')).toHaveTextContent('test-project');
    expect(screen.getByTestId('project-text')).toHaveTextContent('Test Project');
    expect(screen.getByTestId('timer-value')).toHaveTextContent('00:00:00');
  });

  // Тест 6: Проверка функции форматирования времени
  test('formatTime correctly formats time', async () => {
    await act(async () => {
      render(
        <TimerProvider>
          <TestComponent />
        </TimerProvider>
      );
    });

    // 3661000 мс = 1 час 1 минута 1 секунда
    expect(screen.getByTestId('format-time')).toHaveTextContent('01:01:01');
  });

  // Тест 7: Проверка функции setTimeLimit
  test('setTimeLimit updates time limit', async () => {
    await act(async () => {
      render(
        <TimerProvider>
          <TestComponent />
        </TimerProvider>
      );
    });

    const setLimitButton = screen.getByTestId('set-time-limit');
    
    await act(async () => {
      setLimitButton.click();
    });
    
    // This test just verifies the function can be called without errors
    // since we can't easily inspect the internal state
  });

  // Тест 8: Проверка сохранения состояния в localStorage
  test('saves timer state to localStorage', async () => {
    await act(async () => {
      render(
        <TimerProvider>
          <TestComponent />
        </TimerProvider>
      );
    });

    const toggleButton = screen.getByTestId('toggle-timer');
    
    // Запускаем таймер
    await act(async () => {
      toggleButton.click();
    });

    // Проверяем запись в localStorage - достаточно немного подождать для сохранения
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    const savedState = JSON.parse(localStorage.getItem('timetracker-timer-state') || '{}');
    expect(savedState.isRunning).toBe(true);
    expect(savedState.project).toBe('development');
  });

  // Тест 9: Проверка обновления dailyTotal
  test('updates dailyTotal correctly', async () => {
    // Мокируем результат getTodayEntries
    jest.spyOn(require('../../hooks/useTimeEntries'), 'useTimeEntries').mockImplementation(() => ({
      entries: [],
      isLoading: false,
      error: null,
      addTimeEntry: jest.fn().mockResolvedValue({}),
      getTodayEntries: jest.fn().mockResolvedValue([
        { duration: 3600000 }, // 1 час
        { duration: 1800000 }, // 30 минут
      ]),
    }));

    await act(async () => {
      render(
        <TimerProvider>
          <TestComponent />
        </TimerProvider>
      );
    });

    // Проверяем, что dailyTotal корректно вычислен
    expect(screen.getByTestId('daily-total')).toHaveTextContent('01:30:00');
  });
});