'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/Button';

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
    <div className="time-limit-form p-5 bg-[#f8fafc] rounded-xl shadow-lg max-w-xl mx-auto">
      <h3 className="mb-4 text-gray-700 text-center text-base font-medium">{t('timer.timeLimit.setLimit')}</h3>
      
      <div className="bg-[#f1f5fa] p-4 rounded-lg mb-5">
        <div className="flex justify-center gap-8 mb-2">
          <div className="text-center">
            <label className="block text-sm text-gray-600 mb-2">{t('timer.hours')}</label>
          </div>
          
          <div className="text-center">
            <label className="block text-sm text-gray-600 mb-2">{t('timer.minutes')}</label>
          </div>
        </div>
        
        <div className="flex justify-center gap-8">
          <input
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(parseFloat(e.target.value))}
            className="w-24 min-h-[40px] py-2 px-3 bg-white text-gray-700 text-base 
              rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          
          <input
            type="number"
            min="0"
            max="45"
            step="15"
            value={minutes}
            onChange={(e) => setMinutes(parseInt(e.target.value))}
            className="w-24 min-h-[40px] py-2 px-3 bg-white text-gray-700 text-base 
              rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>
      
      <div className="flex justify-between gap-4">
        <Button
          variant="ghost"
          size="lg"
          onClick={onCancel}
          className="flex-1 bg-white py-3 rounded-xl shadow-sm hover:bg-gray-50"
        >
          {t('cancel')}
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={handleSave}
          className="flex-1 bg-[#f1f5fa] text-primary py-3 rounded-xl shadow-sm hover:bg-[#e6ebf5]"
        >
          {t('save')}
        </Button>
      </div>
    </div>
  );
} 