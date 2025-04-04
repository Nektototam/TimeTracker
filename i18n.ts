// Список поддерживаемых языков
export const languages = ['ru', 'en', 'he'];
export const defaultLanguage = 'ru';

// Определяем, является ли язык RTL (справа налево)
export const isRTL = (language: string): boolean => {
  return language === 'he';
};