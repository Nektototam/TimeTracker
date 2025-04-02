"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';

interface TimerButtonProps {
  isRunning: boolean;
  onClick: () => void;
  onFinish?: () => void;
}

export default function TimerButton({ isRunning, onClick, onFinish }: TimerButtonProps) {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-wrap gap-16 justify-center mt-10 p-4">
      <div className="m-4">
        <button 
          onClick={onClick}
          className={`
            bg-[#ecf0f3] text-[#6c5ce7] font-medium 
            ${isRunning 
              ? "min-h-10 px-4 py-2 text-sm rounded-[14px]" 
              : "min-h-12 min-w-[130px] px-6 py-3 text-base rounded-[18px]"
            }
            shadow-[6px_6px_10px_0_rgba(0,0,0,0.1),-6px_-6px_10px_0_rgba(255,255,255,0.8)]
            transition-all duration-200
            hover:shadow-[4px_4px_6px_0_rgba(0,0,0,0.1),-4px_-4px_6px_0_rgba(255,255,255,0.8)]
            active:shadow-[inset_4px_4px_6px_0_rgba(0,0,0,0.1),inset_-4px_-4px_6px_0_rgba(255,255,255,0.8)]
            disabled:opacity-50 disabled:pointer-events-none
          `}
        >
          {isRunning ? t('timer.pause') : "Start Timer"}
        </button>
      </div>
      
      {isRunning && onFinish && (
        <div className="m-4">
          <button 
            onClick={onFinish}
            className="
              bg-[#ecf0f3] text-[#ff3d71] font-medium
              min-h-12 min-w-[130px] px-6 py-3 text-base rounded-[18px]
              shadow-[6px_6px_10px_0_rgba(0,0,0,0.1),-6px_-6px_10px_0_rgba(255,255,255,0.8)]
              transition-all duration-200
              hover:shadow-[4px_4px_6px_0_rgba(0,0,0,0.1),-4px_-4px_6px_0_rgba(255,255,255,0.8)]
              active:shadow-[inset_4px_4px_6px_0_rgba(0,0,0,0.1),inset_-4px_-4px_6px_0_rgba(255,255,255,0.8)]
              disabled:opacity-50 disabled:pointer-events-none
            "
          >
            {t('timer.stop')}
          </button>
        </div>
      )}
    </div>
  );
} 