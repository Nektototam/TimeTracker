import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ToastProvider, useToast } from '../ToastContext';

// Test component to access toast context
const TestComponent: React.FC = () => {
  const { showToast, toasts, dismissToast } = useToast();

  return (
    <div>
      <button
        data-testid="show-error"
        onClick={() => showToast({ type: 'error', message: 'Error message' })}
      >
        Show Error
      </button>
      <button
        data-testid="show-success"
        onClick={() => showToast({ type: 'success', message: 'Success message' })}
      >
        Show Success
      </button>
      <button
        data-testid="show-warning"
        onClick={() => showToast({ type: 'warning', message: 'Warning message' })}
      >
        Show Warning
      </button>
      <button
        data-testid="show-info"
        onClick={() => showToast({ type: 'info', message: 'Info message' })}
      >
        Show Info
      </button>
      <div data-testid="toast-count">{toasts.length}</div>
      {toasts.map((toast) => (
        <div key={toast.id} data-testid={`toast-${toast.id}`}>
          <span data-testid={`toast-type-${toast.id}`}>{toast.type}</span>
          <span data-testid={`toast-message-${toast.id}`}>{toast.message}</span>
          <button
            data-testid={`dismiss-${toast.id}`}
            onClick={() => dismissToast(toast.id)}
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
};

describe('ToastContext', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('provides default empty toasts array', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
  });

  test('showToast adds a toast to the list', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await act(async () => {
      screen.getByTestId('show-error').click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
  });

  test('toast has correct type and message', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await act(async () => {
      screen.getByTestId('show-error').click();
    });

    const toasts = screen.getAllByTestId(/^toast-message-/);
    expect(toasts[0]).toHaveTextContent('Error message');
  });

  test('supports different toast types', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await act(async () => {
      screen.getByTestId('show-error').click();
      screen.getByTestId('show-success').click();
      screen.getByTestId('show-warning').click();
      screen.getByTestId('show-info').click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('4');
  });

  test('dismissToast removes a specific toast', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await act(async () => {
      screen.getByTestId('show-error').click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');

    const dismissButtons = screen.getAllByTestId(/^dismiss-/);

    await act(async () => {
      dismissButtons[0].click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
  });

  test('toasts auto-dismiss after duration', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await act(async () => {
      screen.getByTestId('show-error').click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');

    // Default duration is 5000ms
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
  });

  test('throws error when useToast is used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useToast must be used within a ToastProvider');

    consoleError.mockRestore();
  });

  test('can show toast with custom duration', async () => {
    const TestWithDuration: React.FC = () => {
      const { showToast, toasts } = useToast();
      return (
        <div>
          <button
            data-testid="show-custom"
            onClick={() => showToast({ type: 'info', message: 'Custom', duration: 2000 })}
          >
            Show Custom
          </button>
          <div data-testid="toast-count">{toasts.length}</div>
        </div>
      );
    };

    render(
      <ToastProvider>
        <TestWithDuration />
      </ToastProvider>
    );

    await act(async () => {
      screen.getByTestId('show-custom').click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');

    // Should still be there at 1999ms
    await act(async () => {
      jest.advanceTimersByTime(1999);
    });
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');

    // Should be gone at 2000ms
    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
  });
});
