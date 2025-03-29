"use client";

import React from 'react';
import NavBar from '../../components/NavBar';
import PomodoroTimer from '../../components/PomodoroTimer';
import ProtectedRoute from '../../components/ProtectedRoute';

function PomodoroPage() {
  return (
    <div className="app-container">
      <div id="pomodoro-screen" className="screen">
        <div className="stats-header">
          <h1>Метод Помидора</h1>
        </div>
        
        <div className="text-center slide-up">
          <p className="text-secondary mb-6">Работайте с полной концентрацией, затем делайте перерывы для отдыха.</p>
        </div>
        
        <PomodoroTimer />
        
        <NavBar />
      </div>
    </div>
  );
}

export default function Pomodoro() {
  return (
    <ProtectedRoute>
      <PomodoroPage />
    </ProtectedRoute>
  );
} 