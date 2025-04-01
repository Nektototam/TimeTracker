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
    <div className="flex gap-6 justify-center mt-10">
      <Button 
        variant={isRunning ? "outline" : "timer"}
        size="lg"
        rounded="full"
        onClick={onClick}
        className={`
          ${isRunning 
            ? "border-gray-200 text-gray-700 bg-white" 
            : "bg-gradient-to-r from-primary-300 to-primary-600 text-white shadow-xl"
          } 
          px-12 py-4 font-semibold text-base min-w-[180px]
        `}
      >
        {isRunning ? t('timer.pause') : t('timer.start')}
      </Button>
      
      {isRunning && onFinish && (
        <Button 
          variant="danger"
          size="lg"
          rounded="full"
          onClick={onFinish}
          className="px-12 py-4 font-semibold text-base shadow-xl min-w-[180px]"
        >
          {t('timer.stop')}
        </Button>
      )}
    </div>
  );
} 