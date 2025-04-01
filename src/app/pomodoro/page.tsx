"use client";

import React, { useState } from 'react';
import NavBar from '../../components/NavBar';
import TopBar from '../../components/TopBar';
import PomodoroCycle from '../../components/PomodoroCycle';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../components/ui/Button';
import { useTranslation } from 'react-i18next';
import './pomodoro.css';

function PomodoroApp() {
  const { translationInstance } = useLanguage();
  const { t } = translationInstance;
  const { i18n } = useTranslation();
  
  const [settings, setSettings] = useState({
    workDuration: 25,
    restDuration: 5,
    cycles: 4,
    autostart: true,
  });
  
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  
  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value)
    }));
  };
  
  const toggleSettings = () => {
    setShowSettingsPanel(!showSettingsPanel);
  };
  
  const translate = (key: string) => t(`pomodoro.${key}`);

  return (
    <div className="app-container">
      <div className="screen">
        <TopBar 
          title={i18n.t('nav.pomodoro')} 
          showPeriodSelector={false}
        />
        
        <div className="mt-8 text-center">
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
            rightIcon={showSettingsPanel ? '▲' : '▼'}
          >
            {translate('settings')}
          </Button>
          
          {showSettingsPanel && (
            <div className="settings-panel mt-6 p-6 bg-white rounded-xl shadow-md">
              <div className="setting-item mb-4">
                <label htmlFor="workDuration" className="block mb-2 text-gray-700">{translate('workDuration')}</label>
                <input
                  type="number"
                  id="workDuration"
                  name="workDuration"
                  min="1"
                  max="60"
                  value={settings.workDuration}
                  onChange={handleSettingsChange}
                  className="w-full p-2 border border-gray-300 rounded-full"
                />
              </div>
              
              <div className="setting-item mb-4">
                <label htmlFor="restDuration" className="block mb-2 text-gray-700">{translate('restDuration')}</label>
                <input
                  type="number"
                  id="restDuration"
                  name="restDuration"
                  min="1"
                  max="30"
                  value={settings.restDuration}
                  onChange={handleSettingsChange}
                  className="w-full p-2 border border-gray-300 rounded-full"
                />
              </div>
              
              <div className="setting-item mb-4">
                <label htmlFor="cycles" className="block mb-2 text-gray-700">{translate('cycles')}</label>
                <input
                  type="number"
                  id="cycles"
                  name="cycles"
                  min="1"
                  max="10"
                  value={settings.cycles}
                  onChange={handleSettingsChange}
                  className="w-full p-2 border border-gray-300 rounded-full"
                />
              </div>
            </div>
          )}
        </div>
        
        <NavBar />
      </div>
    </div>
  );
}

export default function Pomodoro() {
  return (
    <ProtectedRoute>
      <PomodoroApp />
    </ProtectedRoute>
  );
} 