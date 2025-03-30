"use client";

import React, { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import settingsService, { AllSettings } from '../../lib/settingsService';
import WorkTypeManager from '../../components/WorkTypeManager';

function SettingsPage() {
  const { user } = useAuth();
  
  // Состояния для всех настроек
  const [settings, setSettings] = useState<AllSettings>({
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
  
  // Загрузка настроек при монтировании компонента
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const allSettings = await settingsService.loadAllSettings();
        setSettings(allSettings);
      } catch (error) {
        console.error('Ошибка загрузки настроек:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      loadSettings();
    }
  }, [user]);
  
  // Обновление состояния настроек
  const updateSettings = <K extends keyof AllSettings>(key: K, value: AllSettings[K]) => {
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
      const success = await settingsService.saveAllSettings(settings);
      
      if (success) {
        setSaveStatus('success');
        // Сбрасываем статус успеха через 3 секунды
        setTimeout(() => {
          setSaveStatus('idle');
        }, 3000);
      } else {
        setSaveStatus('error');
      }
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
        const success = await settingsService.cleanOldTimeEntries();
        
        if (success) {
          setCleaningStatus('success');
          // Сбрасываем статус успеха через 3 секунды
          setTimeout(() => {
            setCleaningStatus('idle');
          }, 3000);
        } else {
          setCleaningStatus('error');
        }
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
          <h1>Настройки</h1>
          {isLoading && <div className="settings-loading">Загрузка настроек...</div>}
        </div>
        
        <div className="settings-section slide-up">
          <h2 className="settings-section-title">Профиль пользователя</h2>
          
          <div className="user-profile">
            <div className="avatar-placeholder">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-info">
              <div className="user-email">{user?.email || 'Пользователь'}</div>
              <div className="user-id">ID: {user?.id?.substring(0, 8) || 'Не авторизован'}</div>
            </div>
          </div>
        </div>
        
        <div className="settings-section slide-up">
          <h2 className="settings-section-title">Уведомления</h2>
          <p className="settings-section-desc">Эти настройки сохраняются только для текущего устройства</p>
          
          <div className="settings-item">
            <div className="settings-item-label">Звуковые уведомления</div>
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
            <div className="settings-item-label">Уведомления браузера</div>
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
          <h2 className="settings-section-title">Pomodoro (Метод Помидора)</h2>
          <p className="settings-section-desc">Эти настройки синхронизируются между всеми устройствами</p>
          
          <div className="settings-item">
            <div className="settings-item-label">Длительность работы (мин)</div>
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
            <div className="settings-item-label">Длительность отдыха (мин)</div>
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
            <div className="settings-item-label">Длительность длинного отдыха (мин)</div>
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
            <div className="settings-item-label">Автоматически начинать следующий период</div>
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
          <h2 className="settings-section-title">Интерфейс</h2>
          
          <div className="settings-item">
            <div className="settings-item-label">Тема</div>
            <div className="settings-item-desc">Сохраняется только для текущего устройства</div>
            <select 
              className="settings-select"
              value={settings.theme}
              onChange={(e) => updateSettings('theme', e.target.value)}
              disabled={isLoading}
            >
              <option value="light">Светлая</option>
              <option value="dark">Темная</option>
              <option value="system">Как в системе</option>
            </select>
          </div>
          
          <div className="settings-item">
            <div className="settings-item-label">Язык</div>
            <div className="settings-item-desc">Синхронизируется между устройствами</div>
            <select 
              className="settings-select"
              value={settings.language}
              onChange={(e) => updateSettings('language', e.target.value)}
              disabled={isLoading}
            >
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </div>
          
          <div className="settings-item">
            <div className="settings-item-label">Формат времени</div>
            <div className="settings-item-desc">Сохраняется только для текущего устройства</div>
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
          <h2 className="settings-section-title">Трекинг времени</h2>
          <p className="settings-section-desc">Эти настройки синхронизируются между всеми устройствами</p>
          
          <div className="settings-item">
            <div className="settings-item-label">Округлять время</div>
            <select 
              className="settings-select"
              value={settings.round_times}
              onChange={(e) => updateSettings('round_times', e.target.value)}
              disabled={isLoading}
            >
              <option value="off">Не округлять</option>
              <option value="5min">До 5 минут</option>
              <option value="10min">До 10 минут</option>
              <option value="15min">До 15 минут</option>
            </select>
          </div>
        </div>
        
        <div className="settings-section slide-up">
          <h2 className="settings-section-title">Данные и хранение</h2>
          <p className="settings-section-desc">Настройки хранения данных</p>
          
          <div className="settings-item">
            <div className="settings-item-label">Срок хранения данных</div>
            <select
              className="settings-select"
              value={settings.data_retention_period}
              onChange={(e) => updateSettings('data_retention_period', Number(e.target.value))}
              disabled={isLoading}
            >
              <option value={1}>1 месяц</option>
              <option value={2}>2 месяца</option>
              <option value={3}>3 месяца</option>
              <option value={6}>6 месяцев</option>
              <option value={12}>1 год</option>
            </select>
          </div>
          
          <div className="settings-item">
            <div className="settings-item-label">Очистка старых записей</div>
            <button
              className={`settings-button ${cleaningStatus === 'cleaning' ? 'settings-button-loading' : ''} ${cleaningStatus === 'success' ? 'settings-button-success' : ''} ${cleaningStatus === 'error' ? 'settings-button-error' : ''}`}
              onClick={cleanOldRecords}
              disabled={isLoading || cleaningStatus === 'cleaning'}
            >
              {cleaningStatus === 'idle' && 'Очистить старые записи'}
              {cleaningStatus === 'cleaning' && 'Очистка...'}
              {cleaningStatus === 'success' && 'Очищено!'}
              {cleaningStatus === 'error' && 'Ошибка очистки'}
            </button>
            <div className="settings-item-description">
              Удаляет все записи старше выбранного срока хранения
            </div>
          </div>
        </div>
        
        <div className="settings-section slide-up">
          <h2 className="settings-section-title">Типы работ</h2>
          <p className="settings-section-desc">Управление списком типов работ</p>
          
          {user && <WorkTypeManager userId={user.id} />}
        </div>
        
        <div className="settings-section slide-up">
          <h2 className="settings-section-title">Данные</h2>
          
          <div className="settings-buttons">
            <button 
              className="settings-button" 
              onClick={exportData}
              disabled={isLoading}
            >
              <span className="settings-button-icon">📥</span>
              <span className="settings-button-text">Экспорт данных</span>
            </button>
          </div>
        </div>
        
        <div className="settings-save-section">
          <button
            className={`settings-save-button ${saveStatus === 'saving' ? 'settings-saving' : ''} ${saveStatus === 'success' ? 'settings-save-success' : ''} ${saveStatus === 'error' ? 'settings-save-error' : ''}`}
            onClick={saveSettings}
            disabled={isLoading || saveStatus === 'saving'}
          >
            {saveStatus === 'idle' && 'Сохранить настройки'}
            {saveStatus === 'saving' && 'Сохранение...'}
            {saveStatus === 'success' && 'Сохранено!'}
            {saveStatus === 'error' && 'Ошибка сохранения'}
          </button>
          
          {saveStatus === 'error' && (
            <div className="settings-error-message">
              Произошла ошибка при сохранении настроек. Пожалуйста, попробуйте снова.
            </div>
          )}
        </div>
        
        <NavBar />
      </div>
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