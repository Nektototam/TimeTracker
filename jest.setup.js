// Импорт расширений для Jest
import '@testing-library/jest-dom';

// Мок для next/router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Мок для localStorage
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }
}

global.localStorage = new LocalStorageMock();

// Мок для i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
}));

// Мок для Audio API
window.HTMLMediaElement.prototype.play = jest.fn();
window.HTMLMediaElement.prototype.pause = jest.fn();

// Мок для API клиента
jest.mock('./src/lib/api', () => ({
  api: {
    auth: {
      me: jest.fn().mockResolvedValue({ user: null }),
      login: jest.fn().mockResolvedValue({ accessToken: 'mock-token', user: {} }),
      logout: jest.fn().mockResolvedValue({}),
    },
    timeEntries: {
      getToday: jest.fn().mockResolvedValue({ items: [] }),
      getAll: jest.fn().mockResolvedValue({ items: [] }),
      create: jest.fn().mockResolvedValue({ id: 'mock-id' }),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
    },
    settings: {
      get: jest.fn().mockResolvedValue({
        pomodoroWorkTime: 25,
        pomodoroRestTime: 5,
        pomodoroLongRestTime: 15,
        autoStart: false,
        roundTimes: 'off',
        language: 'ru',
        dataRetentionPeriod: 3,
      }),
      update: jest.fn().mockResolvedValue({}),
    },
    projectTypes: {
      getAll: jest.fn().mockResolvedValue({ items: [] }),
      create: jest.fn().mockResolvedValue({ id: 'mock-id' }),
      delete: jest.fn().mockResolvedValue({}),
    },
  },
  authToken: {
    get: jest.fn().mockReturnValue(null),
    set: jest.fn(),
    clear: jest.fn(),
  },
}));