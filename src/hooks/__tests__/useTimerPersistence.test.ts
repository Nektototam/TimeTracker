/**
 * Tests for useTimerPersistence hook
 * TDD: RED phase - these tests should fail initially
 */
import { renderHook, act } from '@testing-library/react';
import { TIMER_STATES_STORAGE_KEY } from '../../lib/constants/time';

// Types that will be defined in the hook
interface ProjectTimerState {
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

describe('useTimerPersistence', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('loadAllStates', () => {
    test('returns empty object when localStorage is empty', () => {
      const { useTimerPersistence } = require('../useTimerPersistence');
      const { result } = renderHook(() => useTimerPersistence());

      const states = result.current.loadAllStates();
      expect(states).toEqual({});
    });

    test('returns parsed states from localStorage', () => {
      const mockState: Record<string, ProjectTimerState> = {
        'project-1': {
          isRunning: true,
          isPaused: false,
          startTime: 1000,
          elapsedTime: 5000,
          pausedElapsedTime: 0,
          workTypeId: null,
          workTypeName: '',
          lastHourMark: 0,
          last15MinMark: 0,
          timeLimit: null,
        },
      };
      localStorage.setItem(TIMER_STATES_STORAGE_KEY, JSON.stringify(mockState));

      const { useTimerPersistence } = require('../useTimerPersistence');
      const { result } = renderHook(() => useTimerPersistence());

      const states = result.current.loadAllStates();
      expect(states).toEqual(mockState);
    });

    test('returns empty object on invalid JSON', () => {
      localStorage.setItem(TIMER_STATES_STORAGE_KEY, 'invalid-json');

      const { useTimerPersistence } = require('../useTimerPersistence');
      const { result } = renderHook(() => useTimerPersistence());

      const states = result.current.loadAllStates();
      expect(states).toEqual({});
    });
  });

  describe('saveAllStates', () => {
    test('saves states to localStorage', () => {
      const { useTimerPersistence } = require('../useTimerPersistence');
      const { result } = renderHook(() => useTimerPersistence());

      const mockState: Record<string, ProjectTimerState> = {
        'project-1': {
          isRunning: false,
          isPaused: true,
          startTime: 0,
          elapsedTime: 10000,
          pausedElapsedTime: 10000,
          workTypeId: 'work-1',
          workTypeName: 'Development',
          lastHourMark: 0,
          last15MinMark: 0,
          timeLimit: 3600000,
        },
      };

      act(() => {
        result.current.saveAllStates(mockState);
      });

      const saved = localStorage.getItem(TIMER_STATES_STORAGE_KEY);
      expect(JSON.parse(saved!)).toEqual(mockState);
    });
  });

  describe('getProjectState', () => {
    test('returns undefined for non-existent project', () => {
      const { useTimerPersistence } = require('../useTimerPersistence');
      const { result } = renderHook(() => useTimerPersistence());

      const state = result.current.getProjectState('non-existent');
      expect(state).toBeUndefined();
    });

    test('returns state for existing project', () => {
      const mockState: Record<string, ProjectTimerState> = {
        'project-1': {
          isRunning: true,
          isPaused: false,
          startTime: 1000,
          elapsedTime: 5000,
          pausedElapsedTime: 0,
          workTypeId: null,
          workTypeName: '',
          lastHourMark: 0,
          last15MinMark: 0,
          timeLimit: null,
        },
      };
      localStorage.setItem(TIMER_STATES_STORAGE_KEY, JSON.stringify(mockState));

      const { useTimerPersistence } = require('../useTimerPersistence');
      const { result } = renderHook(() => useTimerPersistence());

      const state = result.current.getProjectState('project-1');
      expect(state).toEqual(mockState['project-1']);
    });
  });

  describe('saveProjectState', () => {
    test('saves state for a specific project', () => {
      const { useTimerPersistence } = require('../useTimerPersistence');
      const { result } = renderHook(() => useTimerPersistence());

      const projectState: ProjectTimerState = {
        isRunning: true,
        isPaused: false,
        startTime: Date.now(),
        elapsedTime: 0,
        pausedElapsedTime: 0,
        workTypeId: null,
        workTypeName: '',
        lastHourMark: 0,
        last15MinMark: 0,
        timeLimit: null,
      };

      act(() => {
        result.current.saveProjectState('project-1', projectState);
      });

      const saved = JSON.parse(localStorage.getItem(TIMER_STATES_STORAGE_KEY)!);
      expect(saved['project-1']).toEqual(projectState);
    });

    test('preserves other project states when saving', () => {
      const existingState: Record<string, ProjectTimerState> = {
        'project-2': {
          isRunning: false,
          isPaused: true,
          startTime: 0,
          elapsedTime: 5000,
          pausedElapsedTime: 5000,
          workTypeId: null,
          workTypeName: '',
          lastHourMark: 0,
          last15MinMark: 0,
          timeLimit: null,
        },
      };
      localStorage.setItem(TIMER_STATES_STORAGE_KEY, JSON.stringify(existingState));

      const { useTimerPersistence } = require('../useTimerPersistence');
      const { result } = renderHook(() => useTimerPersistence());

      const newProjectState: ProjectTimerState = {
        isRunning: true,
        isPaused: false,
        startTime: Date.now(),
        elapsedTime: 0,
        pausedElapsedTime: 0,
        workTypeId: null,
        workTypeName: '',
        lastHourMark: 0,
        last15MinMark: 0,
        timeLimit: null,
      };

      act(() => {
        result.current.saveProjectState('project-1', newProjectState);
      });

      const saved = JSON.parse(localStorage.getItem(TIMER_STATES_STORAGE_KEY)!);
      expect(saved['project-1']).toEqual(newProjectState);
      expect(saved['project-2']).toEqual(existingState['project-2']);
    });
  });

  describe('clearProjectState', () => {
    test('removes state for a specific project', () => {
      const mockState: Record<string, ProjectTimerState> = {
        'project-1': {
          isRunning: true,
          isPaused: false,
          startTime: 1000,
          elapsedTime: 5000,
          pausedElapsedTime: 0,
          workTypeId: null,
          workTypeName: '',
          lastHourMark: 0,
          last15MinMark: 0,
          timeLimit: null,
        },
        'project-2': {
          isRunning: false,
          isPaused: true,
          startTime: 0,
          elapsedTime: 10000,
          pausedElapsedTime: 10000,
          workTypeId: null,
          workTypeName: '',
          lastHourMark: 0,
          last15MinMark: 0,
          timeLimit: null,
        },
      };
      localStorage.setItem(TIMER_STATES_STORAGE_KEY, JSON.stringify(mockState));

      const { useTimerPersistence } = require('../useTimerPersistence');
      const { result } = renderHook(() => useTimerPersistence());

      act(() => {
        result.current.clearProjectState('project-1');
      });

      const saved = JSON.parse(localStorage.getItem(TIMER_STATES_STORAGE_KEY)!);
      expect(saved['project-1']).toBeUndefined();
      expect(saved['project-2']).toEqual(mockState['project-2']);
    });
  });

  describe('getDefaultTimerState', () => {
    test('returns default timer state with all values reset', () => {
      const { useTimerPersistence } = require('../useTimerPersistence');
      const { result } = renderHook(() => useTimerPersistence());

      const defaultState = result.current.getDefaultTimerState();

      expect(defaultState).toEqual({
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
      });
    });
  });
});
