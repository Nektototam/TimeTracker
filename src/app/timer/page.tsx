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
    <div className="app-container">
      <div className="screen">
        <h1 className="text-center text-primary-dark font-bold text-3xl mb-6">TimeTracker</h1>
        
        <div className="w-96 min-w-[280px] mx-auto mb-4"> 
          <ProjectSelect value={project} onChange={setProject} />
        </div>
        
        <TimerCircle
          isRunning={isRunning}
          startTime={startTime}
          elapsedTime={elapsedTime}
          status={timerStatus}
          timeValue={timerValue}
          project={projectText}
        />
        
        {/* Wrap TimerButton in a div with the same width and centering */}
        <div className="w-96 min-w-[280px] mx-auto mb-6"> 
          <TimerButton 
            isRunning={isRunning} 
            onClick={toggleTimer}
            onFinish={finishTask}
          />
        </div>
        
        <div className="daily-total">
          <div className="daily-total-label">{t('timer.dailyTotal')}</div>
          <div className="daily-total-value">{dailyTotal}</div>
          
          <div className="flex justify-center items-center mt-3 text-sm text-gray-500">
            <span className="mr-2">📅</span>
            {new Date().toLocaleDateString()}
          </div>
        </div>
        
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