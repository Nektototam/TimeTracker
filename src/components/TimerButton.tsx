import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/Button';

interface TimerButtonProps {
  isRunning: boolean;
  onClick: () => void;
  onFinish?: () => void;
}

export default function TimerButton({ isRunning, onClick, onFinish }: TimerButtonProps) {
  const { t } = useTranslation();
  
  return (
    <div className="flex gap-4 justify-center mt-6">
      <Button 
        variant={isRunning ? "outline" : "timer"}
        size="lg"
        rounded="full"
        onClick={onClick}
        className={`${isRunning ? "border-gray-200 text-gray-700" : "bg-primary text-white shadow-button"} px-8`}
      >
        {isRunning ? t('timer.pause') : t('timer.start')}
      </Button>
      
      {isRunning && onFinish && (
        <Button 
          variant="danger"
          size="lg"
          rounded="full"
          onClick={onFinish}
          className="px-8"
        >
          {t('timer.stop')}
        </Button>
      )}
    </div>
  );
} 