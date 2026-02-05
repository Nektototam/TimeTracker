/**
 * Time-related constants used throughout the application
 */

// Milliseconds
export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = 60 * MS_PER_SECOND;
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;
export const MS_PER_15_MINUTES = 15 * MS_PER_MINUTE;

// Thresholds
export const MIN_ENTRY_DURATION_MS = MS_PER_MINUTE; // 1 minute minimum for saving entries
export const QUICK_TOGGLE_THRESHOLD_MS = 5 * MS_PER_SECOND; // 5 seconds for quick pause without saving

// Storage keys
export const TIMER_STATES_STORAGE_KEY = 'timetracker-project-timers';
export const POMODORO_STATE_STORAGE_KEY = 'timetracker-pomodoro-state';

// Default values
export const DEFAULT_TIMER_VALUE = '00:00:00';
