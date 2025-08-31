import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
  UseQueryResult,
} from '@tanstack/react-query';
import { vi } from 'vitest';
import FocusPage from '../../../src/app/focus/FocusPage';
import * as focusApi from '../../../src/app/focus/api';
import * as focusAi from '../../../src/app/focus/ai';

// Mock the API hooks
vi.mock('../../../src/app/focus/api', () => ({
  useKpis: vi.fn(),
  useTodayTasks: vi.fn(),
  useTopOverdue: vi.fn(),
  useWeekTasksSummary: vi.fn(),
  useToggleTaskDone: vi.fn(),
}));

// Mock the AI function
vi.mock('../../../src/app/focus/ai', () => ({
  fetchFocusPlan: vi.fn(),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

// Mock alert
global.alert = vi.fn();

const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithQueryClient = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={mockQueryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('FocusPage', () => {
  const mockKpis = { unpaidTotal: 5000, overdueCount: 2 };
  const mockTodayTasks = [
    {
      id: '1',
      title: 'Complete project proposal',
      status: 'todo',
      priority: 'high',
      due_date: '2024-01-15',
      position: 1,
    },
    {
      id: '2',
      title: 'Review client feedback',
      status: 'done',
      priority: 'medium',
      due_date: '2024-01-15',
      position: 2,
    },
  ];
  const mockTopOverdue = [
    {
      id: 'inv-1',
      client_id: 'client-1',
      amount_total: 2500,
      due_date: '2024-01-10',
      status: 'overdue',
      days_overdue: 5,
      client_name: 'Acme Corp',
    },
  ];
  const mockWeekSummary = { dueThisWeek: 8, doneThisWeek: 5 };
  const mockToggleMutation = {
    mutate: vi.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock returns
    vi.mocked(focusApi.useKpis).mockReturnValue({
      data: mockKpis,
      isLoading: false,
      error: null,
    } as UseQueryResult<{ unpaidTotal: number; overdueCount: number }, Error>);

    vi.mocked(focusApi.useTodayTasks).mockReturnValue({
      data: mockTodayTasks,
      isLoading: false,
      error: null,
    } as UseQueryResult<
      Array<{
        id: string;
        title: string;
        status: string;
        priority: string;
        due_date: string | null;
        position: number;
      }>,
      Error
    >);

    vi.mocked(focusApi.useTopOverdue).mockReturnValue({
      data: mockTopOverdue,
      isLoading: false,
      error: null,
    } as UseQueryResult<
      Array<{
        id: string;
        client_id: string | null;
        amount_total: number;
        due_date: string | null;
        status: string;
        days_overdue: number;
        client_name: string;
      }>,
      Error
    >);

    vi.mocked(focusApi.useWeekTasksSummary).mockReturnValue({
      data: mockWeekSummary,
      isLoading: false,
      error: null,
    } as UseQueryResult<{ dueThisWeek: number; doneThisWeek: number }, Error>);

    vi.mocked(focusApi.useToggleTaskDone).mockReturnValue(
      mockToggleMutation as unknown as ReturnType<
        typeof focusApi.useToggleTaskDone
      >
    );
  });

  it('renders KPIs correctly', () => {
    renderWithQueryClient(<FocusPage />);

    expect(screen.getByText('€5,000.00')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('5/8')).toBeInTheDocument();
    expect(screen.getByText('2 tasks')).toBeInTheDocument();
  });

  it('renders today tasks with checkboxes', () => {
    renderWithQueryClient(<FocusPage />);

    expect(screen.getByText('Complete project proposal')).toBeInTheDocument();
    expect(screen.getByText('Review client feedback')).toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).not.toBeChecked(); // todo task
    expect(checkboxes[1]).toBeChecked(); // done task
  });

  it('handles task checkbox changes', () => {
    renderWithQueryClient(<FocusPage />);

    const todoCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(todoCheckbox);

    expect(mockToggleMutation.mutate).toHaveBeenCalledWith({
      id: '1',
      done: true,
    });
  });

  it('renders overdue invoices', () => {
    renderWithQueryClient(<FocusPage />);

    expect(screen.getByText('#inv-1 — Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('€2,500.00')).toBeInTheDocument();
    expect(screen.getByText('5d')).toBeInTheDocument();
  });

  it('shows empty states when no data', () => {
    vi.mocked(focusApi.useTodayTasks).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<
      Array<{
        id: string;
        title: string;
        status: string;
        priority: string;
        due_date: string | null;
        position: number;
      }>,
      Error
    >);

    vi.mocked(focusApi.useTopOverdue).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<
      Array<{
        id: string;
        client_id: string | null;
        amount_total: number;
        due_date: string | null;
        status: string;
        days_overdue: number;
        client_name: string;
      }>,
      Error
    >);

    renderWithQueryClient(<FocusPage />);

    expect(
      screen.getByText('Nothing due today. Add a task in Schedule.')
    ).toBeInTheDocument();
    expect(screen.getByText('No overdue—nice.')).toBeInTheDocument();
  });

  it('generates AI plan when button is clicked', async () => {
    const mockAiResponse = {
      headline: 'Focus on Revenue',
      top_actions: [
        {
          label: 'Follow up with Acme Corp',
          why: 'Invoice is 5 days overdue',
          nav: 'invoices' as const,
        },
      ],
      followups: ['Schedule client meeting'],
    };

    vi.mocked(focusAi.fetchFocusPlan).mockResolvedValue(mockAiResponse);

    renderWithQueryClient(<FocusPage />);

    const generateButton = screen.getByText('Generate');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(focusAi.fetchFocusPlan).toHaveBeenCalledWith({
        kpis: mockKpis,
        todayTasks: [
          {
            title: 'Complete project proposal',
            status: 'todo',
            priority: 'high',
          },
          {
            title: 'Review client feedback',
            status: 'done',
            priority: 'medium',
          },
        ],
        topOverdue: [
          {
            id: 'inv-1',
            client_name: 'Acme Corp',
            amount_total: 2500,
            days_overdue: 5,
          },
        ],
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Focus on Revenue')).toBeInTheDocument();
      expect(screen.getByText('Follow up with Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('Invoice is 5 days overdue')).toBeInTheDocument();
      expect(screen.getByText('Schedule client meeting')).toBeInTheDocument();
    });
  });

  it('shows loading state during AI generation', async () => {
    vi.mocked(focusAi.fetchFocusPlan).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    renderWithQueryClient(<FocusPage />);

    const generateButton = screen.getByText('Generate');
    fireEvent.click(generateButton);

    expect(screen.getByText('…')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('copies plan to clipboard', async () => {
    const mockAiResponse = {
      headline: "Today's Focus",
      top_actions: [
        { label: 'Action 1', why: 'Reason 1' },
        { label: 'Action 2', why: 'Reason 2' },
      ],
      followups: ['Follow up 1', 'Follow up 2'],
    };

    vi.mocked(focusAi.fetchFocusPlan).mockResolvedValue(mockAiResponse);
    vi.mocked(navigator.clipboard.writeText).mockResolvedValue();

    renderWithQueryClient(<FocusPage />);

    // Generate plan first
    const generateButton = screen.getByText('Generate');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText("Today's Focus")).toBeInTheDocument();
    });

    // Copy plan
    const copyButton = screen.getByText('Copy plan');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining("Today's Focus")
      );
      // Check for modal instead of alert
      expect(screen.getByText('Plan copied to clipboard.')).toBeInTheDocument();
    });
  });

  it('handles clipboard errors gracefully', async () => {
    const mockAiResponse = {
      headline: "Today's Focus",
      top_actions: [],
      followups: [],
    };

    vi.mocked(focusAi.fetchFocusPlan).mockResolvedValue(mockAiResponse);
    vi.mocked(navigator.clipboard.writeText).mockRejectedValue(
      new Error('Clipboard error')
    );

    renderWithQueryClient(<FocusPage />);

    // Generate plan first
    const generateButton = screen.getByText('Generate');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText("Today's Focus")).toBeInTheDocument();
    });

    // Copy plan
    const copyButton = screen.getByText('Copy plan');
    fireEvent.click(copyButton);

    await waitFor(() => {
      // Check for error modal instead of console.error
      expect(
        screen.getByText('Failed to copy plan. Please try again.')
      ).toBeInTheDocument();
    });
  });

  it('formats currency correctly', () => {
    vi.mocked(focusApi.useKpis).mockReturnValue({
      data: { unpaidTotal: 1234.56, overdueCount: 0 },
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<
      { unpaidTotal: number; overdueCount: number },
      Error
    >);

    renderWithQueryClient(<FocusPage />);

    expect(screen.getByText('€1,234.56')).toBeInTheDocument();
  });

  it('calculates week progress correctly', () => {
    vi.mocked(focusApi.useWeekTasksSummary).mockReturnValue({
      data: { dueThisWeek: 10, doneThisWeek: 7 },
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<
      { dueThisWeek: number; doneThisWeek: number },
      Error
    >);

    renderWithQueryClient(<FocusPage />);

    expect(screen.getByText('7/10')).toBeInTheDocument();
    expect(screen.getByText('(70%)')).toBeInTheDocument();
  });

  it('shows zero progress when no tasks due', () => {
    vi.mocked(focusApi.useWeekTasksSummary).mockReturnValue({
      data: { dueThisWeek: 0, doneThisWeek: 0 },
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<
      { dueThisWeek: number; doneThisWeek: number },
      Error
    >);

    renderWithQueryClient(<FocusPage />);

    expect(screen.getByText('0/0')).toBeInTheDocument();
    expect(screen.getByText('(0%)')).toBeInTheDocument();
  });
});
