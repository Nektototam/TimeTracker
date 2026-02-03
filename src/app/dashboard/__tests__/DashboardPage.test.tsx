import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardPage from '../page';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'admin@example.com' },
    isLoading: false,
  }),
}));

jest.mock('@/components/dashboard/DashboardLayout', () => ({
  DashboardLayout: () => <div data-testid="dashboard-layout" />,
}));

jest.mock('@/components/NavBar', () => ({
  __esModule: true,
  default: ({ variant = 'bottom' }: { variant?: 'bottom' | 'sidebar' }) => (
    <nav aria-label="Main navigation" data-variant={variant} />
  ),
}));

describe('DashboardPage', () => {
  test('renders top bar actions for modern workflow', () => {
    render(<DashboardPage />);

    expect(screen.getAllByRole('button', { name: /new entry/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /start timer/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search projects/i)).toBeInTheDocument();
  });

  test('renders both sidebar and mobile navigation containers', () => {
    render(<DashboardPage />);

    const navs = screen.getAllByRole('navigation', { name: /main navigation/i });
    expect(navs.some((nav) => nav.getAttribute('data-variant') === 'sidebar')).toBe(true);
    expect(navs.some((nav) => nav.getAttribute('data-variant') === 'bottom')).toBe(true);
  });
});