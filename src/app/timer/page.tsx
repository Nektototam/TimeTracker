"use client";

import React from 'react';
import NavBar from '../../components/NavBar';
import ProjectSelect from '../../components/ProjectSelect';
import TimerCircle from '../../components/TimerCircle';
import TimerButton from '../../components/TimerButton';
import { useTimer } from '../../contexts/TimerContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useTranslation } from 'react-i18next';

function TimerApp() {
  const { t } = useTranslation();
  const { 
    project, 
    projectText, 
    isRunning,
    isPaused, 
    startTime, 
    elapsedTime, 
    timerStatus, 
    timerValue, 
    dailyTotal, 
    setProject, 
    toggleTimer,
    finishTask,
    formatTime
  } = useTimer();
  
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-lg">⏱️</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">TimeTracker</p>
              <h1 className="text-lg font-semibold text-foreground">{t('nav.timer')}</h1>
            </div>
          </div>
        </div>
      </header>

      <div
        className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8"
        style={{ gridTemplateColumns: '240px 1fr', alignItems: 'start' }}
      >
        <aside className="flex w-64 flex-col gap-4">
          <NavBar variant="sidebar" />
        </aside>

        <main className="space-y-6">
          <ProjectSelect value={project} onChange={setProject} />

          <div className="rounded-2xl border border-border bg-card p-6 shadow-app-sm">
            <TimerCircle
              isRunning={isRunning}
              startTime={startTime}
              elapsedTime={elapsedTime}
              status={timerStatus}
              timeValue={timerValue}
              project={projectText}
            />

            <div className="mt-4">
              <TimerButton
                isRunning={isRunning}
                isPaused={isPaused}
                onClick={toggleTimer}
                onFinish={finishTask}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-app-sm">
            <div className="text-sm text-muted-foreground">{t('timer.dailyTotal')}</div>
            <div className="mt-2 text-2xl font-semibold text-foreground">{dailyTotal}</div>
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>📅</span>
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Timer() {
  return (
    <ProtectedRoute>
      <TimerApp />
    </ProtectedRoute>
  );
} 