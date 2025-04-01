'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useTimer } from '../contexts/TimerContext';

interface TopBarProps {
  title?: string;
  onPeriodChange?: (period: 'day' | 'week' | 'month') => void;
  showPeriodSelector?: boolean;
  showProjectInfo?: boolean;
  showAddButton?: boolean;
  showSettingsButton?: boolean;
  clientName?: string;
  onAddClick?: () => void;
}

export default function TopBar({
  title,
  onPeriodChange,
  showPeriodSelector = true,
  showProjectInfo = false,
  showAddButton = false,
  showSettingsButton = true,
  clientName,
  onAddClick
}: TopBarProps) {
  const { t } = useTranslation();
  const [activePeriod, setActivePeriod] = useState<'day' | 'week' | 'month'>('day');
  const { projectText } = useTimer();
  
  const handlePeriodChange = (period: 'day' | 'week' | 'month') => {
    setActivePeriod(period);
    if (onPeriodChange) {
      onPeriodChange(period);
    }
  };

  return (
    <div className="top-bar">
      {showProjectInfo ? (
        <div>
          <div className="top-bar-title">
            {title || projectText || t('app.title')}
          </div>
          {clientName && (
            <div className="top-bar-subtitle">
              {clientName}
            </div>
          )}
        </div>
      ) : (
        <div className="top-bar-title">
          {title || t('app.title')}
        </div>
      )}
      
      <div className="flex items-center gap-3">
        {showPeriodSelector && (
          <div className="period-selector">
            <button
              onClick={() => handlePeriodChange('day')}
              className={`period-button ${activePeriod === 'day' ? 'active' : ''}`}
            >
              {t('periods.day')}
            </button>
            <button
              onClick={() => handlePeriodChange('week')}
              className={`period-button ${activePeriod === 'week' ? 'active' : ''}`}
            >
              {t('periods.week')}
            </button>
            <button
              onClick={() => handlePeriodChange('month')}
              className={`period-button ${activePeriod === 'month' ? 'active' : ''}`}
            >
              {t('periods.month')}
            </button>
          </div>
        )}
        
        {showAddButton && (
          <button
            onClick={onAddClick}
            className="add-button ripple-effect"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 6L12 18M18 12L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
        
        {showSettingsButton && (
          <Link href="/settings" className="relative">
            <button className="settings-button ripple-effect">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12.0001 20.99V21M18.3601 18.36L18.3601 18.3601M21.0001 12H20.9901M18.3601 5.64L18.3601 5.6401M12.0001 3.01V3M5.6401 5.64L5.6401 5.6401M3.0101 12H3.0001M5.6401 18.36L5.6401 18.3601" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </Link>
        )}
      </div>
    </div>
  );
} 