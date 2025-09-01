import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ActionBar from '../../../src/app/common/ActionBar';

// Mock the hooks
vi.mock('@/app/schedule/api', () => ({
  useCreateTaskQuick: () => ({
    mutate: vi.fn(),
  }),
}));

vi.mock('@/app/invoices/api', () => ({
  useCreateInvoice: () => ({
    mutateAsync: vi.fn().mockResolvedValue('invoice-123'),
  }),
}));

vi.mock('@/lib/track', () => ({
  track: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ActionBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all action buttons', () => {
    render(
      <TestWrapper>
        <ActionBar />
      </TestWrapper>
    );

    expect(screen.getByText('+ Task')).toBeInTheDocument();
    expect(screen.getByText('+ Invoice')).toBeInTheDocument();
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    expect(screen.getByText('Leads')).toBeInTheDocument();
  });

  it('should have correct href attributes for navigation links', () => {
    render(
      <TestWrapper>
        <ActionBar />
      </TestWrapper>
    );

    const scheduleLink = screen.getByText('Schedule');
    const leadsLink = screen.getByText('Leads');

    expect(scheduleLink.closest('a')).toHaveAttribute('href', '/app/schedule');
    expect(leadsLink.closest('a')).toHaveAttribute('href', '/app/leads');
  });

  it('should have correct CSS classes', () => {
    render(
      <TestWrapper>
        <ActionBar />
      </TestWrapper>
    );

    const container = screen.getByText('+ Task').closest('div');
    expect(container).toHaveClass('row', 'gap');

    const scheduleLink = screen.getByText('Schedule');
    const leadsLink = screen.getByText('Leads');

    expect(scheduleLink.closest('a')).toHaveClass('btn', 'btn-ghost');
    expect(leadsLink.closest('a')).toHaveClass('btn', 'btn-ghost');
  });

  it('should render task and invoice buttons with btn class', () => {
    render(
      <TestWrapper>
        <ActionBar />
      </TestWrapper>
    );

    const taskButton = screen.getByText('+ Task');
    const invoiceButton = screen.getByText('+ Invoice');

    expect(taskButton).toHaveClass('btn');
    expect(invoiceButton).toHaveClass('btn');
  });
});
