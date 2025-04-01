"use client";

import React from 'react';
import NavBar from '../../components/NavBar';
import TopBar from '../../components/TopBar';
import ProjectSelect from '../../components/ProjectSelect';
import TimerCircle from '../../components/TimerCircle';
import TimerButton from '../../components/TimerButton';
import DailyTotal from '../../components/DailyTotal';
import { useTimer } from '../../contexts/TimerContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useTranslation } from 'react-i18next';

function TimerApp() {
  const { t } = useTranslation();
  const { 
    project, 
    projectText, 
    isRunning, 
    startTime, 
    elapsedTime, 
    timerStatus, 
    timerValue, 
    dailyTotalMs, 
    setProject, 
    toggleTimer,
    finishTask
  } = useTimer();
  
  return (
    <div className="app-container">
      <div className="screen">
        <TopBar 
          title={t('nav.timer')} 
          showPeriodSelector={false}
        />
        
        <ProjectSelect value={project} onChange={setProject} />
        
        <TimerCircle
          isRunning={isRunning}
          startTime={startTime}
          elapsedTime={elapsedTime}
          status={timerStatus}
          timeValue={timerValue}
          project={projectText}
        />
        
        <TimerButton 
          isRunning={isRunning} 
          onClick={toggleTimer}
          onFinish={finishTask}
        />
        
        <DailyTotal totalTimeToday={dailyTotalMs} />
        
        <NavBar />
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