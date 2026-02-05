/**
 * Tests for usePomodoroPersistence hook
 * TDD: RED phase - tests should fail initially
 */

import { renderHook, act } from '@testing-library/react';
import { usePomodoroPersistence, PomodoroState } from '../usePomodoroPersistence';
import { POMODORO_STATE_STORAGE_KEY } from '../../lib/constants/time';

describe('usePomodoroPersistence', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('loadState', () => {
    test('returns null when no saved state exists', () => {
      const { result } = renderHook(() => usePomodoroPersistence());

      const state = result.current.loadState();

      expect(state).toBeNull();
    });

    test('returns saved state when it exists', () => {
      const savedState: PomodoroState = {
        workDuration: 25,
        restDuration: 5,
        mode: 'work',
        isRunning: true,
        timeLeft: 1500,
        cycles: 2,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(POMODORO_STATE_STORAGE_KEY, JSON.stringify(savedState));

      const { result } = renderHook(() => usePomodoroPersistence());
      const state = result.current.loadState();

      expect(state).toEqual(savedState);
    });

    test('returns null on invalid JSON', () => {
      localStorage.setItem(POMODORO_STATE_STORAGE_KEY, 'invalid json');
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => usePomodoroPersistence());
      const state = result.current.loadState();

      expect(state).toBeNull();
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe('saveState', () => {
    test('saves state to localStorage', () => {
      const { result } = renderHook(() => usePomodoroPersistence());

      const state: PomodoroState = {
        workDuration: 30,
        restDuration: 10,
        mode: 'rest',
        isRunning: false,
        timeLeft: 600,
        cycles: 3,
        lastUpdated: Date.now(),
      };

      act(() => {
        result.current.saveState(state);
      });

      const saved = JSON.parse(localStorage.getItem(POMODORO_STATE_STORAGE_KEY) || '');
      expect(saved).toEqual(state);
    });

    test('overwrites existing state', () => {
      const { result } = renderHook(() => usePomodoroPersistence());

      const state1: PomodoroState = {
        workDuration: 25,
        restDuration: 5,
        mode: 'work',
        isRunning: true,
        timeLeft: 1500,
        cycles: 1,
        lastUpdated: Date.now(),
      };

      const state2: PomodoroState = {
        workDuration: 30,
        restDuration: 10,
        mode: 'rest',
        isRunning: false,
        timeLeft: 300,
        cycles: 5,
        lastUpdated: Date.now(),
      };

      act(() => {
        result.current.saveState(state1);
        result.current.saveState(state2);
      });

      const saved = JSON.parse(localStorage.getItem(POMODORO_STATE_STORAGE_KEY) || '');
      expect(saved).toEqual(state2);
    });
  });

  describe('clearState', () => {
    test('removes state from localStorage', () => {
      const { result } = renderHook(() => usePomodoroPersistence());

      const state: PomodoroState = {
        workDuration: 25,
        restDuration: 5,
        mode: 'work',
        isRunning: true,
        timeLeft: 1500,
        cycles: 1,
        lastUpdated: Date.now(),
      };

      localStorage.setItem(POMODORO_STATE_STORAGE_KEY, JSON.stringify(state));

      act(() => {
        result.current.clearState();
      });

      expect(localStorage.getItem(POMODORO_STATE_STORAGE_KEY)).toBeNull();
    });
  });

  describe('getDefaultState', () => {
    test('returns default pomodoro state', () => {
      const { result } = renderHook(() => usePomodoroPersistence());

      const defaultState = result.current.getDefaultState();

      expect(defaultState.workDuration).toBe(25);
      expect(defaultState.restDuration).toBe(5);
      expect(defaultState.mode).toBe('work');
      expect(defaultState.isRunning).toBe(false);
      expect(defaultState.cycles).toBe(0);
      expect(defaultState.timeLeft).toBe(25 * 60); // 25 minutes in seconds
    });
  });

  describe('createState', () => {
    test('creates state with current timestamp', () => {
      const { result } = renderHook(() => usePomodoroPersistence());

      const now = Date.now();
      const state = result.current.createState({
        workDuration: 25,
        restDuration: 5,
        mode: 'work',
        isRunning: true,
        timeLeft: 1500,
        cycles: 0,
      });

      expect(state.lastUpdated).toBeGreaterThanOrEqual(now);
      expect(state.workDuration).toBe(25);
      expect(state.isRunning).toBe(true);
    });
  });
});
