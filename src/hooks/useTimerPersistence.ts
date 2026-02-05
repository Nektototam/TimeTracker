/**
 * Hook for managing timer state persistence in localStorage
 * Extracted from TimerContext for better separation of concerns
 */
import { useCallback, useRef } from 'react';
import { TIMER_STATES_STORAGE_KEY } from '../lib/constants/time';

/**
 * State of a timer for a specific project
 */
export interface ProjectTimerState {
  isRunning: boolean;
  isPaused: boolean;
  startTime: number;
  elapsedTime: number;
  pausedElapsedTime: number;
  workTypeId: string | null;
  workTypeName: string;
  lastHourMark: number;
  last15MinMark: number;
  timeLimit: number | null;
}

/**
 * Hook return type
 */
export interface UseTimerPersistenceReturn {
  loadAllStates: () => Record<string, ProjectTimerState>;
  saveAllStates: (states: Record<string, ProjectTimerState>) => void;
  getProjectState: (projectId: string) => ProjectTimerState | undefined;
  saveProjectState: (projectId: string, state: ProjectTimerState) => void;
  clearProjectState: (projectId: string) => void;
  getDefaultTimerState: () => ProjectTimerState;
}

/**
 * Returns a default timer state with all values reset
 */
function getDefaultTimerState(): ProjectTimerState {
  return {
    isRunning: false,
    isPaused: false,
    startTime: 0,
    elapsedTime: 0,
    pausedElapsedTime: 0,
    workTypeId: null,
    workTypeName: '',
    lastHourMark: 0,
    last15MinMark: 0,
    timeLimit: null,
  };
}

/**
 * Loads all project timer states from localStorage
 */
function loadStatesFromStorage(): Record<string, ProjectTimerState> {
  if (typeof window === 'undefined') return {};

  try {
    const saved = localStorage.getItem(TIMER_STATES_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

/**
 * Saves all project timer states to localStorage
 */
function saveStatesToStorage(states: Record<string, ProjectTimerState>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TIMER_STATES_STORAGE_KEY, JSON.stringify(states));
}

/**
 * Hook for managing timer state persistence
 * Provides methods to load, save, and manage timer states in localStorage
 */
export function useTimerPersistence(): UseTimerPersistenceReturn {
  // Use ref to cache loaded states and avoid unnecessary localStorage reads
  const statesRef = useRef<Record<string, ProjectTimerState>>(loadStatesFromStorage());

  const loadAllStates = useCallback((): Record<string, ProjectTimerState> => {
    statesRef.current = loadStatesFromStorage();
    return statesRef.current;
  }, []);

  const saveAllStates = useCallback((states: Record<string, ProjectTimerState>): void => {
    statesRef.current = states;
    saveStatesToStorage(states);
  }, []);

  const getProjectState = useCallback((projectId: string): ProjectTimerState | undefined => {
    const states = loadStatesFromStorage();
    return states[projectId];
  }, []);

  const saveProjectState = useCallback((projectId: string, state: ProjectTimerState): void => {
    const states = loadStatesFromStorage();
    states[projectId] = state;
    statesRef.current = states;
    saveStatesToStorage(states);
  }, []);

  const clearProjectState = useCallback((projectId: string): void => {
    const states = loadStatesFromStorage();
    delete states[projectId];
    statesRef.current = states;
    saveStatesToStorage(states);
  }, []);

  return {
    loadAllStates,
    saveAllStates,
    getProjectState,
    saveProjectState,
    clearProjectState,
    getDefaultTimerState,
  };
}
