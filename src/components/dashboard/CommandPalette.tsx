"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTimer } from '../../contexts/TimerContext';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Command {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const { t } = useTranslation();
  const { toggleTimer, finishTask, isRunning, isPaused, switchProject } = useTimer();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    {
      id: 'toggle-timer',
      label: isRunning ? t('timer.pause') : isPaused ? t('timer.resume') : t('timer.start'),
      icon: isRunning ? '\u23F8' : '\u25B6',
      shortcut: 'Space',
      action: () => {
        toggleTimer();
        onClose();
      },
    },
    {
      id: 'finish-task',
      label: t('timer.stop'),
      icon: '\u23F9',
      shortcut: 'Cmd+Enter',
      action: () => {
        finishTask();
        onClose();
      },
    },
    {
      id: 'project-development',
      label: t('timer.standard.development'),
      icon: '\uD83D\uDCBB',
      shortcut: '1',
      action: () => {
        switchProject('development', t('timer.standard.development'));
        onClose();
      },
    },
    {
      id: 'project-design',
      label: t('timer.standard.design'),
      icon: '\uD83C\uDFA8',
      shortcut: '2',
      action: () => {
        switchProject('design', t('timer.standard.design'));
        onClose();
      },
    },
    {
      id: 'project-marketing',
      label: t('timer.standard.marketing'),
      icon: '\uD83D\uDCE2',
      shortcut: '3',
      action: () => {
        switchProject('marketing', t('timer.standard.marketing'));
        onClose();
      },
    },
    {
      id: 'project-meeting',
      label: t('timer.standard.meeting'),
      icon: '\uD83D\uDC65',
      shortcut: '4',
      action: () => {
        switchProject('meeting', t('timer.standard.meeting'));
        onClose();
      },
    },
    {
      id: 'project-other',
      label: t('timer.standard.other'),
      icon: '\uD83D\uDCDD',
      shortcut: '5',
      action: () => {
        switchProject('other', t('timer.standard.other'));
        onClose();
      },
    },
  ];

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % commands.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + commands.length) % commands.length);
        break;
      case 'Enter':
        e.preventDefault();
        commands[selectedIndex].action();
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [commands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Palette */}
      <div
        className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="border-b border-gray-100 p-3">
          <input
            ref={inputRef}
            type="text"
            placeholder={t('dashboard.searchCommands')}
            className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
            readOnly
          />
        </div>

        {/* Commands list */}
        <div className="max-h-80 overflow-y-auto py-2">
          {commands.map((command, index) => (
            <button
              key={command.id}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2 text-left transition-colors",
                index === selectedIndex
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 hover:bg-gray-50"
              )}
              onClick={command.action}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="text-lg">{command.icon}</span>
              <span className="flex-1">{command.label}</span>
              {command.shortcut && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                  {command.shortcut}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-400 flex justify-between">
          <span>\u2191\u2193 {t('dashboard.navigate')}</span>
          <span>\u23CE {t('dashboard.select')}</span>
          <span>Esc {t('dashboard.close')}</span>
        </div>
      </div>
    </div>
  );
}
