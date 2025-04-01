"use client";

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { languages } from '../../i18n';
import { Button } from './ui/Button';

interface LanguageSwitcherProps {
  variant?: 'buttons' | 'select';
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'buttons',
  className = ''
}) => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const { t } = useTranslation();

  // Получение иконки флага для языка
  const getLanguageFlag = (lang: string) => {
    const flags: Record<string, string> = {
      ru: '🇷🇺',
      en: '🇬🇧',
      es: '🇪🇸',
      de: '🇩🇪',
      fr: '🇫🇷',
      zh: '🇨🇳',
      ja: '🇯🇵'
    };
    return flags[lang] || '';
  };

  // Обработчик изменения языка
  const handleLanguageChange = async (language: string) => {
    await changeLanguage(language);
  };

  // Кнопки для переключения языка
  if (variant === 'buttons') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {languages.map(lang => (
          <Button
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            variant={currentLanguage === lang ? 'primary' : 'outline'}
            size="sm"
            rounded="lg"
            title={t(`languages.${lang}`)}
          >
            <span className="mr-1">{getLanguageFlag(lang)}</span> {lang.toUpperCase()}
          </Button>
        ))}
      </div>
    );
  }

  // Селект для переключения языка
  return (
    <div className={`relative ${className}`}>
      <select
        className="settings-select appearance-none pl-8 pr-10 py-2 bg-white dark:bg-gray-800 border border-primary-200 dark:border-primary-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
        value={currentLanguage}
        onChange={(e) => handleLanguageChange(e.target.value)}
        aria-label={t('settings.language')}
      >
        {languages.map(lang => (
          <option key={lang} value={lang}>
            {t(`languages.${lang}`)}
          </option>
        ))}
      </select>
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        {getLanguageFlag(currentLanguage)}
      </span>
      <svg 
        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary pointer-events-none"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>
  );
};

export default LanguageSwitcher; 