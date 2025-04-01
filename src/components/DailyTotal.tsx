import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDuration } from '../utils/timeUtils';

interface DailyTotalProps {
  totalTimeToday: number;
}

export default function DailyTotal({ totalTimeToday }: DailyTotalProps) {
  const { t } = useTranslation();
  
  return (
    <div className="bg-gradient-to-tr from-primary-50 to-white/90 rounded-xl p-5 shadow-md border border-primary-100/50 mb-20">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-base text-gray-600">
            {t('timer.dailyTotal')}
          </div>
          <div className="text-3xl font-bold text-primary-600 mt-1">
            {formatDuration(totalTimeToday)}
          </div>
        </div>
        
        <div className="w-14 h-14 bg-gradient-to-br from-primary-300 to-primary-600 rounded-full shadow-lg flex items-center justify-center text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
} 