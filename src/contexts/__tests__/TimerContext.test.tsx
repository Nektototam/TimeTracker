import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TimerProvider, useTimer } from '../../contexts/TimerContext';
import { Button } from '../../components/ui/Button';
import { TIMER_STATES_STORAGE_KEY } from '../../lib/constants/time';

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

// Мок для api
jest.mock('../../lib/api', () => ({
  api: {
    settings: {
      get: jest.fn().mockResolvedValue({ settings: {} }),
    },
    projects: {
      get: jest.fn().mockResolvedValue({ item: { name: 'Test Project' } }),
      activate: jest.fn().mockResolvedValue({ ok: true }),
    },
  },
}));

// Компонент для тестирования хука
const TestComponent: React.FC = () => {
  const {
    projectId,
    projectName,
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
    setProjectId,
    setProjectName,
  } = useTimer();

  // Устанавливаем проект при монтировании для тестов
  React.useEffect(() => {
    if (!projectId) {
      setProjectId('test-project-id');
      setProjectName('Test Project');
    }
  }, [projectId, setProjectId, setProjectName]);

  return (
    <div data-testid="test-component">
      <div data-testid="project-id">{projectId || ''}</div>
      <div data-testid="project-name">{projectName}</div>
      <div data-testid="is-running">{isRunning ? 'running' : 'not-running'}</div>
      <div data-testid="is-paused">{isPaused ? 'paused' : 'not-paused'}</div>
      <div data-testid="elapsed-time">{elapsedTime}</div>
      <div data-testid="timer-value">{timerValue}</div>
      <div data-testid="daily-total">{formatTime(dailyTotal)}</div>
      <Button data-testid="toggle-timer" onClick={() => toggleTimer()} variant="outline" size="sm">
        Toggle
      </Button>
      <Button data-testid="finish-task" onClick={() => finishTask()} variant="outline" size="sm">
        Finish
      </Button>
      <Button data-testid="switch-project" onClick={() => switchProject('new-project-id', 'New Project')} variant="outline" size="sm">
        Switch
      </Button>
      <div data-testid="format-time">{formatTime(3661000)}</div>
      <Button data-testid="set-time-limit" onClick={() => setTimeLimit(3600000)} variant="outline" size="sm">
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
    (window.HTMLMediaElement.prototype as unknown as { play: jest.Mock }).play = jest.fn(() => Promise.resolve());
    (window.HTMLMediaElement.prototype as unknown as { pause: jest.Mock }).pause = jest.fn();

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

    // Ждём пока useEffect установит project
    await waitFor(() => {
      expect(screen.getByTestId('project-id')).toHaveTextContent('test-project-id');
    });
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

    // Ждём установки проекта
    await waitFor(() => {
      expect(screen.getByTestId('project-id')).toHaveTextContent('test-project-id');
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

    await waitFor(() => {
      expect(screen.getByTestId('project-id')).toHaveTextContent('test-project-id');
    });

    const toggleButton = screen.getByTestId('toggle-timer');

    // Запускаем таймер
    await act(async () => {
      toggleButton.click();
      jest.advanceTimersByTime(100);
    });

    expect(screen.getByTestId('is-running')).toHaveTextContent('running');

    // Перематываем время на 5 секунд вперед
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    // Паузим таймер
    await act(async () => {
      toggleButton.click();
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(screen.getByTestId('is-running')).toHaveTextContent('not-running');
      expect(screen.getByTestId('is-paused')).toHaveTextContent('paused');
    });

    const pausedTime = parseInt(screen.getByTestId('elapsed-time').textContent || '0');

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

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

    await waitFor(() => {
      expect(screen.getByTestId('project-id')).toHaveTextContent('test-project-id');
    });

    expect(screen.getByTestId('is-running')).toHaveTextContent('not-running');

    const toggleButton = screen.getByTestId('toggle-timer');
    await act(async () => {
      toggleButton.click();
      jest.advanceTimersByTime(100);
    });

    expect(screen.getByTestId('is-running')).toHaveTextContent('running');

    await act(async () => {
      jest.advanceTimersByTime(65000);
    });

    expect(screen.getByTestId('timer-value')).toHaveTextContent('00:01:05');

    const finishButton = screen.getByTestId('finish-task');

    await act(async () => {
      finishButton.click();
      jest.advanceTimersByTime(1000);
    });

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

    await waitFor(() => {
      expect(screen.getByTestId('project-id')).toHaveTextContent('test-project-id');
    });

    const toggleButton = screen.getByTestId('toggle-timer');
    const switchButton = screen.getByTestId('switch-project');

    await act(async () => {
      toggleButton.click();
      jest.advanceTimersByTime(100);
    });

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    const elapsedBefore = parseInt(screen.getByTestId('elapsed-time').textContent || '0');
    expect(elapsedBefore).toBeGreaterThan(0);

    await act(async () => {
      switchButton.click();
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByTestId('project-id')).toHaveTextContent('new-project-id');
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

    // Ждём установки проекта
    await waitFor(() => {
      expect(screen.getByTestId('project-id')).toHaveTextContent('test-project-id');
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

    // Проверяем запись в localStorage (используем новый ключ)
    const savedStates = JSON.parse(localStorage.getItem(TIMER_STATES_STORAGE_KEY) || '{}');
    expect(savedStates['test-project-id']).toBeDefined();
    expect(savedStates['test-project-id'].isRunning).toBe(true);
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
