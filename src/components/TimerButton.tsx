"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';

interface TimerButtonProps {
  isRunning: boolean;
  isPaused: boolean;
  onClick: () => void;
  onFinish?: () => void;
}

export default function TimerButton({ isRunning, isPaused, onClick, onFinish }: TimerButtonProps) {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-wrap gap-16 justify-center mt-10 p-4">
      <div className="m-4">
        <button 
          onClick={onClick}
          className={`
            ${isRunning 
              ? "bg-[#e8efff] text-[#6c5ce7] min-h-16 min-w-[160px] px-8 py-4 text-lg rounded-[20px]" 
              : isPaused 
                ? "bg-[#f0fff4] text-[#38a169] min-h-16 min-w-[160px] px-8 py-4 text-lg rounded-[20px]"
                : "bg-[#e8efff] text-[#6c5ce7] min-h-16 min-w-[160px] px-8 py-4 text-lg rounded-[20px]"
            }
            font-medium 
            border-t border-l border-[#ffffff50] border-b-[#00000015] border-r-[#00000015]
            shadow-[6px_6px_12px_0_rgba(0,0,0,0.15),-6px_-6px_12px_0_rgba(255,255,255,0.9)]
            transition-all duration-200
            hover:shadow-[4px_4px_8px_0_rgba(0,0,0,0.15),-4px_-4px_8px_0_rgba(255,255,255,0.9)]
            active:shadow-[inset_4px_4px_8px_0_rgba(0,0,0,0.15),inset_-4px_-4px_8px_0_rgba(255,255,255,0.9)]
            disabled:opacity-50 disabled:pointer-events-none
          `}
        >
          {isRunning 
            ? t('timer.pause') 
            : isPaused 
              ? t('timer.resume') 
              : t('timer.start')}
        </button>
      </div>
      
      {(isRunning || isPaused) && onFinish && (
        <div className="m-4">
          <button 
            onClick={onFinish}
            className="
              bg-[#fff0f5] text-[#e82d61] font-medium
              min-h-16 min-w-[160px] px-8 py-4 text-lg rounded-[20px]
              border-t border-l border-[#ffffff50] border-b-[#00000015] border-r-[#00000015]
              shadow-[6px_6px_12px_0_rgba(0,0,0,0.15),-6px_-6px_12px_0_rgba(255,255,255,0.9)]
              transition-all duration-200
              hover:shadow-[4px_4px_8px_0_rgba(0,0,0,0.15),-4px_-4px_8px_0_rgba(255,255,255,0.9)]
              active:shadow-[inset_4px_4px_8px_0_rgba(0,0,0,0.15),inset_-4px_-4px_8px_0_rgba(255,255,255,0.9)]
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