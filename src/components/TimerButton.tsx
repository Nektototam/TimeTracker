"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/Button';

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
        <Button
          onClick={onClick}
          variant={isPaused ? 'success' : 'timer'}
          size="xl"
          className="min-h-16 min-w-[160px] rounded-[20px]"
        >
          {isRunning 
            ? t('timer.pause') 
            : isPaused 
              ? t('timer.resume') 
              : t('timer.start')}
        </Button>
      </div>
      
      {(isRunning || isPaused) && onFinish && (
        <div className="m-4">
          <Button
            onClick={onFinish}
            variant="timerStop"
            size="xl"
            className="min-h-16 min-w-[160px] rounded-[20px]"
          >
            {t('timer.stop')}
          </Button>
        </div>
      )}
    </div>
  );
} 