"use client";

import React from 'react';
import NavBar from '../components/NavBar';
import ProjectSelect from '../components/ProjectSelect';
import TimerCircle from '../components/TimerCircle';
import TimerButton from '../components/TimerButton';
import { useTimer } from '../contexts/TimerContext';
import ProtectedRoute from '../components/ProtectedRoute';

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
    toggleTimer 
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
        
        <TimerButton isRunning={isRunning} onClick={toggleTimer} />
        
        <div className="daily-total">
          <div className="daily-total-label">Сегодня отработано</div>
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
