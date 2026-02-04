"use client";

import { useState, useCallback } from 'react';
import { useTimer } from '../../contexts/TimerContext';
import { TimerWidget } from './TimerWidget';
import { TodayStatsWidget } from './TodayStatsWidget';
import { WeekChartWidget } from './WeekChartWidget';
import { ProjectDistributionWidget } from './ProjectDistributionWidget';
import { PomodoroWidget } from './PomodoroWidget';
import { QuickActionsWidget } from './QuickActionsWidget';
import { CommandPalette } from './CommandPalette';
import { useKeyboardShortcuts, createTimerShortcuts } from '../../hooks/useKeyboardShortcuts';

export function DashboardLayout() {
  const { toggleTimer, finishTask } = useTimer();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const openCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(true);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(false);
  }, []);

  // Setup keyboard shortcuts
  const shortcuts = createTimerShortcuts(
    toggleTimer,
    finishTask,
    openCommandPalette
  );

  useKeyboardShortcuts(shortcuts, { enabled: !isCommandPaletteOpen });

  return (
    <>
      <div className="grid gap-6 lg:auto-rows-[minmax(180px,auto)] lg:grid-cols-3">
        {/* Timer Widget - Hero (2x2) */}
        <div className="lg:col-span-2 lg:row-span-2">
          <TimerWidget />
        </div>

        {/* Today Stats (1x2) */}
        <div className="lg:row-span-2">
          <TodayStatsWidget />
        </div>

        {/* Week Activity Chart (3x1) */}
        <div className="lg:col-span-3">
          <WeekChartWidget />
        </div>

        {/* Project Distribution (1x1) */}
        <div>
          <ProjectDistributionWidget />
        </div>

        {/* Pomodoro (1x1) */}
        <div>
          <PomodoroWidget />
        </div>

        {/* Quick Actions (1x1) */}
        <div>
          <QuickActionsWidget onOpenCommandPalette={openCommandPalette} />
        </div>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={closeCommandPalette}
      />
    </>
  );
}
