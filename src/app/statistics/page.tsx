"use client";

import React from 'react';
import NavBar from '../../components/NavBar';
import ProtectedRoute from '../../components/ProtectedRoute';

function StatisticsPage() {
  return (
    <div className="app-container">
      <div id="stats-screen" className="screen">
        <div className="stats-header">
          <h1>Статистика</h1>
        </div>
        
        <div className="stats-total slide-up">
          <div className="stats-total-item">
            <span className="stats-total-value">32:15</span>
            <span className="stats-total-label">За неделю</span>
          </div>
          <div className="stats-total-item">
            <span className="stats-total-value">121:30</span>
            <span className="stats-total-label">За месяц</span>
          </div>
          <div className="stats-total-item">
            <span className="stats-total-value">1453:45</span>
            <span className="stats-total-label">Всего</span>
          </div>
        </div>
        
        <div className="project-summary">
          <h2 className="project-summary-title">Распределение времени</h2>
          <div className="project-list">
            <div className="project-item">
              <div className="project-item-info">
                <span className="project-item-name">Веб-разработка</span>
                <span className="project-item-time">18:45</span>
              </div>
              <div className="project-item-bar">
                <div className="project-item-progress" style={{width: '65%', backgroundColor: 'var(--primary-color)'}}></div>
              </div>
            </div>
            
            <div className="project-item">
              <div className="project-item-info">
                <span className="project-item-name">Дизайн</span>
                <span className="project-item-time">8:30</span>
              </div>
              <div className="project-item-bar">
                <div className="project-item-progress" style={{width: '25%', backgroundColor: 'var(--success-color)'}}></div>
              </div>
            </div>
            
            <div className="project-item">
              <div className="project-item-info">
                <span className="project-item-name">Совещания</span>
                <span className="project-item-time">5:00</span>
              </div>
              <div className="project-item-bar">
                <div className="project-item-progress" style={{width: '10%', backgroundColor: 'var(--warning-color)'}}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="activity-list">
          <h2 className="activity-list-title">Недавняя активность</h2>
          
          <div className="activity-item">
            <div className="activity-item-header">
              <span className="activity-item-date">Сегодня, 15:30</span>
              <span className="activity-item-duration">1:45</span>
            </div>
            <div className="activity-item-name">Веб-разработка</div>
          </div>
          
          <div className="activity-item">
            <div className="activity-item-header">
              <span className="activity-item-date">Сегодня, 11:15</span>
              <span className="activity-item-duration">2:30</span>
            </div>
            <div className="activity-item-name">Дизайн мобильного приложения</div>
          </div>
          
          <div className="activity-item">
            <div className="activity-item-header">
              <span className="activity-item-date">Вчера, 16:40</span>
              <span className="activity-item-duration">3:20</span>
            </div>
            <div className="activity-item-name">Разработка API</div>
          </div>
        </div>
        
        <NavBar />
      </div>
    </div>
  );
}

export default function Statistics() {
  return (
    <ProtectedRoute>
      <StatisticsPage />
    </ProtectedRoute>
  );
} 