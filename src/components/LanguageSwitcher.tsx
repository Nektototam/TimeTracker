"use client";

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { languages } from '../../i18n';
import { Button } from './ui/Button';
import { Select } from './ui/Select';

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
            {lang.toUpperCase()}
          </Button>
        ))}
      </div>
    );
  }

  // Селект для переключения языка
  return (
    <Select
      className={`language-switcher-select ${className}`}
      value={currentLanguage}
      onChange={(e) => handleLanguageChange(e.target.value)}
      aria-label={t('settings.language')}
    >
      {languages.map(lang => (
        <option key={lang} value={lang}>
          {t(`languages.${lang}`)}
        </option>
      ))}
    </Select>
  );
};

export default LanguageSwitcher; 