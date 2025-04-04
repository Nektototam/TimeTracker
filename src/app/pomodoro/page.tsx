"use client";

import React, { useState } from 'react';
import NavBar from '../../components/NavBar';
import PomodoroTimer from '../../components/PomodoroTimer';
import ProtectedRoute from '../../components/ProtectedRoute';
import PomodoroCycle from '../../components/PomodoroCycle';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function Pomodoro() {
  const { translationInstance } = useLanguage();
  const { t } = translationInstance;
  
  const [settings, setSettings] = useState({
    workDuration: 25,
    restDuration: 5,
    cycles: 4
  });
  
  const [showSettings, setShowSettings] = useState(false);
  
  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: parseInt(value, 10)
    });
  };
  
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };
  
  // Локальный перевод на случай, если контекст i18n не загрузился
  const translate = (key: string): string => {
    const i18nTranslation = t(`pomodoro.${key}`);
    
    // Если перевод вернул тот же ключ (не найден), используем фиксированные значения
    if (i18nTranslation === `pomodoro.${key}`) {
      const localTranslations: Record<string, string> = {
        title: 'Pomodoro Timer',
        settings: 'Настройки',
        workDuration: 'Время работы (мин)',
        restDuration: 'Время отдыха (мин)',
        cycles: 'Количество циклов',
        save: 'Сохранить',
        description: 'Работайте с полной концентрацией, затем делайте перерывы для отдыха.'
      };
      return localTranslations[key] || key;
    }
    
    return i18nTranslation;
  };
  
  return (
    <ProtectedRoute>
      <div className="app-container">
        <div className="screen">
          <h1>{translate('title')}</h1>
          
          <div className="text-center mb-6">
            <p className="text-secondary-text-color">{translate('description')}</p>
          </div>
          
          <div className="timer-wrapper">
            <PomodoroCycle 
              workDuration={settings.workDuration}
              restDuration={settings.restDuration}
              cycles={settings.cycles}
            />
          </div>
          
          <hr className="w-full max-w-[300px] mx-auto my-8 border-t-2 border-[#00000015]" />
          
          <div className="flex justify-center mt-16">
            <Button
              variant="buttonStart"
              size="lg"
              onClick={toggleSettings}
              rightIcon={showSettings ? '▲' : '▼'}
              style={{ width: '300px', maxWidth: '100%' }}
            >
              {translate('settings')}
            </Button>
          </div>
          
          {showSettings && (
            <div className="flex justify-center">
              <div className="select-container mt-4" style={{ maxWidth: '300px', width: '100%' }}>
                <div className="flex flex-col gap-8">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {translate('workDuration')}
                    </label>
                    <div style={{ width: '60px' }}>
                      <Input
                        type="number"
                        id="workDuration"
                        name="workDuration"
                        min="1"
                        max="60"
                        value={settings.workDuration.toString()}
                        onChange={handleSettingsChange}
                        variant="neomorphic"
                        inputSize="sm"
                        fullWidth={true}
                        className="text-center"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {translate('restDuration')}
                    </label>
                    <div style={{ width: '60px' }}>
                      <Input
                        type="number"
                        id="restDuration"
                        name="restDuration"
                        min="1"
                        max="30"
                        value={settings.restDuration.toString()}
                        onChange={handleSettingsChange}
                        variant="neomorphic"
                        inputSize="sm"
                        fullWidth={true}
                        className="text-center"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {translate('cycles')}
                    </label>
                    <div style={{ width: '60px' }}>
                      <Input
                        type="number"
                        id="cycles"
                        name="cycles"
                        min="1"
                        max="10"
                        value={settings.cycles.toString()}
                        onChange={handleSettingsChange}
                        variant="neomorphic"
                        inputSize="sm"
                        fullWidth={true}
                        className="text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <NavBar />
        </div>
      </div>
    </ProtectedRoute>
  );
}