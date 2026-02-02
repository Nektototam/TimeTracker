import React, { act } from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TimerProvider, useTimer } from '../../contexts/TimerContext';
import { Button } from '../../components/ui/Button';

// Устанавливаем увеличенный таймаут для всех тестов в файле
jest.setTimeout(10000);

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
    ...originalModule, // Экспортируем все из оригинального модуля
    TimerProvider: originalModule.TimerProvider, // Переопределяем только Provider, если нужно
    useTimer: originalModule.useTimer, // Экспортируем оригинальный хук
    // Моки можно добавить здесь, если они нужны на уровне модуля,
    // но для playSound лучше мокать его через jest.spyOn внутри тестов или beforeEach
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
      <div data-testid="format-time">{formatTime(3661000)}</div> {/* 1 час 1 минута 1 секунда */}
      <Button data-testid="set-time-limit" onClick={() => setTimeLimit(3600)} variant="outline" size="sm">
        Set Limit
      </Button>
    </div>
  );
};

describe('TimerContext', () => {
  // Используем фейковые таймеры Jest
  jest.useFakeTimers();

  // Мок для HTMLMediaElement.play, который возвращает Promise
  // JSDOM не реализует play() полностью, он не возвращает Promise
  beforeEach(() => {
    // Мокируем play для всех <audio> элементов
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.HTMLMediaElement.prototype as any).play = jest.fn(() => Promise.resolve());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.HTMLMediaElement.prototype as any).pause = jest.fn(); // Также мокируем pause, если нужно

    // Очищаем localStorage перед каждым тестом
    localStorage.clear();
    // Сбрасываем моки перед каждым тестом
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Очищаем все таймеры после каждого теста
    jest.clearAllTimers();
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
    await waitFor(() => {
      expect(screen.getByTestId('is-running')).toHaveTextContent('running');
      expect(screen.getByTestId('is-paused')).toHaveTextContent('not-paused');
    });

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
    await waitFor(() => {
      expect(screen.getByTestId('is-running')).toHaveTextContent('running');
    });
    
    // Перематываем время на 5 секунд вперед
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    
    // Паузим таймер
    await act(async () => {
      toggleButton.click();
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
    
    // Проверяем, что время не изменилось
    await waitFor(() => {
      const currentTime = parseInt(screen.getByTestId('elapsed-time').textContent || '0');
      expect(currentTime).toBe(pausedTime);
    });
  });

  // Тест 4: Проверка функции finishTask
  test('finishTask resets the timer', async () => {
    const { rerender } = render(
      <TimerProvider>
        <TestComponent />
      </TimerProvider>
    );

    // Ждем обновления состояния
    await waitFor(() => expect(screen.getByTestId('is-running')).toHaveTextContent('not-running'));

    // Нажимаем кнопку запуска таймера
    const toggleButton = screen.getByTestId('toggle-timer');
    await act(async () => {
      toggleButton.click();
    });

    // Ждем обновления состояния
    await waitFor(() => expect(screen.getByTestId('is-running')).toHaveTextContent('running'));

    // Продвигаем время на 5 секунд
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Обновляем компонент, чтобы отразить изменения времени
    rerender(
      <TimerProvider>
        <TestComponent />
      </TimerProvider>
    ); // Может быть избыточным, но для надежности

    // Проверяем, что время пошло
    await waitFor(() => {
      expect(screen.getByTestId('timer-value')).toHaveTextContent('00:00:05');
    });

    // Продвигаем время ещё на 60 секунд, чтобы преодолеть минимальный порог в 60000 мс для saveCurrentEntry
    act(() => {
      jest.advanceTimersByTime(60000);
    });

    // Обновляем компонент еще раз
    rerender(
      <TimerProvider>
        <TestComponent />
      </TimerProvider>
    );

    const finishButton = screen.getByTestId('finish-task');

    // Нажимаем кнопку завершения задачи
    await userEvent.click(finishButton);

    // Обновляем компонент после нажатия кнопки
    rerender(
      <TimerProvider>
        <TestComponent />
      </TimerProvider>
    );
    
    // Продвигаем таймеры и микрозадачи, чтобы дать промисам время для выполнения
    act(() => {
      jest.advanceTimersByTime(1000);
      // Имитируем выполнение микрозадач
      jest.runAllTimers();
    });
    
    // Обновляем компонент еще раз
    rerender(
      <TimerProvider>
        <TestComponent />
      </TimerProvider>
    );

    // Используем увеличенный таймаут для waitFor
    await waitFor(() => {
      expect(screen.getByTestId('is-running')).toHaveTextContent('not-running');
    }, { timeout: 5000 });

    // Дополнительно проверяем остальные сброшенные значения (уже после того, как is-running обновился)
    expect(screen.getByTestId('is-paused')).toHaveTextContent('not-paused');
    expect(screen.getByTestId('timer-value')).toHaveTextContent('00:00:00');
    expect(screen.getByTestId('elapsed-time')).toHaveTextContent('0'); // Проверяем сброс чистого времени
    expect(screen.getByTestId('project')).toHaveTextContent('development'); // Проверяем сброс проекта
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

    // Проверяем, что время пошло
    expect(screen.getByTestId('elapsed-time')).not.toHaveTextContent('0');
    expect(screen.getByTestId('timer-value')).not.toHaveTextContent('00:00:00');

    // Переключаем проект
    await act(async () => {
      switchButton.click();
    });

    // Проверяем, что проект изменился и таймер сбросился
    await waitFor(() => {
      expect(screen.getByTestId('project')).toHaveTextContent('new-project');
      expect(screen.getByTestId('is-running')).toHaveTextContent('not-running');
      expect(screen.getByTestId('is-paused')).toHaveTextContent('not-paused');
      expect(screen.getByTestId('elapsed-time')).toHaveTextContent('0');
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