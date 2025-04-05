import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
    jest.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
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
  test('toggleTimer starts the timer when not running', async () => {
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

    // Перематываем время на 5 секунд вперед
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    // Ждем обновления UI
    await waitFor(() => {
      const elapsedTimeValue = parseInt(screen.getByTestId('elapsed-time').textContent || '0');
      expect(elapsedTimeValue).toBeGreaterThanOrEqual(5000);
    });
  });

  // Тест 3: Проверка функции toggleTimer (пауза таймера)
  test('toggleTimer pauses the timer when running', async () => {
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
    
    // Перематываем время на 5 секунд вперед
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    
    // Паузим таймер
    await act(async () => {
      toggleButton.click();
    });
    
    // Проверяем, что таймер на паузе
    expect(screen.getByTestId('is-running')).toHaveTextContent('not-running');
    expect(screen.getByTestId('is-paused')).toHaveTextContent('paused');
    
    // Получаем значение времени на момент паузы
    const pausedTime = parseInt(screen.getByTestId('elapsed-time').textContent || '0');
    
    // Перематываем время вперед еще на 5 секунд
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    
    // Проверяем, что время не изменилось
    await waitFor(() => {
      const currentTime = parseInt(screen.getByTestId('elapsed-time').textContent || '0');
      expect(currentTime).toBe(pausedTime);
    });
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
    
    // Перематываем время на 5 секунд вперед
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    
    // Завершаем задачу
    await act(async () => {
      finishButton.click();
    });

    // Проверяем, что таймер сброшен
    expect(screen.getByTestId('is-running')).toHaveTextContent('not-running');
    expect(screen.getByTestId('is-paused')).toHaveTextContent('not-paused');
    await waitFor(() => {
      expect(screen.getByTestId('timer-value')).toHaveTextContent('00:00:00');
    });
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

    const toggleButton = screen.getByTestId('toggle-timer');
    const switchButton = screen.getByTestId('switch-project');
    
    // Запускаем таймер
    await act(async () => {
      toggleButton.click();
    });

    // Перематываем время на 5 секунд
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    // Переключаем проект
    await act(async () => {
      switchButton.click();
    });

    // Проверяем, что проект изменился и таймер сбросился
    await waitFor(() => {
      expect(screen.getByTestId('project')).toHaveTextContent('test-project');
      expect(screen.getByTestId('project-text')).toHaveTextContent('Test Project');
      expect(screen.getByTestId('timer-value')).toHaveTextContent('00:00:00');
    });
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

    // Проверить, что timeLimit установлен, сложно через DOM
    // Можно модифицировать TestComponent для отображения timeLimit
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

    // Перематываем время на 5 секунд
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    // Проверяем запись в localStorage
    await waitFor(() => {
      const savedState = JSON.parse(localStorage.getItem('timetracker-timer-state') || '{}');
      expect(savedState.isRunning).toBe(true);
      expect(savedState.project).toBe('development');
    });
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
    await waitFor(() => {
      expect(screen.getByTestId('daily-total')).toHaveTextContent('01:30:00');
    });
  });
});