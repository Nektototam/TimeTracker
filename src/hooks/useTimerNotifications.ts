/**
 * Hook for managing timer audio notifications and browser notifications
 * Extracted from TimerContext for better separation of concerns
 */
import React, { useRef, useCallback } from 'react';

/**
 * Audio sound types available for notifications
 */
export type SoundType = 'workComplete' | 'bigBen' | 'work15' | 'pomodoroStart' | 'pomodoroComplete';

/**
 * Audio refs structure
 */
export interface AudioRefs {
  workComplete: React.RefObject<HTMLAudioElement | null>;
  bigBen: React.RefObject<HTMLAudioElement | null>;
  work15: React.RefObject<HTMLAudioElement | null>;
  pomodoroStart: React.RefObject<HTMLAudioElement | null>;
  pomodoroComplete: React.RefObject<HTMLAudioElement | null>;
}

/**
 * Hook return type
 */
export interface UseTimerNotificationsReturn {
  audioRefs: AudioRefs;
  playSound: (soundType: SoundType, title: string, message: string) => void;
  notifyWorkComplete: (projectName: string) => void;
  notifyHourMark: (projectName: string, hours: number) => void;
  notify15MinMark: (projectName: string, minutes: number) => void;
  notifyTimeLimitReached: (projectName: string) => void;
  notifyWorkStart: (projectName: string) => void;
  AudioElements: React.FC;
}

const NOTIFICATION_ICON = '/icons/timetracker-icon.png';

/**
 * Audio file paths
 */
const AUDIO_SOURCES: Record<SoundType, string> = {
  workComplete: '/sounds/work-complete.mp3',
  bigBen: '/sounds/work-complete.mp3',
  work15: '/sounds/work-15.mp3',
  pomodoroStart: '/sounds/pomodoro-start.mp3',
  pomodoroComplete: '/sounds/pomodoro-complete.mp3',
};

/**
 * Hook for managing timer notifications (audio and browser)
 */
export function useTimerNotifications(): UseTimerNotificationsReturn {
  // Audio refs
  const workCompleteRef = useRef<HTMLAudioElement | null>(null);
  const bigBenRef = useRef<HTMLAudioElement | null>(null);
  const work15Ref = useRef<HTMLAudioElement | null>(null);
  const pomodoroStartRef = useRef<HTMLAudioElement | null>(null);
  const pomodoroCompleteRef = useRef<HTMLAudioElement | null>(null);

  const audioRefs: AudioRefs = {
    workComplete: workCompleteRef,
    bigBen: bigBenRef,
    work15: work15Ref,
    pomodoroStart: pomodoroStartRef,
    pomodoroComplete: pomodoroCompleteRef,
  };

  /**
   * Get audio ref by sound type
   */
  const getAudioRef = useCallback((soundType: SoundType): React.RefObject<HTMLAudioElement | null> => {
    switch (soundType) {
      case 'workComplete':
        return workCompleteRef;
      case 'bigBen':
        return bigBenRef;
      case 'work15':
        return work15Ref;
      case 'pomodoroStart':
        return pomodoroStartRef;
      case 'pomodoroComplete':
        return pomodoroCompleteRef;
      default:
        return workCompleteRef;
    }
  }, []);

  /**
   * Show browser notification if permission is granted
   */
  const showBrowserNotification = useCallback((title: string, message: string): void => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      new Notification(title, {
        body: message,
        icon: NOTIFICATION_ICON,
      });
    }
  }, []);

  /**
   * Play audio sound and show browser notification
   */
  const playSound = useCallback((soundType: SoundType, title: string, message: string): void => {
    const audioRef = getAudioRef(soundType);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.error(`Error playing sound ${soundType}:`, err);
      });
    }

    showBrowserNotification(title, message);
  }, [getAudioRef, showBrowserNotification]);

  /**
   * Notify when work is completed
   */
  const notifyWorkComplete = useCallback((projectName: string): void => {
    playSound('workComplete', 'Задача завершена', `Вы завершили работу над "${projectName}"`);
  }, [playSound]);

  /**
   * Notify on hour mark
   */
  const notifyHourMark = useCallback((projectName: string, hours: number): void => {
    playSound('bigBen', 'Час работы', `Вы работаете над "${projectName}" уже ${hours} ч.`);
  }, [playSound]);

  /**
   * Notify on 15-minute mark
   */
  const notify15MinMark = useCallback((projectName: string, minutes: number): void => {
    playSound('work15', '15 минут работы', `Вы работаете над "${projectName}" ${minutes} минут`);
  }, [playSound]);

  /**
   * Notify when time limit is reached
   */
  const notifyTimeLimitReached = useCallback((projectName: string): void => {
    playSound('workComplete', 'Время истекло!', `Ограничение времени для "${projectName}" достигнуто`);
  }, [playSound]);

  /**
   * Notify when work starts
   */
  const notifyWorkStart = useCallback((projectName: string): void => {
    playSound('pomodoroStart', 'Начало работы', `Начало работы над "${projectName}"`);
  }, [playSound]);

  /**
   * Component that renders audio elements
   * Should be included in the Provider component
   */
  const AudioElements: React.FC = useCallback(() => {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement('audio', { ref: workCompleteRef, src: AUDIO_SOURCES.workComplete }),
      React.createElement('audio', { ref: bigBenRef, src: AUDIO_SOURCES.bigBen }),
      React.createElement('audio', { ref: work15Ref, src: AUDIO_SOURCES.work15 }),
      React.createElement('audio', { ref: pomodoroStartRef, src: AUDIO_SOURCES.pomodoroStart }),
      React.createElement('audio', { ref: pomodoroCompleteRef, src: AUDIO_SOURCES.pomodoroComplete })
    );
  }, []);

  return {
    audioRefs,
    playSound,
    notifyWorkComplete,
    notifyHourMark,
    notify15MinMark,
    notifyTimeLimitReached,
    notifyWorkStart,
    AudioElements,
  };
}
