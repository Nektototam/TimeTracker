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
    <div className="time-limit-form p-6 bg-[#e2e8f0] rounded-xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.6)] max-w-xl w-full mx-auto">
      <h3 className="mb-5 text-gray-700 text-base font-medium">{t('timer.timeLimit.setLimit')}</h3>
      
      <div className="flex justify-around items-end mb-6 space-x-8">
        <div className="mr-6">
          <label className="block text-sm text-gray-600 mb-2">{t('timer.hours')}</label>
          <Input
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(parseFloat(e.target.value))}
            className="w-20 min-h-[50px] text-base"
            fullWidth={false}
          />
        </div>
        
        <div className="ml-6">
          <label className="block text-sm text-gray-600 mb-2">{t('timer.minutes')}</label>
          <Input
            type="number"
            min="0"
            max="45"
            step="15"
            value={minutes}
            onChange={(e) => setMinutes(parseInt(e.target.value))}
            className="w-20 min-h-[50px] text-base"
            fullWidth={false}
          />
        </div>
      </div>
      
      <div className="flex justify-around items-center space-x-6 mb-2">
        <Button
          variant="cancelButton"
          size="lg"
          onClick={onCancel}
          className="min-h-[50px] min-w-[115px] py-3 px-5 text-base mr-6"
        >
          {t('cancel')}
        </Button>
        <Button
          variant="saveButton"
          size="lg"
          onClick={handleSave}
          className="min-h-[50px] min-w-[115px] py-3 px-5 text-base ml-6"
        >
          {t('save')}
        </Button>
      </div>
    </div>
  );
} 