"use client";

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { languages, defaultLanguage, isRTL } from '../../i18n';

// Предотвращаем повторную инициализацию
let isInitialized = false;

// Функция для загрузки локализаций с использованием fetch
const loadLocaleFile = async (language: string, namespace: string) => {
  try {
    const response = await fetch(`/locales/${language}/${namespace}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load ${language}/${namespace}.json`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${language}/${namespace}.json:`, error);
    return {};
  }
};

// Инициализация i18n
const initI18n = async (language: string) => {
  // Если уже инициализировано, просто меняем язык
  if (isInitialized) {
    await i18n.changeLanguage(language);
    return i18n;
  }
  
  // Загружаем ресурсы для выбранного языка
  const resources: Record<string, Record<string, any>> = {};
  
  try {
    // Загружаем основной язык
    resources[language] = {
      common: await loadLocaleFile(language, 'common'),
    };
    
    // Загружаем резервный язык, если выбранный язык не является резервным
    if (language !== defaultLanguage) {
      resources[defaultLanguage] = {
        common: await loadLocaleFile(defaultLanguage, 'common'),
      };
    }
  } catch (error) {
    console.error('Ошибка загрузки переводов:', error);
  }
  
  // Инициализируем i18next
  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: language,                   // Язык по умолчанию
      fallbackLng: defaultLanguage,    // Запасной язык
      ns: ['common'],                  // Пространства имен
      defaultNS: 'common',             // Пространство имен по умолчанию
      supportedLngs: languages,        // Поддерживаемые языки
      interpolation: {
        escapeValue: false             // Не экранировать значения (React делает это)
      },
      react: {
        useSuspense: false             // Отключаем Suspense для компонентов перевода
      },
      load: 'currentOnly',             // Загружать только текущий язык
      debug: process.env.NODE_ENV === 'development', // Дебаг только в разработке
    });
  
  isInitialized = true;
  return i18n;
};

// Утилита для получения языка из URL
export const getLanguageFromURL = (url: string): string => {
  const path = url.split('/').filter(Boolean);
  return path.length > 0 && languages.includes(path[0]) ? path[0] : defaultLanguage;
};

export default initI18n; 