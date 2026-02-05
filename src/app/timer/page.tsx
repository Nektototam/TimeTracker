"use client";

import React from 'react';
import AppShell from '../../components/AppShell';
import { ProjectSwitcher } from '../../components/ProjectSwitcher';
import { WorkTypeSwitcher } from '../../components/WorkTypeSwitcher';
import TimerCircle from '../../components/TimerCircle';
import TimerButton from '../../components/TimerButton';
import { useTimer } from '../../contexts/TimerContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from '../../components/ErrorBoundary';

function TimerApp() {
  const { t } = useTranslation();
  const {
    projectId,
    projectName,
    workTypeId,
    workTypeName,
    setWorkTypeId,
    setWorkTypeName,
    isRunning,
    isPaused,
    startTime,
    elapsedTime,
    timerStatus,
    timerValue,
    dailyTotal,
    toggleTimer,
    finishTask,
    formatTime,
    switchProject
  } = useTimer();
  
  return (
    <AppShell title={t('nav.timer')}>
      <ErrorBoundary sectionName="Timer">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-app-sm flex flex-col sm:flex-row gap-4">
          <ProjectSwitcher
            activeProjectId={projectId}
            onProjectChange={(newProjectId, newProjectName) => {
              switchProject(newProjectId, newProjectName);
            }}
          />
          <WorkTypeSwitcher
            projectId={projectId}
            activeWorkTypeId={workTypeId}
            onWorkTypeChange={(newWorkTypeId, newWorkTypeName) => {
              setWorkTypeId(newWorkTypeId);
              setWorkTypeName(newWorkTypeName || "");
            }}
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-app-sm">
          <TimerCircle
            isRunning={isRunning}
            startTime={startTime}
            elapsedTime={elapsedTime}
            status={timerStatus}
            timeValue={timerValue}
            project={projectName}
            workTypeName={workTypeName}
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
          <div className="mt-2 text-2xl font-semibold text-foreground">{formatTime(dailyTotal)}</div>
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>📅</span>
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </ErrorBoundary>
    </AppShell>
  );
}

export default function Timer() {
  return (
    <ProtectedRoute>
      <TimerApp />
    </ProtectedRoute>
  );
} 