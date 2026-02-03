'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface TimeLimitFormProps {
  initialHours?: number;
  initialMinutes?: number;
  onSave: (hours: number, minutes: number) => void;
  onCancel: () => void;
}

export function TimeLimitForm({ 
  initialHours = 8, 
  initialMinutes = 0, 
  onSave, 
  onCancel 
}: TimeLimitFormProps) {
  const { t } = useTranslation();
  const [hours, setHours] = useState(initialHours);
  const [minutes, setMinutes] = useState(initialMinutes);

  useEffect(() => {
    setHours(initialHours);
    setMinutes(initialMinutes);
  }, [initialHours, initialMinutes]);

  const handleSave = () => {
    if (hours === 0 && minutes === 0) {
      alert('Пожалуйста, установите ограничение времени больше 0 или отмените выбор');
      return;
    }
    onSave(hours, minutes);
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-xl border border-border bg-card p-6 shadow-app-sm">
      <h3 className="mb-5 text-base font-medium text-foreground">{t('timer.timeLimit.setLimit')}</h3>
      
      <div className="mb-6 flex items-end justify-around gap-8">
        <div>
          <label className="mb-2 block text-sm text-muted-foreground">{t('timer.hours')}</label>
          <Input
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(parseFloat(e.target.value))}
            className="w-24"
            fullWidth={false}
          />
        </div>
        
        <div>
          <label className="mb-2 block text-sm text-muted-foreground">{t('timer.minutes')}</label>
          <Input
            type="number"
            min="0"
            max="45"
            step="15"
            value={minutes}
            onChange={(e) => setMinutes(parseInt(e.target.value))}
            className="w-24"
            fullWidth={false}
          />
        </div>
      </div>
      
      <div className="mb-2 flex items-center justify-center gap-4">
        <Button
          variant="secondary"
          size="md"
          onClick={onCancel}
          className="h-11 px-5"
        >
          {t('cancel')}
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          className="h-11 px-5"
        >
          {t('save')}
        </Button>
      </div>
    </div>
  );
} 