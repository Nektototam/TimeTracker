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
  const { translationInstance } = useLanguage();
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
  
  // Функция перевода
  const translate = (key: string): string => {
    const i18nTranslation = t(`settings.${key}`);
    
    // Возвращаем перевод напрямую, так как всё должно быть в файлах локализации
    return i18nTranslation === `settings.${key}` ? key : i18nTranslation;
  };

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
        
        <div className="mt-8 p-6 bg-white rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {t('settings.title')}
          </h2>
          
          {/* Здесь будет содержимое настроек */}
          <div className="text-center py-10 text-gray-500">
            {t('loading')}...
          </div>
        </div>
        
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