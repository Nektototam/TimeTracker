import { useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';

// Error message mappings for known error types
const ERROR_MESSAGES: Record<string, string> = {
  Unauthorized: 'Сессия истекла. Пожалуйста, войдите снова.',
  'Failed to fetch': 'Ошибка сети. Проверьте подключение к интернету.',
  'Network request failed': 'Ошибка сети. Проверьте подключение к интернету.',
  'Request failed': 'Запрос не удался. Попробуйте снова.',
};

const DEFAULT_ERROR_MESSAGE = 'Произошла ошибка';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Check for known error patterns
    for (const [pattern, message] of Object.entries(ERROR_MESSAGES)) {
      if (error.message.includes(pattern)) {
        return message;
      }
    }
    return error.message || DEFAULT_ERROR_MESSAGE;
  }
  return DEFAULT_ERROR_MESSAGE;
}

export function useApiError() {
  const { showToast } = useToast();

  const handleError = useCallback(
    (error: unknown) => {
      const message = getErrorMessage(error);
      showToast({ type: 'error', message });
    },
    [showToast]
  );

  const showSuccess = useCallback(
    (message: string) => {
      showToast({ type: 'success', message });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string) => {
      showToast({ type: 'warning', message });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string) => {
      showToast({ type: 'info', message });
    },
    [showToast]
  );

  const wrapAsync = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
      try {
        return await fn();
      } catch (error) {
        handleError(error);
        return undefined;
      }
    },
    [handleError]
  );

  return {
    handleError,
    showSuccess,
    showWarning,
    showInfo,
    wrapAsync,
  };
}
