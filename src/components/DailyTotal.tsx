import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDuration } from '../utils/timeUtils';

interface DailyTotalProps {
  totalTimeToday: number;
}

export default function DailyTotal({ totalTimeToday }: DailyTotalProps) {
  const { t } = useTranslation();
  
  return (
    <div className="daily-stats">
      <div className="daily-stats-content">
        <div className="daily-stats-label">
          {t('timer.dailyTotal')}
        </div>
        <div className="daily-stats-value">
          {formatDuration(totalTimeToday)}
        </div>
      </div>
      
      <div className="daily-stats-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
} 