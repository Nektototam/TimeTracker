/**
 * Форматирует длительность в миллисекундах в строку вида "чч:мм:сс"
 */
export function formatDuration(durationMs: number): string {
  if (!durationMs) return '00:00:00';
  
  const totalSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return [hours, minutes, seconds]
    .map(val => val.toString().padStart(2, '0'))
    .join(':');
}

/**
 * Форматирует длительность в человекочитаемую строку
 */
export function formatHumanReadable(durationMs: number): string {
  if (!durationMs) return '0м';
  
  const totalSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours === 0) {
    return `${minutes}м`;
  }
  
  return `${hours}ч ${minutes}м`;
}

/**
 * Форматирует время в миллисекундах в строку формата "чч:мм:сс"
 */
export function formatTime(timeMs: number): string {
  if (!timeMs) return '00:00:00';
  
  const totalSeconds = Math.floor(timeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return [hours, minutes, seconds]
    .map(val => val.toString().padStart(2, '0'))
    .join(':');
}

/**
 * Форматирует дату в формат "дд.мм.гггг"
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  });
} 