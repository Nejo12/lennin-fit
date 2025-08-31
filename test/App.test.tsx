import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from './utils';
import App from '../src/App';

// Mock the router to avoid navigation issues in tests
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Routes: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Route: ({ element }: { element: React.ReactNode }) => <div>{element}</div>,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
}));

describe('App', () => {
  it('renders without crashing', () => {
    renderWithProviders(<App />);
    // App should render without throwing errors
    expect(document.body).toBeInTheDocument();
  });

  it('renders with providers', () => {
    const { container } = renderWithProviders(<App />);
    expect(container).toBeInTheDocument();
  });
});
