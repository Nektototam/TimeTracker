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
    <div className="flex gap-4 justify-center mt-4">
      <Button 
        variant={isRunning ? "outline" : "buttonStart"}
        size={isRunning ? "lg" : undefined}
        onClick={onClick}
        leftIcon={isRunning ? '⏸' : '▶'}
        className={!isRunning ? "relative w-44" : ""}
      >
        {isRunning ? t('timer.pause') : t('timer.start')}
      </Button>
      
      {isRunning && onFinish && (
        <Button 
          variant="danger"
          size="lg"
          onClick={onFinish}
          leftIcon="✓"
        >
          {t('timer.stop')}
        </Button>
      )}
    </div>
  );
} 