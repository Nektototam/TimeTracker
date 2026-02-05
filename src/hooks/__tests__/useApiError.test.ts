import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useApiError } from '../useApiError';
import { ToastProvider, useToast } from '../../contexts/ToastContext';

// Mock useToast
const mockShowToast = jest.fn();
jest.mock('../../contexts/ToastContext', () => ({
  ...jest.requireActual('../../contexts/ToastContext'),
  useToast: () => ({
    showToast: mockShowToast,
    toasts: [],
    dismissToast: jest.fn(),
  }),
}));

describe('useApiError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handleError shows error toast with message', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(ToastProvider, null, children)
    );

    const { result } = renderHook(() => useApiError(), { wrapper });

    act(() => {
      result.current.handleError(new Error('Test error message'));
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Test error message',
    });
  });

  test('handleError uses default message for unknown errors', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(ToastProvider, null, children)
    );

    const { result } = renderHook(() => useApiError(), { wrapper });

    act(() => {
      result.current.handleError('not an error object' as unknown as Error);
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Произошла ошибка',
    });
  });

  test('handleError recognizes Unauthorized error', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(ToastProvider, null, children)
    );

    const { result } = renderHook(() => useApiError(), { wrapper });

    act(() => {
      result.current.handleError(new Error('Unauthorized'));
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Сессия истекла. Пожалуйста, войдите снова.',
    });
  });

  test('handleError recognizes Network error', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(ToastProvider, null, children)
    );

    const { result } = renderHook(() => useApiError(), { wrapper });

    act(() => {
      result.current.handleError(new Error('Failed to fetch'));
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Ошибка сети. Проверьте подключение к интернету.',
    });
  });

  test('wrapAsync catches errors and shows toast', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(ToastProvider, null, children)
    );

    const { result } = renderHook(() => useApiError(), { wrapper });

    const failingFn = async () => {
      throw new Error('Async error');
    };

    await act(async () => {
      const returnValue = await result.current.wrapAsync(failingFn);
      expect(returnValue).toBeUndefined();
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Async error',
    });
  });

  test('wrapAsync returns value on success', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(ToastProvider, null, children)
    );

    const { result } = renderHook(() => useApiError(), { wrapper });

    const successFn = async () => 'success value';

    let returnValue: string | undefined;
    await act(async () => {
      returnValue = await result.current.wrapAsync(successFn);
    });

    expect(returnValue).toBe('success value');
    expect(mockShowToast).not.toHaveBeenCalled();
  });

  test('showSuccess shows success toast', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(ToastProvider, null, children)
    );

    const { result } = renderHook(() => useApiError(), { wrapper });

    act(() => {
      result.current.showSuccess('Operation completed');
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'success',
      message: 'Operation completed',
    });
  });
});
