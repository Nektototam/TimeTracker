"use client";

import React, { useState, useEffect } from 'react';
import AppShell from '../../components/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import settingsService from '../../lib/settingsService';

interface Settings {
  // DB настройки
  pomodoro_work_time: number;
  pomodoro_rest_time: number;
  pomodoro_long_rest_time: number;
  auto_start: boolean;
  round_times: string;
  language: string;
  data_retention_period: number;
  // Локальные настройки
  theme: string;
  timeFormat: string;
  soundNotifications: boolean;
  browserNotifications: boolean;
}

function SettingsPage() {
  const { user } = useAuth();
  const { translationInstance } = useLanguage();
  const { t } = translationInstance;
  
  // Состояния для всех настроек
  const [settings, setSettings] = useState<Settings>({
    // DB настройки
    pomodoro_work_time: 25,
    pomodoro_rest_time: 5,
    pomodoro_long_rest_time: 15,
    auto_start: false,
    round_times: 'off',
    language: 'ru',
    data_retention_period: 3, // По умолчанию 3 месяца
    // Локальные настройки
    theme: 'light',
    timeFormat: '24h',
    soundNotifications: true,
    browserNotifications: true
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [cleaningStatus, setCleaningStatus] = useState<'idle' | 'cleaning' | 'success' | 'error'>('idle');
  
  // Функция перевода
  const translate = (key: string): string => {
    const i18nTranslation = t(`settings.${key}`);
    
    // Возвращаем перевод напрямую, так как всё должно быть в файлах локализации
    return i18nTranslation === `settings.${key}` ? key : i18nTranslation;
  };

  // Загрузка настроек при монтировании компонента
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const loadedSettings = await settingsService.loadAllSettings();
        setSettings({
          pomodoro_work_time: loadedSettings.pomodoro_work_time,
          pomodoro_rest_time: loadedSettings.pomodoro_rest_time,
          pomodoro_long_rest_time: loadedSettings.pomodoro_long_rest_time,
          auto_start: loadedSettings.auto_start,
          round_times: loadedSettings.round_times,
          language: loadedSettings.language,
          data_retention_period: loadedSettings.data_retention_period,
          theme: loadedSettings.theme,
          timeFormat: loadedSettings.timeFormat,
          soundNotifications: loadedSettings.soundNotifications,
          browserNotifications: loadedSettings.browserNotifications
        });
      } catch (error) {
        console.error('Ошибка загрузки настроек:', error);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);
  
  // Обновление состояния настроек
  const updateSettings = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Запрос разрешения на браузерные уведомления
  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        updateSettings('browserNotifications', true);
      }
    } catch (error) {
      console.error('Ошибка запроса разрешения на уведомления:', error);
    }
  };

  // Сохранение настроек
  const saveSettings = async () => {
    setSaveStatus('saving');
    try {
      await settingsService.saveAllSettings(settings);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // Очистка старых записей
  const cleanOldRecords = async () => {
    setCleaningStatus('cleaning');
    try {
      await settingsService.cleanOldRecords(settings.data_retention_period);
      setCleaningStatus('success');
      setTimeout(() => setCleaningStatus('idle'), 2000);
    } catch (error) {
      console.error('Ошибка очистки записей:', error);
      setCleaningStatus('error');
      setTimeout(() => setCleaningStatus('idle'), 3000);
    }
  };

  // Экспорт данных
  const exportData = async () => {
    try {
      const data = await settingsService.exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `timetracker-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка экспорта данных:', error);
    }
  };

  return (
    <AppShell title={translate('title')}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">{translate('title')}</h1>
          {isLoading && <div className="text-sm text-muted-foreground">{translate('loading')}</div>}
        </div>
          
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-foreground">{translate('profile')}</h2>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <div className="font-medium text-foreground">{user?.email || t('user')}</div>
                <div className="text-xs text-muted-foreground">ID: {user?.id?.substring(0, 8) || t('notLoggedIn')}</div>
              </div>
            </div>
          </div>
          
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">{translate('notifications')}</h2>
              <p className="text-sm text-muted-foreground">{translate('deviceOnly')}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="text-sm font-medium text-foreground">{translate('sound')}</div>
                <Checkbox
                  checked={settings.soundNotifications}
                  onChange={(e) => updateSettings('soundNotifications', e.target.checked)}
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-foreground">{translate('browser')}</div>
                <Checkbox
                  checked={settings.browserNotifications}
                  onChange={(e) => {
                    if (e.target.checked && Notification.permission !== "granted") {
                      requestNotificationPermission();
                    } else {
                      updateSettings('browserNotifications', e.target.checked);
                    }
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
          
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">Pomodoro ({t('nav.pomodoro')})</h2>
              <p className="text-sm text-muted-foreground">{translate('syncedSettings')}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="text-sm font-medium text-foreground">{t('pomodoro.workDuration')}</div>
                <Input
                  type="number"
                  className="w-20"
                  min="1"
                  max="60"
                  value={settings.pomodoro_work_time}
                  onChange={(e) => updateSettings('pomodoro_work_time', Number(e.target.value))}
                  disabled={isLoading}
                  fullWidth={false}
                />
              </div>
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="text-sm font-medium text-foreground">{t('pomodoro.restDuration')}</div>
                <Input
                  type="number"
                  className="w-20"
                  min="1"
                  max="30"
                  value={settings.pomodoro_rest_time}
                  onChange={(e) => updateSettings('pomodoro_rest_time', Number(e.target.value))}
                  disabled={isLoading}
                  fullWidth={false}
                />
              </div>
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="text-sm font-medium text-foreground">{t('pomodoro.longRestDuration')}</div>
                <Input
                  type="number"
                  className="w-20"
                  min="1"
                  max="60"
                  value={settings.pomodoro_long_rest_time}
                  onChange={(e) => updateSettings('pomodoro_long_rest_time', Number(e.target.value))}
                  disabled={isLoading}
                  fullWidth={false}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-foreground">{t('pomodoro.autoStart')}</div>
                <Checkbox
                  checked={settings.auto_start}
                  onChange={(e) => updateSettings('auto_start', e.target.checked)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
          
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-foreground">{translate('interface')}</h2>
            <div className="space-y-4">
              <div className="border-b border-border pb-4">
                <div className="text-sm font-medium text-foreground">{translate('theme')}</div>
                <div className="text-xs text-muted-foreground">{translate('deviceOnly')}</div>
                <Select
                  className="mt-2 w-full"
                  value={settings.theme}
                  onChange={(e) => updateSettings('theme', e.target.value)}
                  disabled={isLoading}
                >
                  <option value="light">{translate('lightTheme')}</option>
                  <option value="dark">{translate('darkTheme')}</option>
                  <option value="system">{translate('systemTheme')}</option>
                </Select>
              </div>
              <div className="border-b border-border pb-4">
                <div className="text-sm font-medium text-foreground">{translate('language')}</div>
                <div className="text-xs text-muted-foreground">{translate('syncedSettings')}</div>
                <LanguageSwitcher variant="select" className="mt-2 w-full" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">{translate('timeFormat')}</div>
                <div className="text-xs text-muted-foreground">{translate('deviceOnly')}</div>
                <Select
                  className="mt-2 w-full"
                  value={settings.timeFormat}
                  onChange={(e) => updateSettings('timeFormat', e.target.value)}
                  disabled={isLoading}
                >
                  <option value="24h">24 {translate('hours')}</option>
                  <option value="12h">12 {translate('hours')}</option>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">{translate('timeTracking')}</h2>
              <p className="text-sm text-muted-foreground">{translate('syncedSettings')}</p>
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">{translate('roundTime')}</div>
              <Select
                className="mt-2 w-full"
                value={settings.round_times}
                onChange={(e) => updateSettings('round_times', e.target.value)}
                disabled={isLoading}
              >
                <option value="off">{translate('roundOff')}</option>
                <option value="5">5 {translate('minutes')}</option>
                <option value="10">10 {translate('minutes')}</option>
                <option value="15">15 {translate('minutes')}</option>
              </Select>
            </div>
          </div>
          
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">{translate('dataAndStorage')}</h2>
              <p className="text-sm text-muted-foreground">{translate('storageSettings')}</p>
            </div>
            <div className="space-y-4">
              <div className="border-b border-border pb-4">
                <div className="text-sm font-medium text-foreground">{translate('retentionPeriod')}</div>
                <Select
                  className="mt-2 w-full"
                  value={settings.data_retention_period.toString()}
                  onChange={(e) => updateSettings('data_retention_period', Number(e.target.value))}
                  disabled={isLoading}
                >
                  <option value="1">1 {translate('month')}</option>
                  <option value="3">3 {translate('months')}</option>
                  <option value="6">6 {translate('months')}</option>
                  <option value="12">1 {translate('year')}</option>
                  <option value="24">2 {translate('years')}</option>
                  <option value="0">{translate('unlimited')}</option>
                </Select>
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">{translate('cleanOldRecords')}</div>
                <Button 
                  variant={cleaningStatus === 'error' ? 'danger' : 'secondary'}
                  size="md"
                  onClick={cleanOldRecords}
                  disabled={isLoading || cleaningStatus === 'cleaning'}
                  isLoading={cleaningStatus === 'cleaning'}
                >
                  {cleaningStatus === 'idle' && translate('clean')}
                  {cleaningStatus === 'cleaning' && translate('cleaning')}
                  {cleaningStatus === 'success' && translate('cleanSuccess')}
                  {cleaningStatus === 'error' && translate('cleanError')}
                </Button>
                <div className="mt-2 text-xs text-muted-foreground">
                  {translate('cleanDesc')}
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">{translate('workTypes')}</h2>
              <p className="text-sm text-muted-foreground">{translate('workTypesDesc')}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Управление типами работ доступно в настройках проекта на странице дашборда.
            </p>
          </div>
          
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">{translate('data')}</h2>
              <p className="text-sm text-muted-foreground">{translate('dataDesc')}</p>
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">{translate('exportData')}</div>
              <Button 
                variant="secondary"
                size="md"
                onClick={exportData}
                className="mt-2"
              >
                {translate('exportData')}
              </Button>
            </div>
          </div>
          
          <div className="sticky bottom-4 rounded-2xl border border-border bg-background/90 p-4 shadow-sm backdrop-blur">
            <Button 
              variant={saveStatus === 'error' ? 'danger' : 'primary'}
              size="xl"
              fullWidth={true}
              rounded="xl"
              onClick={saveSettings}
              disabled={isLoading || saveStatus === 'saving'}
              isLoading={saveStatus === 'saving'}
            >
              {saveStatus === 'idle' && t('save')}
              {saveStatus === 'saving' && translate('saving')}
              {saveStatus === 'success' && translate('saveSuccess')}
              {saveStatus === 'error' && translate('saveError')}
            </Button>
            
            {saveStatus === 'error' && (
              <div className="mt-2 text-center text-sm text-destructive">
                {translate('saveError')}
              </div>
            )}
          </div>
      </div>
    </AppShell>
  );
}

export default function Settings() {
  return (
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  );
} 