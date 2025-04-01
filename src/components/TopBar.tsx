'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Button } from './ui/Button';

interface TopBarProps {
  title?: string;
  onPeriodChange?: (period: 'day' | 'week' | 'month') => void;
  showPeriodSelector?: boolean;
  showSettingsButton?: boolean;
}

export default function TopBar({ 
  title, 
  onPeriodChange,
  showPeriodSelector = true,
  showSettingsButton = true
}: TopBarProps) {
  const { t } = useTranslation();
  const [activePeriod, setActivePeriod] = useState<'day' | 'week' | 'month'>('day');
  
  const handlePeriodChange = (period: 'day' | 'week' | 'month') => {
    setActivePeriod(period);
    if (onPeriodChange) {
      onPeriodChange(period);
    }
  };

  return (
    <div className="sticky top-0 z-20 bg-white px-5 py-4 flex items-center justify-between shadow-sm border-b border-gray-100">
      <div className="font-bold text-xl text-gray-800">
        {title || t('app.title')}
      </div>
      
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
        
        {showSettingsButton && (
          <Link href="/settings" className="relative">
            <Button 
              variant="ghost" 
              size="sm"
              rounded="full"
              className="text-gray-600 hover:bg-gray-100 p-2 flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19.4 15C19.1277 15.6171 19.2583 16.3378 19.73 16.82L19.79 16.88C20.1837 17.2737 20.401 17.8098 20.4001 18.37C20.4001 18.9302 20.1837 19.4663 19.79 19.86C19.3963 20.2537 18.8602 20.4701 18.3 20.4701C17.7398 20.4701 17.2037 20.2537 16.81 19.86L16.75 19.8C16.2678 19.3283 15.5471 19.1977 14.93 19.47C14.3337 19.7338 13.9816 20.3187 14 20.95V21C14 21.5304 13.7893 22.0391 13.4142 22.4142C13.0391 22.7893 12.5304 23 12 23C11.4696 23 10.9609 22.7893 10.5858 22.4142C10.2107 22.0391 10 21.5304 10 21V20.91C10.0034 20.2322 9.60339 19.6125 8.98 19.36C8.36289 19.0877 7.64221 19.2183 7.16 19.69L7.1 19.75C6.70628 20.1437 6.17021 20.3601 5.61 20.3601C5.04979 20.3601 4.51372 20.1437 4.12 19.75C3.72629 19.3563 3.50992 18.8202 3.50992 18.26C3.50992 17.6998 3.72629 17.1637 4.12 16.77L4.18 16.71C4.65167 16.2278 4.78231 15.5071 4.51 14.89C4.24621 14.2937 3.66131 13.9416 3.03 13.96H2.99996C2.46957 13.96 1.96086 13.7493 1.58579 13.3742C1.21071 12.9991 1 12.4904 1 11.96C1 11.4296 1.21071 10.9209 1.58579 10.5458C1.96086 10.1707 2.46957 9.96 2.99996 9.96H3.08996C3.76778 9.96339 4.38746 9.56338 4.64 8.94C4.91231 8.32289 4.78167 7.60221 4.31 7.12L4.25 7.06C3.85629 6.66628 3.63992 6.13021 3.63992 5.57C3.63992 5.00979 3.85629 4.47372 4.25 4.08C4.64372 3.68629 5.17979 3.46992 5.74 3.46992C6.30021 3.46992 6.83628 3.68629 7.23 4.08L7.29 4.14C7.77221 4.61167 8.49289 4.74231 9.11 4.47H9.19996C9.79624 4.20621 10.1484 3.62131 10.13 2.99V2.95996C10.13 2.42957 10.3407 1.92086 10.7158 1.54579C11.0909 1.17071 11.5996 0.959961 12.13 0.959961C12.6604 0.959961 13.1691 1.17071 13.5442 1.54579C13.9193 1.92086 14.13 2.42957 14.13 2.95996V3.04996C14.1116 3.68127 14.4638 4.26617 15.06 4.53C15.6771 4.80231 16.3978 4.67167 16.88 4.2L16.94 4.14C17.3337 3.74629 17.8698 3.52992 18.43 3.52992C18.9902 3.52992 19.5263 3.74629 19.92 4.14C20.3137 4.53372 20.5301 5.06979 20.5301 5.63C20.5301 6.19021 20.3137 6.72628 19.92 7.12L19.86 7.18C19.3883 7.66221 19.2577 8.38289 19.53 9H19.61C20.2063 9.26379 20.5584 9.84869 20.54 10.48V10.52C20.54 11.0504 20.3293 11.5591 19.9542 11.9342C19.5791 12.3093 19.0704 12.52 18.54 12.52H18.45C17.8187 12.5166 17.2338 12.8688 16.97 13.46C16.6977 14.0771 16.8283 14.7978 17.3 15.28L17.36 15.34C17.7537 15.7337 17.9701 16.2698 17.9701 16.83C17.9701 17.3902 17.7537 17.9263 17.36 18.32C16.9663 18.7137 16.4302 18.9301 15.87 18.9301C15.3098 18.9301 14.7737 18.7137 14.38 18.32L14.32 18.26C13.8378 17.7883 13.1171 17.6577 12.5 17.93L12.48 17.93C11.8837 18.1938 11.5316 18.7787 11.55 19.41V19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
} 