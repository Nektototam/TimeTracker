"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import settingsService from '../lib/settingsService';

// Предотвращаем множественную инициализацию
let isI18nInitialized = false;

// Ключ для хранения языка в localStorage
const LANGUAGE_STORAGE_KEY = 'timetracker-language';

// Язык по умолчанию - английский
const DEFAULT_LANGUAGE = 'en';

// Получаем сохраненный язык или язык по умолчанию
const getSavedLanguage = (): string => {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }
  
  try {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return savedLanguage || DEFAULT_LANGUAGE;
  } catch (error) {
    console.error('Error reading language from localStorage:', error);
    return DEFAULT_LANGUAGE;
  }
};

// Получаем начальный язык для инициализации
const initialLanguage = getSavedLanguage();

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => Promise<void>;
  translationInstance: TranslationInstance;
}

interface TranslationInstance {
  t: (key: string, params?: Record<string, any>) => string;
  i18n: typeof i18n | null;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Инициализируем i18n сразу, перед использованием в компонентах
if (!isI18nInitialized) {
  try {
    i18n.use(initReactI18next).init({
      resources: {
        ru: { 
          translation: require('../../public/locales/ru/common.json')
        },
        en: { 
          translation: require('../../public/locales/en/common.json') 
        },
        he: { 
          translation: require('../../public/locales/he/common.json') 
        }
      },
      lng: initialLanguage, // Используем сохраненный язык
      fallbackLng: DEFAULT_LANGUAGE,
      interpolation: {
        escapeValue: false
      },
      react: {
        useSuspense: false
      }
    });
    isI18nInitialized = true;
    console.log(`i18next initialized successfully with language: ${initialLanguage}`);
  } catch (error) {
    console.error('Failed to initialize i18n:', error);
  }
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState<string>(initialLanguage);
  const [isDBSettingsLoaded, setIsDBSettingsLoaded] = useState(false);
  const [translationInstance, setTranslationInstance] = useState<TranslationInstance>({
    t: (key: string, params?: Record<string, any>) => i18n.t(key, params),
    i18n: i18n
  });

  // Загружаем настройки языка из базы данных при авторизации пользователя
  useEffect(() => {
    const loadLanguageFromDB = async () => {
      if (user) {
        try {
          const dbSettings = await settingsService.loadDBSettings();
          
          // Если настройка языка в БД отличается от текущей, применяем её
          if (dbSettings.language && dbSettings.language !== currentLanguage) {
            console.log(`Loading language from DB: ${dbSettings.language}`);
            await i18n.changeLanguage(dbSettings.language);
            setCurrentLanguage(dbSettings.language);
            
            // Обновляем также localStorage
            localStorage.setItem(LANGUAGE_STORAGE_KEY, dbSettings.language);
          }
          
          setIsDBSettingsLoaded(true);
        } catch (error) {
          console.error('Error loading language from database:', error);
          setIsDBSettingsLoaded(true);
        }
      }
    };
    
    loadLanguageFromDB();
  }, [user, currentLanguage]);

  const changeLanguage = useCallback(async (lang: string) => {
    try {
      // Меняем язык в i18n
      await i18n.changeLanguage(lang);
      setCurrentLanguage(lang);
      
      // Сохраняем выбранный язык в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      }
      
      // Сохраняем язык в базе данных, если пользователь авторизован
      if (user) {
        const dbSettings = await settingsService.loadDBSettings();
        dbSettings.language = lang;
        
        const saved = await settingsService.saveDBSettings(dbSettings);
        if (saved) {
          console.log(`Language ${lang} saved to database successfully`);
        } else {
          console.error(`Failed to save language ${lang} to database`);
        }
      }
      
      console.log(`Language changed to ${lang} successfully`);
    } catch (error) {
      console.error(`Failed to change language to ${lang}:`, error);
    }
  }, [user]);

  // При монтировании проверяем, инициализирован ли i18n правильно
  useEffect(() => {
    // Если i18n не был инициализирован, еще раз пытаемся инициализировать
    if (!isI18nInitialized) {
      console.warn('i18n was not initialized, trying again...');
      try {
        i18n.use(initReactI18next).init({
          resources: {
            ru: { translation: require('../../public/locales/ru/common.json') },
            en: { translation: require('../../public/locales/en/common.json') },
            he: { translation: require('../../public/locales/he/common.json') }
          },
          lng: currentLanguage,
          fallbackLng: DEFAULT_LANGUAGE,
          interpolation: {
            escapeValue: false
          },
          react: {
            useSuspense: false
          }
        });
        isI18nInitialized = true;
        console.log('i18n initialized in useEffect');
      } catch (error) {
        console.error('Failed to initialize i18n in useEffect:', error);
      }
    }
    
    // Обновляем инстанс перевода с текущим i18n
    setTranslationInstance({
      t: (key: string, params?: Record<string, any>) => i18n.t(key, params),
      i18n: i18n
    });
    
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, translationInstance }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};