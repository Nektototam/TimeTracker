"use client";

import React from 'react';
import NavBar from '../../components/NavBar';
import ProtectedRoute from '../../components/ProtectedRoute';

function ReportsPage() {
  return (
    <div className="app-container">
      <div id="report-screen" className="screen">
        <div className="report-header">
          <h1>Отчет за период</h1>
        </div>
        
        <div className="period-tabs slide-up">
          <button className="period-tab active">Неделя</button>
          <button className="period-tab">Месяц</button>
          <button className="period-tab">Квартал</button>
          <button className="period-tab">Свой</button>
        </div>
        
        <div className="date-selector slide-up">
          <button className="date-nav prev">◀</button>
          <span className="date-range">15 - 21 мая 2023</span>
          <button className="date-nav next">▶</button>
        </div>
        
        <div className="chart-container slide-up">
          <div className="chart-title">Активность по дням</div>
          <div className="chart-placeholder" style={{height: '180px', backgroundColor: 'rgba(94, 114, 228, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            График активности
          </div>
        </div>
        
        <div className="project-summary">
          <h2 className="project-summary-title">Проекты</h2>
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
        
        <div className="report-total slide-up">
          <div className="report-total-label">Всего за период</div>
          <div className="report-total-value">32:15</div>
        </div>
        
        <div className="report-actions slide-up">
          <button className="report-action">
            <span className="report-action-icon">🖨️</span>
            <span className="report-action-text">Печать</span>
          </button>
          <button className="report-action">
            <span className="report-action-icon">📋</span>
            <span className="report-action-text">Копировать</span>
          </button>
          <button className="report-action">
            <span className="report-action-icon">📤</span>
            <span className="report-action-text">Экспорт</span>
          </button>
        </div>
        
        <NavBar />
      </div>
    </div>
  );
}

export default function Reports() {
  return (
    <ProtectedRoute>
      <ReportsPage />
    </ProtectedRoute>
  );
} 