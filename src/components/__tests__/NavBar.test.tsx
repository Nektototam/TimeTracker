import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import NavBar from '../NavBar';

const mockSignOut = jest.fn();
const mockUsePathname = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    signOut: mockSignOut,
  }),
}));

jest.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    currentLanguage: 'ru',
  }),
}));

describe('NavBar', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/dashboard');
    mockSignOut.mockClear();
  });

  test('renders primary navigation items', () => {
    render(<NavBar />);

    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
    expect(screen.getByText('Главная')).toBeInTheDocument();
    expect(screen.getByText('Таймер')).toBeInTheDocument();
    expect(screen.getByText('Статистика')).toBeInTheDocument();
    expect(screen.getByText('Отчеты')).toBeInTheDocument();
    expect(screen.getByText('Помидор')).toBeInTheDocument();
    expect(screen.getByText('Настройки')).toBeInTheDocument();
    expect(screen.getByText('Выход')).toBeInTheDocument();
  });

  test('marks current route as active', () => {
    render(<NavBar />);

    const dashboardLink = screen.getByRole('link', { name: /главная/i });
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');
  });

  test('supports sidebar variant layout', () => {
    render(<NavBar variant="sidebar" />);

    const nav = screen.getByRole('navigation', { name: /main navigation/i });
    expect(nav).toHaveAttribute('data-variant', 'sidebar');
  });

  test('calls signOut when logout is clicked', async () => {
    const user = userEvent.setup();
    render(<NavBar />);

    await user.click(screen.getByRole('button', { name: /выход/i }));
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});