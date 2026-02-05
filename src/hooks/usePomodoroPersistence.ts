import { useCallback } from 'react';
import {
  POMODORO_STATE_STORAGE_KEY,
  DEFAULT_POMODORO_WORK_MINUTES,
  DEFAULT_POMODORO_REST_MINUTES,
  SECONDS_PER_MINUTE,
} from '../lib/constants/time';

export type TimerMode = 'work' | 'rest';

export interface PomodoroState {
  workDuration: number;
  restDuration: number;
  mode: TimerMode;
  isRunning: boolean;
  timeLeft: number;
  cycles: number;
  lastUpdated: number;
}

export type PomodoroStateWithoutTimestamp = Omit<PomodoroState, 'lastUpdated'>;

/**
 * Hook for managing Pomodoro timer state persistence in localStorage
 */
export function usePomodoroPersistence() {
  /**
   * Load saved state from localStorage
   */
  const loadState = useCallback((): PomodoroState | null => {
    if (typeof window === 'undefined') return null;

    try {
      const saved = localStorage.getItem(POMODORO_STATE_STORAGE_KEY);
      if (!saved) return null;
      return JSON.parse(saved) as PomodoroState;
    } catch (err) {
      console.error('Error loading Pomodoro state from localStorage:', err);
      return null;
    }
  }, []);

  /**
   * Save state to localStorage
   */
  const saveState = useCallback((state: PomodoroState): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(POMODORO_STATE_STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Error saving Pomodoro state to localStorage:', err);
    }
  }, []);

  /**
   * Clear state from localStorage
   */
  const clearState = useCallback((): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(POMODORO_STATE_STORAGE_KEY);
    } catch (err) {
      console.error('Error clearing Pomodoro state from localStorage:', err);
    }
  }, []);

  /**
   * Get default Pomodoro state
   */
  const getDefaultState = useCallback((): PomodoroState => {
    return {
      workDuration: DEFAULT_POMODORO_WORK_MINUTES,
      restDuration: DEFAULT_POMODORO_REST_MINUTES,
      mode: 'work',
      isRunning: false,
      timeLeft: DEFAULT_POMODORO_WORK_MINUTES * SECONDS_PER_MINUTE,
      cycles: 0,
      lastUpdated: Date.now(),
    };
  }, []);

  /**
   * Create a new state object with current timestamp
   */
  const createState = useCallback((state: PomodoroStateWithoutTimestamp): PomodoroState => {
    return {
      ...state,
      lastUpdated: Date.now(),
    };
  }, []);

  return {
    loadState,
    saveState,
    clearState,
    getDefaultState,
    createState,
  };
}
