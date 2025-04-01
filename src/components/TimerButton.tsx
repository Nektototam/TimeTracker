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
    <div className="flex gap-4 justify-center mt-8">
      <Button 
        variant={isRunning ? "outline" : "timer"}
        size="lg"
        rounded="full"
        onClick={onClick}
        className={`
          ${isRunning 
            ? "border-gray-200 text-gray-700 bg-white" 
            : "bg-gradient-to-r from-primary-400 to-primary-600 text-white shadow-button hover:shadow-lg hover:-translate-y-0.5"
          } 
          px-10 py-3 font-medium text-base
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
          className="px-10 py-3 font-medium text-base shadow-md hover:shadow-lg"
        >
          {t('timer.stop')}
        </Button>
      )}
    </div>
  );
} 