"use client";

import React, { useState } from 'react';
import NavBar from '../../components/NavBar';
import PomodoroTimer from '../../components/PomodoroTimer';
import ProtectedRoute from '../../components/ProtectedRoute';
import PomodoroCycle from '../../components/PomodoroCycle';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../components/ui/Button';
import './pomodoro.css';

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
        <div id="pomodoro-screen" className="screen">
          <div className="stats-header">
            <h1>{translate('title')}</h1>
          </div>
          
          <div className="text-center slide-up">
            <p className="text-secondary mb-6">{translate('description')}</p>
          </div>
          
          <div className="timer-wrapper">
            <PomodoroCycle 
              workDuration={settings.workDuration}
              restDuration={settings.restDuration}
              cycles={settings.cycles}
            />
          </div>
          
          <Button
            variant="outline"
            size="md"
            className="w-full max-w-xs mx-auto mt-4"
            onClick={toggleSettings}
            rightIcon={showSettings ? '▲' : '▼'}
          >
            {translate('settings')}
          </Button>
          
          {showSettings && (
            <div className="settings-panel">
              <div className="setting-item">
                <label htmlFor="workDuration">{translate('workDuration')}</label>
                <input
                  type="number"
                  id="workDuration"
                  name="workDuration"
                  min="1"
                  max="60"
                  value={settings.workDuration}
                  onChange={handleSettingsChange}
                />
              </div>
              
              <div className="setting-item">
                <label htmlFor="restDuration">{translate('restDuration')}</label>
                <input
                  type="number"
                  id="restDuration"
                  name="restDuration"
                  min="1"
                  max="30"
                  value={settings.restDuration}
                  onChange={handleSettingsChange}
                />
              </div>
              
              <div className="setting-item">
                <label htmlFor="cycles">{translate('cycles')}</label>
                <input
                  type="number"
                  id="cycles"
                  name="cycles"
                  min="1"
                  max="10"
                  value={settings.cycles}
                  onChange={handleSettingsChange}
                />
              </div>
            </div>
          )}
          
          <NavBar />
        </div>
      </div>
    </ProtectedRoute>
  );
} 