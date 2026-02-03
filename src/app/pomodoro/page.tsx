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
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-lg">🍅</div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">TimeTracker</p>
                <h1 className="text-lg font-semibold text-foreground">{t('nav.pomodoro')}</h1>
              </div>
            </div>
          </div>
        </header>

        <div
          className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8"
          style={{ gridTemplateColumns: '240px 1fr', alignItems: 'start' }}
        >
          <aside className="flex w-64 flex-col gap-4">
            <NavBar variant="sidebar" />
          </aside>

          <main className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-app-sm">
              <h2 className="text-2xl font-semibold text-foreground">{translate('title')}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{translate('description')}</p>

              <div className="mt-6">
                <PomodoroCycle
                  workDuration={settings.workDuration}
                  restDuration={settings.restDuration}
                  cycles={settings.cycles}
                />
              </div>

              <div className="mt-8 flex justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={toggleSettings}
                  rightIcon={showSettings ? '▲' : '▼'}
                  className="w-full max-w-sm"
                >
                  {translate('settings')}
                </Button>
              </div>

              {showSettings && (
                <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">
                        {translate('workDuration')}
                      </label>
                      <div className="w-20">
                        <Input
                          type="number"
                          id="workDuration"
                          name="workDuration"
                          min="1"
                          max="60"
                          value={settings.workDuration.toString()}
                          onChange={handleSettingsChange}
                          inputSize="sm"
                          fullWidth={true}
                          className="text-center"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">
                        {translate('restDuration')}
                      </label>
                      <div className="w-20">
                        <Input
                          type="number"
                          id="restDuration"
                          name="restDuration"
                          min="1"
                          max="30"
                          value={settings.restDuration.toString()}
                          onChange={handleSettingsChange}
                          inputSize="sm"
                          fullWidth={true}
                          className="text-center"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">
                        {translate('cycles')}
                      </label>
                      <div className="w-20">
                        <Input
                          type="number"
                          id="cycles"
                          name="cycles"
                          min="1"
                          max="10"
                          value={settings.cycles.toString()}
                          onChange={handleSettingsChange}
                          inputSize="sm"
                          fullWidth={true}
                          className="text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}