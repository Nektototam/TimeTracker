/**
 * Tests for useTimerNotifications hook
 */
import { renderHook } from '@testing-library/react';
import { useTimerNotifications } from '../useTimerNotifications';

// Mock Notification
const mockNotification = jest.fn();
Object.defineProperty(global, 'Notification', {
  value: mockNotification,
  writable: true,
  configurable: true,
});

// Define permission property with configurable: true
let notificationPermission = 'granted';
Object.defineProperty(Notification, 'permission', {
  get: () => notificationPermission,
  configurable: true,
});

describe('useTimerNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNotification.mockClear();
    notificationPermission = 'granted';
  });

  describe('initialization', () => {
    test('initializes audio refs', () => {
      const { result } = renderHook(() => useTimerNotifications());

      expect(result.current.audioRefs).toBeDefined();
      expect(result.current.audioRefs.workComplete).toBeDefined();
      expect(result.current.audioRefs.bigBen).toBeDefined();
      expect(result.current.audioRefs.work15).toBeDefined();
      expect(result.current.audioRefs.pomodoroStart).toBeDefined();
      expect(result.current.audioRefs.pomodoroComplete).toBeDefined();
    });

    test('provides all notification methods', () => {
      const { result } = renderHook(() => useTimerNotifications());

      expect(typeof result.current.playSound).toBe('function');
      expect(typeof result.current.notifyWorkComplete).toBe('function');
      expect(typeof result.current.notifyHourMark).toBe('function');
      expect(typeof result.current.notify15MinMark).toBe('function');
      expect(typeof result.current.notifyTimeLimitReached).toBe('function');
      expect(typeof result.current.notifyWorkStart).toBe('function');
    });
  });

  describe('browser notifications', () => {
    test('shows notification when permission is granted', () => {
      const { result } = renderHook(() => useTimerNotifications());

      result.current.playSound('workComplete', 'Test Title', 'Test Message');

      expect(mockNotification).toHaveBeenCalledWith('Test Title', {
        body: 'Test Message',
        icon: '/icons/timetracker-icon.png',
      });
    });

    test('does not show notification when permission is denied', () => {
      notificationPermission = 'denied';

      const { result } = renderHook(() => useTimerNotifications());

      result.current.playSound('workComplete', 'Test', 'Test');

      expect(mockNotification).not.toHaveBeenCalled();
    });
  });

  describe('notification convenience methods', () => {
    test('notifyWorkComplete shows correct notification', () => {
      const { result } = renderHook(() => useTimerNotifications());

      result.current.notifyWorkComplete('My Project');

      expect(mockNotification).toHaveBeenCalledWith(
        'Задача завершена',
        expect.objectContaining({
          body: expect.stringContaining('My Project'),
        })
      );
    });

    test('notifyHourMark shows correct notification with hours', () => {
      const { result } = renderHook(() => useTimerNotifications());

      result.current.notifyHourMark('My Project', 2);

      expect(mockNotification).toHaveBeenCalledWith(
        'Час работы',
        expect.objectContaining({
          body: expect.stringContaining('2'),
        })
      );
    });

    test('notify15MinMark shows correct notification with minutes', () => {
      const { result } = renderHook(() => useTimerNotifications());

      result.current.notify15MinMark('My Project', 30);

      expect(mockNotification).toHaveBeenCalledWith(
        '15 минут работы',
        expect.objectContaining({
          body: expect.stringContaining('30'),
        })
      );
    });

    test('notifyTimeLimitReached shows correct notification', () => {
      const { result } = renderHook(() => useTimerNotifications());

      result.current.notifyTimeLimitReached('My Project');

      expect(mockNotification).toHaveBeenCalledWith(
        'Время истекло!',
        expect.objectContaining({
          body: expect.stringContaining('My Project'),
        })
      );
    });

    test('notifyWorkStart shows correct notification', () => {
      const { result } = renderHook(() => useTimerNotifications());

      result.current.notifyWorkStart('My Project');

      expect(mockNotification).toHaveBeenCalledWith(
        'Начало работы',
        expect.objectContaining({
          body: expect.stringContaining('My Project'),
        })
      );
    });
  });

  describe('AudioElements component', () => {
    test('AudioElements is defined', () => {
      const { result } = renderHook(() => useTimerNotifications());

      expect(result.current.AudioElements).toBeDefined();
    });
  });
});
