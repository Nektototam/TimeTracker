"use client";

import React, { useEffect, useState, useCallback } from 'react';
import NavBar from '../components/NavBar';
import ProjectSelect from '../components/ProjectSelect';
import TimerCircle from '../components/TimerCircle';
import TimerButton from '../components/TimerButton';
import { useTimer } from '../contexts/TimerContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { useTimeEntries } from '../hooks/useTimeEntries';

function TimerApp() {
  const { 
    project, 
    projectText, 
    isRunning, 
    startTime, 
    elapsedTime, 
    timerStatus, 
    timerValue, 
    dailyTotal, 
    setProject, 
    toggleTimer,
    finishTask,
    timeLimit,
    formatTime
  } = useTimer();
  
  return (
    <div className="app-container">
      <div className="screen">
        <h1 className="text-center text-[#32325d] font-bold text-2xl mb-4">TimeTracker</h1>
        
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
        
        <div className="daily-total">
          <div className="daily-total-label">Ранее сегодня выполнено</div>
          <div className="daily-total-value">{dailyTotal}</div>
        </div>
        
        <NavBar />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <TimerApp />
    </ProtectedRoute>
  );
}
