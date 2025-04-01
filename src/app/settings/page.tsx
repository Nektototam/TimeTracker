"use client";

import React, { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';
import TopBar from '../../components/TopBar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import WorkTypeManager from '../../components/WorkTypeManager';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../components/ui/Button';
import { useTranslation } from 'react-i18next';

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

function SettingsApp() {
  const { user } = useAuth();
  const { t } = useTranslation();
  
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
  
  // Загрузка настроек при монтировании компонента (имитация)
  useEffect(() => {
    // Имитируем загрузку данных
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
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
      // Имитируем сохранение
      await new Promise(resolve => setTimeout(resolve, 1000));
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
        // Имитируем очистку
        await new Promise(resolve => setTimeout(resolve, 1500));
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
      <div className="screen">
        <TopBar 
          title={t('nav.settings')}
          showPeriodSelector={false}
          showSettingsButton={false}
        />
        
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-gray-500">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('loading')}...
          </div>
        ) : (
          <>
            {/* Профиль пользователя */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mt-6 mb-4 flex items-center gap-4">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <div className="font-medium text-gray-800 dark:text-gray-200">{user?.email || 'abkats@gmail.com'}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">ID: {user?.id?.substring(0, 8) || '1b85aa97'}</div>
              </div>
            </div>
            
            {/* Уведомления */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t('settings.notifications')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-4">
                {t('settings.notificationsDeviceOnly')}
              </p>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.soundNotifications')}
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.soundNotifications}
                    onChange={(e) => updateSettings('soundNotifications', e.target.checked)}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div className="font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.browserNotifications')}
                </div>
                <div className="flex items-center gap-2">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.browserNotifications}
                      onChange={(e) => updateSettings('browserNotifications', e.target.checked)}
                    />
                    <span className="switch-slider"></span>
                  </label>
                  <button
                    onClick={requestNotificationPermission}
                    className="ripple-effect text-sm text-primary"
                  >
                    {t('settings.requestPermission')}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Настройки помидора */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t('settings.pomodoroSettings')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-4">
                {t('settings.pomodoroSyncAll')}
              </p>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.workTime')} ({t('settings.minutes')})
                </div>
                <input
                  type="number"
                  className="w-20 p-2 border border-gray-300 dark:border-gray-600 rounded-md text-center"
                  value={settings.pomodoro_work_time}
                  onChange={(e) => updateSettings('pomodoro_work_time', parseInt(e.target.value))}
                  min="1"
                  max="60"
                />
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.restTime')} ({t('settings.minutes')})
                </div>
                <input
                  type="number"
                  className="w-20 p-2 border border-gray-300 dark:border-gray-600 rounded-md text-center"
                  value={settings.pomodoro_rest_time}
                  onChange={(e) => updateSettings('pomodoro_rest_time', parseInt(e.target.value))}
                  min="1"
                  max="30"
                />
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.longRestTime')} ({t('settings.minutes')})
                </div>
                <input
                  type="number"
                  className="w-20 p-2 border border-gray-300 dark:border-gray-600 rounded-md text-center"
                  value={settings.pomodoro_long_rest_time}
                  onChange={(e) => updateSettings('pomodoro_long_rest_time', parseInt(e.target.value))}
                  min="1"
                  max="60"
                />
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div className="font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.autostart')}
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.auto_start}
                    onChange={(e) => updateSettings('auto_start', e.target.checked)}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>
            </div>
            
            {/* Интерфейс */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                {t('settings.interface')}
              </h2>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.theme')}
                </div>
                <div className="flex items-center">
                  <select
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                    value={settings.theme}
                    onChange={(e) => updateSettings('theme', e.target.value)}
                  >
                    <option value="light">{t('settings.light')}</option>
                    <option value="dark">{t('settings.dark')}</option>
                    <option value="system">{t('settings.system')}</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.language')}
                </div>
                <LanguageSwitcher variant="select" />
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div className="font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.timeFormat')}
                </div>
                <select
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                  value={settings.timeFormat}
                  onChange={(e) => updateSettings('timeFormat', e.target.value)}
                >
                  <option value="12h">12 {t('settings.hours')} (AM/PM)</option>
                  <option value="24h">24 {t('settings.hours')} (14:30)</option>
                </select>
              </div>
            </div>
            
            {/* Трекинг времени */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t('settings.timeTracking')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-4">
                {t('settings.timeTrackingSyncAll')}
              </p>
              
              <div className="flex items-center justify-between py-3">
                <div className="font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.roundTime')}
                </div>
                <select
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                  value={settings.round_times}
                  onChange={(e) => updateSettings('round_times', e.target.value)}
                >
                  <option value="off">{t('settings.noRounding')}</option>
                  <option value="5min">5 {t('settings.minutes')}</option>
                  <option value="15min">15 {t('settings.minutes')}</option>
                  <option value="30min">30 {t('settings.minutes')}</option>
                </select>
              </div>
            </div>
            
            {/* Данные и хранение */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t('settings.data')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-4">
                {t('settings.dataStorageSettings')}
              </p>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.dataRetention')}
                </div>
                <select
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                  value={settings.data_retention_period}
                  onChange={(e) => updateSettings('data_retention_period', parseInt(e.target.value))}
                >
                  <option value="1">1 {t('settings.month')}</option>
                  <option value="3">3 {t('settings.months')}</option>
                  <option value="6">6 {t('settings.months')}</option>
                  <option value="12">12 {t('settings.months')}</option>
                  <option value="0">{t('settings.forever')}</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-gray-700 dark:text-gray-300">
                    {t('settings.cleanOldRecords')}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('settings.cleanOldRecordsDesc')}
                  </div>
                </div>
                <button
                  onClick={cleanOldRecords}
                  className="px-4 py-2 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:shadow-md transition-all"
                  disabled={cleaningStatus === 'cleaning'}
                >
                  {cleaningStatus === 'cleaning' 
                    ? t('settings.cleaning') 
                    : t('settings.clean')}
                </button>
              </div>
            </div>
            
            {/* Типы работ */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t('settings.workTypes')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-4">
                {t('settings.workTypesManage')}
              </p>
              
              <WorkTypeManager userId={user?.id || ''} />
            </div>
            
            {/* Кнопка сохранения */}
            <div className="sticky bottom-20 flex justify-center py-4 bg-gradient-to-t from-white dark:from-gray-900 to-transparent">
              <button
                onClick={saveSettings}
                className={`px-8 py-3 bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 ${
                  saveStatus === 'saving' ? 'opacity-75 cursor-wait' :
                  saveStatus === 'success' ? 'bg-gradient-to-r from-success to-success-dark' :
                  saveStatus === 'error' ? 'bg-gradient-to-r from-error to-error-dark' : ''
                }`}
                disabled={saveStatus === 'saving'}
              >
                {saveStatus === 'saving' 
                  ? t('settings.saving') 
                  : saveStatus === 'success'
                  ? t('settings.saved')
                  : saveStatus === 'error'
                  ? t('settings.saveError')
                  : t('settings.saveSettings')}
              </button>
            </div>
          </>
        )}
        
        <NavBar />
      </div>
    </div>
  );
}

export default function Settings() {
  return (
    <ProtectedRoute>
      <SettingsApp />
    </ProtectedRoute>
  );
} 