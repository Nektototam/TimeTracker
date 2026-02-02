"use client";

import React, { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import WorkTypeManager from '../../components/WorkTypeManager';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../components/ui/Button';
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
  
  // Сохранение настроек
  const saveSettings = async () => {
    if (isLoading) return;
    
    setSaveStatus('saving');
    try {
      await settingsService.saveAllSettings({
        pomodoro_work_time: settings.pomodoro_work_time,
        pomodoro_rest_time: settings.pomodoro_rest_time,
        pomodoro_long_rest_time: settings.pomodoro_long_rest_time,
        auto_start: settings.auto_start,
        round_times: settings.round_times,
        language: settings.language,
        data_retention_period: settings.data_retention_period,
        theme: settings.theme,
        timeFormat: settings.timeFormat,
        soundNotifications: settings.soundNotifications,
        browserNotifications: settings.browserNotifications
      });
      setSaveStatus('success');
      // Сбрасываем статус успеха через 3 секунды
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
      setSaveStatus('error');
    }
  };
  
  // Запрос разрешения на уведомления браузера
  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert("Этот браузер не поддерживает уведомления");
      return;
    }
    
    if (Notification.permission === "granted") {
      alert("Разрешения на уведомления уже предоставлены");
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        updateSettings('browserNotifications', true);
        // Показать тестовое уведомление
        new Notification("TimeTracker", {
          body: "Уведомления успешно включены!"
        });
      } else {
        updateSettings('browserNotifications', false);
        alert("Уведомления отклонены пользователем");
      }
    } catch (error) {
      console.error("Ошибка запроса разрешений:", error);
      alert("Не удалось запросить разрешения на уведомления");
    }
  };
  
  // Экспорт данных
  const exportData = () => {
    alert('Функция экспорта данных будет доступна в следующем обновлении');
  };
  
  // Очистка старых записей
  const cleanOldRecords = async () => {
    if (isLoading) return;
    
    if (confirm('Вы уверены, что хотите очистить все записи старше установленного срока хранения? Это действие необратимо.')) {
      setCleaningStatus('cleaning');
      try {
        await settingsService.cleanOldTimeEntries();
        setCleaningStatus('success');
        // Сбрасываем статус успеха через 3 секунды
        setTimeout(() => {
          setCleaningStatus('idle');
        }, 3000);
      } catch (error) {
        console.error('Ошибка очистки старых записей:', error);
        setCleaningStatus('error');
      }
    }
  };
  
  return (
    <div className="app-container">
      <div id="settings-screen" className="screen">
        <div className="settings-header">
          <h1>{translate('title')}</h1>
          {isLoading && <div className="settings-loading">{translate('loading')}</div>}
        </div>
        
        <div className="settings-section slide-up">
          <h2 className="settings-section-title">{translate('profile')}</h2>
          
          <div className="user-profile">
            <div className="avatar-placeholder">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-info">
              <div className="user-email">{user?.email || t('user')}</div>
              <div className="user-id">ID: {user?.id?.substring(0, 8) || t('notLoggedIn')}</div>
            </div>
          </div>
        </div>
        
        <div className="settings-section slide-up">
          <h2 className="settings-section-title">{translate('notifications')}</h2>
          <p className="settings-section-desc">{translate('deviceOnly')}</p>
          
          <div className="settings-item">
            <div className="settings-item-label">{translate('sound')}</div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.soundNotifications}
                onChange={(e) => updateSettings('soundNotifications', e.target.checked)}
                disabled={isLoading}
              />
              <span className="switch-slider"></span>
            </label>
          </div>
          
          <div className="settings-item">
            <div className="settings-item-label">{translate('browser')}</div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
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
              <span className="switch-slider"></span>
            </label>
          </div>
        </div>
        
        <div className="settings-section slide-up">
          <h2 className="settings-section-title">Pomodoro ({t('nav.pomodoro')})</h2>
          <p className="settings-section-desc">{translate('syncedSettings')}</p>
          
          <div className="settings-item">
            <div className="settings-item-label">{t('pomodoro.workDuration')}</div>
            <input
              type="number"
              className="settings-input"
              min="1"
              max="60"
              value={settings.pomodoro_work_time}
              onChange={(e) => updateSettings('pomodoro_work_time', Number(e.target.value))}
              disabled={isLoading}
            />
          </div>
          
          <div className="settings-item">
            <div className="settings-item-label">{t('pomodoro.restDuration')}</div>
            <input
              type="number"
              className="settings-input"
              min="1"
              max="30"
              value={settings.pomodoro_rest_time}
              onChange={(e) => updateSettings('pomodoro_rest_time', Number(e.target.value))}
              disabled={isLoading}
            />
          </div>
          
          <div className="settings-item">
            <div className="settings-item-label">{t('pomodoro.longRestDuration')}</div>
            <input
              type="number"
              className="settings-input"
              min="5"
              max="60"
              value={settings.pomodoro_long_rest_time}
              onChange={(e) => updateSettings('pomodoro_long_rest_time', Number(e.target.value))}
              disabled={isLoading}
            />
          </div>
          
          <div className="settings-item">
            <div className="settings-item-label">{t('pomodoro.autoStart')}</div>
            <label className="toggle-switch">
              <input 
                type="checkbox"
                checked={settings.auto_start}
                onChange={(e) => updateSettings('auto_start', e.target.checked)}
                disabled={isLoading}
              />
              <span className="switch-slider"></span>
            </label>
          </div>
        </div>
        
        <div className="settings-section slide-up">
          <h2 className="settings-section-title">{translate('interface')}</h2>
          
          <div className="settings-item">
            <div className="settings-item-label">{translate('theme')}</div>
            <div className="settings-item-desc">{translate('deviceOnly')}</div>
            <select 
              className="settings-select"
              value={settings.theme}
              onChange={(e) => updateSettings('theme', e.target.value)}
              disabled={isLoading}
            >
              <option value="light">{t('themes.light')}</option>
              <option value="dark">{t('themes.dark')}</option>
              <option value="system">{t('themes.system')}</option>
            </select>
          </div>
          
          <div className="settings-item">
            <div className="settings-item-label">{translate('language')}</div>
            <div className="settings-item-desc">{translate('syncedSettings')}</div>
            <LanguageSwitcher variant="select" className="settings-select" />
          </div>
          
          <div className="settings-item">
            <div className="settings-item-label">{translate('timeFormat')}</div>
            <div className="settings-item-desc">{translate('deviceOnly')}</div>
            <select 
              className="settings-select"
              value={settings.timeFormat}
              onChange={(e) => updateSettings('timeFormat', e.target.value)}
              disabled={isLoading}
            >
              <option value="24h">24 часа (14:30)</option>
              <option value="12h">12 часов (2:30 PM)</option>
            </select>
          </div>
        </div>
        
        <div className="settings-section slide-up">
          <h2 className="settings-section-title">{translate('timeTracking')}</h2>
          <p className="settings-section-desc">{translate('syncedSettings')}</p>
          
          <div className="settings-item">
            <div className="settings-item-label">{translate('roundTime')}</div>
            <select 
              className="settings-select"
              value={settings.round_times}
              onChange={(e) => updateSettings('round_times', e.target.value)}
              disabled={isLoading}
            >
              <option value="off">{translate('noRounding')}</option>
              <option value="5min">До 5 минут</option>
              <option value="10min">До 10 минут</option>
              <option value="15min">До 15 минут</option>
            </select>
          </div>
        </div>
        
        <div className="settings-section slide-up">
          <h2 className="settings-section-title">{translate('dataAndStorage')}</h2>
          <p className="settings-section-desc">{translate('storageSettings')}</p>
          
          <div className="settings-item">
            <div className="settings-item-label">{translate('retentionPeriod')}</div>
            <select
              className="settings-select"
              value={settings.data_retention_period}
              onChange={(e) => updateSettings('data_retention_period', Number(e.target.value))}
              disabled={isLoading}
            >
              <option value={1}>{t('settings.retention.30days')}</option>
              <option value={3}>{t('settings.retention.90days')}</option>
              <option value={6}>{t('settings.retention.180days')}</option>
              <option value={12}>{t('settings.retention.365days')}</option>
            </select>
          </div>
          
          <div className="settings-item">
            <div className="settings-item-label">{translate('cleanOldRecords')}</div>
            <Button
              variant={cleaningStatus === 'cleaning' ? 'outline' : cleaningStatus === 'error' ? 'danger' : cleaningStatus === 'success' ? 'success' : 'secondary'}
              size="md"
              rounded="lg"
              onClick={cleanOldRecords}
              disabled={isLoading || cleaningStatus === 'cleaning'}
              isLoading={cleaningStatus === 'cleaning'}
            >
              {cleaningStatus === 'idle' && translate('clean')}
              {cleaningStatus === 'cleaning' && translate('cleaning')}
              {cleaningStatus === 'success' && translate('cleanSuccess')}
              {cleaningStatus === 'error' && translate('cleanError')}
            </Button>
            <div className="settings-item-description">
              {translate('deleteOlderThan')}
            </div>
          </div>
        </div>
        
        <div className="settings-section slide-up">
          <h2 className="settings-section-title">{translate('workTypes')}</h2>
          <p className="settings-section-desc">{translate('workTypesDesc')}</p>
          
          {user && <WorkTypeManager userId={user.id} />}
        </div>
        
        <div className="settings-section slide-up">
          <h2 className="settings-section-title">{translate('data')}</h2>
          
          <div className="flex gap-4">
            <Button 
              variant="secondary"
              onClick={exportData}
              disabled={isLoading}
              leftIcon="📥"
            >
              {translate('exportData')}
            </Button>
          </div>
        </div>
          
        <div className="settings-save-section">
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
            <div className="settings-error-message">
              {translate('saveError')}
            </div>
          )}
        </div>
        
        <NavBar />
      </div>
      
      <style jsx>{`
        .app-container {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .screen {
          padding-bottom: 100px;
        }
        
        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        
        .settings-header h1 {
          font-size: 24px;
          color: var(--text-color);
          margin: 0;
        }
        
        .settings-loading {
          font-size: 14px;
          color: var(--secondary-text-color);
        }
        
        .settings-section {
          margin-bottom: 30px;
          background-color: var(--bg-card);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .settings-section-title {
          font-size: 18px;
          margin-top: 0;
          margin-bottom: 15px;
          color: var(--text-color);
        }
        
        .settings-section-desc {
          font-size: 14px;
          color: var(--secondary-text-color);
          margin-bottom: 20px;
        }
        
        .settings-item {
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid var(--border-color);
        }
        
        .settings-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        
        .settings-item-label {
          font-weight: 500;
          color: var(--text-color);
          margin-bottom: 5px;
        }
        
        .settings-item-desc {
          font-size: 12px;
          color: var(--secondary-text-color);
          margin-bottom: 10px;
        }
        
        .settings-input {
          width: 60px;
          padding: 8px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background-color: var(--bg-input);
          color: var(--text-color);
          font-size: 14px;
        }
        
        .settings-select {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background-color: var(--bg-input);
          color: var(--text-color);
          font-size: 14px;
          margin-top: 5px;
        }
        
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
          margin-top: 5px;
        }
        
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .switch-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 24px;
        }
        
        .switch-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        
        input:checked + .switch-slider {
          background-color: var(--primary-color);
        }
        
        input:disabled + .switch-slider {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        input:checked + .switch-slider:before {
          transform: translateX(26px);
        }
        
        .settings-button {
          display: inline-flex;
          align-items: center;
          padding: 10px 15px;
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .settings-button:hover {
          background-color: var(--primary-color-hover);
        }
        
        .settings-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .settings-button-icon {
          margin-right: 8px;
          font-size: 16px;
        }
        
        .settings-button-loading {
          background-color: var(--primary-color-light);
        }
        
        .settings-button-success {
          background-color: var(--success-color);
        }
        
        .settings-button-error {
          background-color: var(--error-color);
        }
        
        .settings-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        .settings-item-description {
          font-size: 12px;
          color: var(--secondary-text-color);
          margin-top: 8px;
        }
        
        .settings-save-section {
          position: fixed;
          bottom: 70px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 15px;
          background-color: var(--bg-color);
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
          z-index: 10;
        }
        
        .settings-save-button {
          padding: 12px 30px;
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: 30px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          min-width: 150px;
          text-align: center;
        }
        
        .settings-save-button:hover {
          background-color: var(--primary-color-hover);
        }
        
        .settings-save-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .settings-saving {
          background-color: var(--primary-color-light);
        }
        
        .settings-save-success {
          background-color: var(--success-color);
        }
        
        .settings-save-error {
          background-color: var(--error-color);
        }
        
        .settings-error-message {
          color: var(--error-color);
          text-align: center;
          margin-top: 10px;
          font-size: 14px;
        }
        
        .user-profile {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .avatar-placeholder {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: var(--primary-color);
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-size: 24px;
          font-weight: bold;
        }
        
        .user-info {
          flex: 1;
        }
        
        .user-email {
          font-weight: 500;
          color: var(--text-color);
          margin-bottom: 5px;
        }
        
        .user-id {
          font-size: 12px;
          color: var(--secondary-text-color);
        }
        
        .slide-up {
          animation: slideUp 0.3s ease;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default function Settings() {
  return (
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  );
} 