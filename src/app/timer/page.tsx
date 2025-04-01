"use client";

import React, { useState } from 'react';
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
  const [showAddEntryForm, setShowAddEntryForm] = useState(false);
  
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
  
  const handleAddEntry = () => {
    setShowAddEntryForm(true);
    // Здесь будет логика для отображения формы добавления записи времени вручную
  };
  
  return (
    <div className="app-container">
      <div className="screen">
        <TopBar 
          showProjectInfo={true}
          showPeriodSelector={false}
          showAddButton={true}
          onAddClick={handleAddEntry}
          clientName="Client" // Это можно заменить на реальное имя клиента из контекста
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