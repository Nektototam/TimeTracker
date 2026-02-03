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
      <div
        className="grid gap-5"
        style={{
          gridAutoRows: 'minmax(180px, auto)',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))'
        }}
      >
        {/* Timer Widget - Hero (2x2) */}
        <div style={{ gridColumn: 'span 2 / span 2', gridRow: 'span 2 / span 2' }}>
          <TimerWidget />
        </div>

        {/* Today Stats (1x2) */}
        <div style={{ gridRow: 'span 2 / span 2' }}>
          <TodayStatsWidget />
        </div>

        {/* Week Activity Chart (3x1) */}
        <div style={{ gridColumn: 'span 3 / span 3' }}>
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
