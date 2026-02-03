"use client";

import { useEffect, useCallback } from 'react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
}

export function useKeyboardShortcuts(
  shortcuts: Shortcut[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Ignore if user is typing in an input/textarea
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Allow Escape in inputs
      if (event.key !== 'Escape') {
        return;
      }
    }

    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
      const metaMatch = shortcut.meta ? event.metaKey : true;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase() ||
                       event.code.toLowerCase() === shortcut.key.toLowerCase();

      if (keyMatch && ctrlMatch && shiftMatch) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.action();
        return;
      }
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Pre-defined shortcut creators for common actions
export function createTimerShortcuts(
  toggleTimer: () => void,
  finishTask: () => void,
  openCommandPalette: () => void
): Shortcut[] {
  return [
    {
      key: 'Space',
      action: toggleTimer,
      description: 'Start/Pause timer',
    },
    {
      key: 'Enter',
      ctrl: true,
      action: finishTask,
      description: 'Finish current task',
    },
    {
      key: 'k',
      ctrl: true,
      action: openCommandPalette,
      description: 'Open command palette',
    },
    {
      key: 'Escape',
      action: () => {}, // Will be overridden by components
      description: 'Close modal/cancel',
      preventDefault: false,
    },
  ];
}

export function createProjectShortcuts(
  switchProject: (index: number) => void
): Shortcut[] {
  return [
    { key: '1', action: () => switchProject(0), description: 'Switch to project 1' },
    { key: '2', action: () => switchProject(1), description: 'Switch to project 2' },
    { key: '3', action: () => switchProject(2), description: 'Switch to project 3' },
    { key: '4', action: () => switchProject(3), description: 'Switch to project 4' },
    { key: '5', action: () => switchProject(4), description: 'Switch to project 5' },
  ];
}
