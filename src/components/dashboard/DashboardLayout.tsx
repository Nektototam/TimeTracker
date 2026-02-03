"use client";

import { useState, useCallback } from 'react';
import { useTimer } from '../../contexts/TimerContext';
import { BentoGrid, BentoItem } from '../ui/BentoGrid';
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
      <BentoGrid className="max-w-6xl mx-auto">
        {/* Timer Widget - Hero (2x2) */}
        <BentoItem colSpan={2} rowSpan={2}>
          <TimerWidget />
        </BentoItem>

        {/* Today Stats (1x2) */}
        <BentoItem rowSpan={2}>
          <TodayStatsWidget />
        </BentoItem>

        {/* Week Activity Chart (3x1) */}
        <BentoItem colSpan={3}>
          <WeekChartWidget />
        </BentoItem>

        {/* Project Distribution (1x1) */}
        <BentoItem>
          <ProjectDistributionWidget />
        </BentoItem>

        {/* Pomodoro (1x1) */}
        <BentoItem>
          <PomodoroWidget />
        </BentoItem>

        {/* Quick Actions (1x1) */}
        <BentoItem>
          <QuickActionsWidget onOpenCommandPalette={openCommandPalette} />
        </BentoItem>
      </BentoGrid>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={closeCommandPalette}
      />
    </>
  );
}
