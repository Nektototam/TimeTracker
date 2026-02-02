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
      register: jest.fn().mockResolvedValue({ accessToken: 'mock-token', user: {} }),
    },
    timeEntries: {
      today: jest.fn().mockResolvedValue({ items: [] }),
      list: jest.fn().mockResolvedValue({ items: [] }),
      create: jest.fn().mockResolvedValue({ item: { id: 'mock-id' } }),
      update: jest.fn().mockResolvedValue({ item: {} }),
      delete: jest.fn().mockResolvedValue({ ok: true }),
    },
    settings: {
      get: jest.fn().mockResolvedValue({
        settings: {
          pomodoroWorkTime: 25,
          pomodoroRestTime: 5,
          pomodoroLongRestTime: 15,
          autoStart: false,
          roundTimes: 'off',
          language: 'ru',
          dataRetentionPeriod: 3,
        },
      }),
      update: jest.fn().mockResolvedValue({ settings: {} }),
      cleanup: jest.fn().mockResolvedValue({ ok: true }),
    },
    projectTypes: {
      list: jest.fn().mockResolvedValue({ items: [] }),
      create: jest.fn().mockResolvedValue({ item: { id: 'mock-id', name: 'Test' } }),
      update: jest.fn().mockResolvedValue({ item: {} }),
      delete: jest.fn().mockResolvedValue({ ok: true }),
    },
    reports: {
      get: jest.fn().mockResolvedValue({
        startDate: '',
        endDate: '',
        totalDuration: 0,
        entries: [],
        projectSummaries: [],
      }),
    },
  },
  authToken: {
    get: jest.fn().mockReturnValue(null),
    set: jest.fn(),
    clear: jest.fn(),
  },
}));