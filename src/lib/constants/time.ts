/**
 * Time-related constants used throughout the application
 */

// Seconds
export const SECONDS_PER_MINUTE = 60;
export const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;

// Milliseconds
export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = SECONDS_PER_MINUTE * MS_PER_SECOND;
export const MS_PER_HOUR = SECONDS_PER_HOUR * MS_PER_SECOND;
export const MS_PER_15_MINUTES = 15 * MS_PER_MINUTE;

// Thresholds
export const MIN_ENTRY_DURATION_MS = MS_PER_MINUTE; // 1 minute minimum for saving entries
export const QUICK_TOGGLE_THRESHOLD_MS = 5 * MS_PER_SECOND; // 5 seconds for quick pause without saving
export const MIN_VISIBLE_DURATION_SECONDS = SECONDS_PER_MINUTE; // 1 minute minimum for display

// Storage keys
export const TIMER_STATES_STORAGE_KEY = 'timetracker-project-timers';
export const POMODORO_STATE_STORAGE_KEY = 'timetracker-pomodoro-state';

// Default values
export const DEFAULT_TIMER_VALUE = '00:00:00';
export const DEFAULT_POMODORO_WORK_MINUTES = 25;
export const DEFAULT_POMODORO_REST_MINUTES = 5;
