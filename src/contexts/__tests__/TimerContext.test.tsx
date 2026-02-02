import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TimerProvider, useTimer } from '../../contexts/TimerContext';
import { Button } from '../../components/ui/Button';

// Устанавливаем увеличенный таймаут для всех тестов в файле
jest.setTimeout(30000);

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

// Мокируем внутренние функции TimerContext, но экспортируем оригинальные типы и хук
jest.mock('../../contexts/TimerContext', () => {
  const originalModule = jest.requireActual('../../contexts/TimerContext');
  return {
    ...originalModule,
    TimerProvider: originalModule.TimerProvider,
    useTimer: originalModule.useTimer,
  };
});

// Компонент для тестирования хука
const TestComponent: React.FC = () => {
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
    <div data-testid="test-component">
      <div data-testid="project">{project}</div>
      <div data-testid="project-text">{projectText}</div>
      <div data-testid="is-running">{isRunning ? 'running' : 'not-running'}</div>
      <div data-testid="is-paused">{isPaused ? 'paused' : 'not-paused'}</div>
      <div data-testid="elapsed-time">{elapsedTime}</div>
      <div data-testid="timer-value">{timerValue}</div>
      <div data-testid="daily-total">{formatTime(dailyTotal)}</div>
      <Button data-testid="toggle-timer" onClick={() => toggleTimer('development')} variant="outline" size="sm">
        Toggle
      </Button>
      <Button data-testid="finish-task" onClick={() => finishTask()} variant="outline" size="sm">
        Finish
      </Button>
      <Button data-testid="switch-project" onClick={() => switchProject('new-project')} variant="outline" size="sm">
        Switch
      </Button>
      <div data-testid="format-time">{formatTime(3661000)}</div>
      <Button data-testid="set-time-limit" onClick={() => setTimeLimit(3600)} variant="outline" size="sm">
        Set Limit
      </Button>
    </div>
  );
};

describe('TimerContext', () => {
  beforeEach(() => {
    // Используем современные fake timers
    jest.useFakeTimers();

    // Мокируем play для всех <audio> элементов
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.HTMLMediaElement.prototype as any).play = jest.fn(() => Promise.resolve());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.HTMLMediaElement.prototype as any).pause = jest.fn();

    // Очищаем localStorage перед каждым тестом
    localStorage.clear();
    // Сбрасываем моки перед каждым тестом
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.clearAllTimers();
    jest.useRealTimers();
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

    // Проверяем, что время обновилось
    const elapsedTimeValue = parseInt(screen.getByTestId('elapsed-time').textContent || '0');
    expect(elapsedTimeValue).toBeGreaterThanOrEqual(5000);
  });

  // Тест 3: Проверка функции toggleTimer (пауза таймера)
  // TODO: Fix fake timers interaction with async state updates
  test.skip('toggleTimer pauses the timer when running', async () => {
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
      jest.advanceTimersByTime(100); // Даём время на обработку
    });

    // Проверяем, что таймер запущен
    expect(screen.getByTestId('is-running')).toHaveTextContent('running');

    // Перематываем время на 5 секунд вперед
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    // Паузим таймер - нажимаем на тот же проект
    await act(async () => {
      toggleButton.click();
      jest.advanceTimersByTime(100); // Даём время на обработку
    });

    // Проверяем, что таймер на паузе
    await waitFor(() => {
      expect(screen.getByTestId('is-running')).toHaveTextContent('not-running');
      expect(screen.getByTestId('is-paused')).toHaveTextContent('paused');
    });

    // Получаем значение времени на момент паузы
    const pausedTime = parseInt(screen.getByTestId('elapsed-time').textContent || '0');

    // Перематываем время вперед еще на 5 секунд
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    // Проверяем, что время не изменилось (таймер на паузе)
    const currentTime = parseInt(screen.getByTestId('elapsed-time').textContent || '0');
    expect(currentTime).toBe(pausedTime);
  });

  // Тест 4: Проверка функции finishTask
  // TODO: Fix fake timers interaction with async state updates
  test.skip('finishTask resets the timer', async () => {
    await act(async () => {
      render(
        <TimerProvider>
          <TestComponent />
        </TimerProvider>
      );
    });

    // Проверяем начальное состояние
    expect(screen.getByTestId('is-running')).toHaveTextContent('not-running');

    // Нажимаем кнопку запуска таймера
    const toggleButton = screen.getByTestId('toggle-timer');
    await act(async () => {
      toggleButton.click();
      jest.advanceTimersByTime(100);
    });

    // Проверяем, что таймер запущен
    expect(screen.getByTestId('is-running')).toHaveTextContent('running');

    // Продвигаем время на 65 секунд (>60 секунд минимального порога)
    await act(async () => {
      jest.advanceTimersByTime(65000);
    });

    // Проверяем, что время пошло
    expect(screen.getByTestId('timer-value')).toHaveTextContent('00:01:05');

    const finishButton = screen.getByTestId('finish-task');

    // Нажимаем кнопку завершения задачи
    await act(async () => {
      finishButton.click();
      jest.advanceTimersByTime(1000); // Даём время на обработку без runAllTimers
    });

    // Проверяем сброс состояния
    await waitFor(() => {
      expect(screen.getByTestId('is-running')).toHaveTextContent('not-running');
      expect(screen.getByTestId('is-paused')).toHaveTextContent('not-paused');
      expect(screen.getByTestId('timer-value')).toHaveTextContent('00:00:00');
    }, { timeout: 5000 });
  });

  // Тест 5: Проверка функции switchProject
  // TODO: Fix fake timers interaction with async state updates
  test.skip('switchProject changes project and resets timer', async () => {
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
      jest.advanceTimersByTime(100);
    });

    // Перематываем время на 5 секунд
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    // Проверяем, что время пошло (используем числовое сравнение)
    const elapsedBefore = parseInt(screen.getByTestId('elapsed-time').textContent || '0');
    expect(elapsedBefore).toBeGreaterThan(0);

    // Переключаем проект
    await act(async () => {
      switchButton.click();
      jest.advanceTimersByTime(1000); // Используем advanceTimersByTime вместо runAllTimers
    });

    // Проверяем, что проект изменился и таймер сбросился
    await waitFor(() => {
      expect(screen.getByTestId('project')).toHaveTextContent('new-project');
      expect(screen.getByTestId('is-running')).toHaveTextContent('not-running');
      expect(screen.getByTestId('is-paused')).toHaveTextContent('not-paused');
      const elapsedAfter = parseInt(screen.getByTestId('elapsed-time').textContent || '0');
      expect(elapsedAfter).toBe(0);
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

    // This test just verifies the function can be called without errors
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
    await waitFor(() => {
      expect(screen.getByTestId('daily-total')).toHaveTextContent('01:30:00');
    });
  });
});
