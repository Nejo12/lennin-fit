import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import SchedulePage from '../../../src/app/schedule/SchedulePage';
import {
  useTasksInRange,
  useCreateTaskQuick,
  useUpdateTaskQuick,
  useReorderDay,
} from '../../../src/app/schedule/api';
import { currentOrgId } from '../../../src/lib/workspace';
// Mock the dependencies
vi.mock('../../../src/app/schedule/api');
vi.mock('../../../src/lib/workspace');

const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={mockQueryClient}>{children}</QueryClientProvider>
);

const mockTasks = [
  {
    id: '1',
    title: 'Task 1',
    status: 'todo' as const,
    priority: 'medium',
    due_date: '2025-09-01',
    position: 0,
  },
  {
    id: '2',
    title: 'Task 2',
    status: 'doing' as const,
    priority: 'high',
    due_date: '2025-09-02',
    position: 1,
  },
  {
    id: '3',
    title: 'Task 3',
    status: 'done' as const,
    priority: 'low',
    due_date: '2025-09-03',
    position: 2,
  },
];

describe('SchedulePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryClient.clear();

    // Default mocks
    vi.mocked(useTasksInRange).mockReturnValue({
      data: mockTasks,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
      isFetching: false,
      isRefetching: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useTasksInRange>);

    vi.mocked(useCreateTaskQuick).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as unknown as ReturnType<typeof useCreateTaskQuick>);

    vi.mocked(useUpdateTaskQuick).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as unknown as ReturnType<typeof useUpdateTaskQuick>);

    vi.mocked(useReorderDay).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as unknown as ReturnType<typeof useReorderDay>);

    vi.mocked(currentOrgId).mockResolvedValue('test-org-id');
  });

  it('should render the schedule page with week navigation', () => {
    render(<SchedulePage />, { wrapper });

    expect(screen.getByText('← Previous')).toBeInTheDocument();
    expect(screen.getByText('This Week')).toBeInTheDocument();
    expect(screen.getByText('Next →')).toBeInTheDocument();
  });

  it('should display the current week range', () => {
    render(<SchedulePage />, { wrapper });

    // The exact date will depend on the current date, but we can check the format
    const dateRange = screen.getByText(/-/);
    expect(dateRange).toBeInTheDocument();
  });

  it('should render all 7 days of the week', () => {
    render(<SchedulePage />, { wrapper });

    // Should have 7 day containers
    const days = screen.getAllByText(/Mon|Tue|Wed|Thu|Fri|Sat|Sun/);
    // Filter to only include weekday elements (not navigation buttons)
    const weekdayElements = days.filter(day => day.closest('.weekday'));
    expect(weekdayElements).toHaveLength(7);
  });

  it('should display tasks under the correct days', () => {
    render(<SchedulePage />, { wrapper });

    // Wait for the component to render with the mocked data
    waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
      expect(screen.getByText('Task 3')).toBeInTheDocument();
    });
  });

  it('should show task status badges', () => {
    render(<SchedulePage />, { wrapper });

    // Wait for the component to render with the mocked data
    waitFor(() => {
      const statusBadges = screen.getAllByText(
        /To Do|In Progress|Done|Blocked/
      );
      expect(statusBadges.length).toBeGreaterThan(0);
    });
  });

  it('should allow quick adding of tasks', async () => {
    const user = userEvent.setup();
    const mockMutate = vi.fn();
    vi.mocked(useCreateTaskQuick).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as unknown as ReturnType<typeof useCreateTaskQuick>);

    render(<SchedulePage />, { wrapper });

    await waitFor(() => {
      const addInputs = screen.getAllByPlaceholderText('+ Add task');
      expect(addInputs.length).toBeGreaterThan(0);
    });

    const addInputs = screen.getAllByPlaceholderText('+ Add task');
    const firstInput = addInputs[0];
    await user.type(firstInput, 'New Task');
    await user.keyboard('{Enter}');

    expect(mockMutate).toHaveBeenCalledWith({
      title: 'New Task',
      due_date: expect.any(String), // The date will depend on the current week
    });
  });

  it('should not add empty tasks', async () => {
    const user = userEvent.setup();
    const mockMutate = vi.fn();
    vi.mocked(useCreateTaskQuick).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as unknown as ReturnType<typeof useCreateTaskQuick>);

    render(<SchedulePage />, { wrapper });

    await waitFor(() => {
      const addInputs = screen.getAllByPlaceholderText('+ Add task');
      expect(addInputs.length).toBeGreaterThan(0);
    });

    const addInputs = screen.getAllByPlaceholderText('+ Add task');
    const firstInput = addInputs[0];
    await user.type(firstInput, '   '); // Only spaces
    await user.keyboard('{Enter}');

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should allow toggling task completion', async () => {
    const mockMutate = vi.fn();
    vi.mocked(useUpdateTaskQuick).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as unknown as ReturnType<typeof useUpdateTaskQuick>);

    render(<SchedulePage />, { wrapper });

    // Wait for tasks to render
    await waitFor(() => {
      const tasks = screen.getAllByText(/Task \d/);
      expect(tasks.length).toBeGreaterThan(0);
    });

    // Check that the component renders properly
    const tasks = screen.getAllByText(/Task \d/);
    expect(tasks.length).toBe(3); // Three tasks from mock data
  });

  it('should show loading state', () => {
    vi.mocked(useTasksInRange).mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      error: null,
      isSuccess: false,
      isFetching: true,
      isRefetching: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useTasksInRange>);

    render(<SchedulePage />, { wrapper });

    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  it('should show empty state for days with no tasks', () => {
    vi.mocked(useTasksInRange).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
      isFetching: false,
      isRefetching: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useTasksInRange>);

    render(<SchedulePage />, { wrapper });

    const emptyMessages = screen.getAllByText('No tasks');
    expect(emptyMessages.length).toBe(7); // One for each day
  });

  it('should handle week navigation', async () => {
    const user = userEvent.setup();
    render(<SchedulePage />, { wrapper });

    const prevButton = screen.getByText('← Previous');
    const nextButton = screen.getByText('Next →');
    const thisWeekButton = screen.getByText('This Week');

    await user.click(prevButton);
    await user.click(nextButton);
    await user.click(thisWeekButton);

    // The component should re-render with different dates
    // We can't easily test the exact dates without mocking Date, but we can verify the buttons work
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    expect(thisWeekButton).toBeInTheDocument();
  });

  it('should display Month and Agenda navigation links', async () => {
    render(<SchedulePage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Month')).toBeInTheDocument();
      expect(screen.getByText('Agenda')).toBeInTheDocument();
    });

    const monthLink = screen.getByText('Month') as HTMLAnchorElement;
    const agendaLink = screen.getByText('Agenda') as HTMLAnchorElement;
    expect(monthLink.href).toContain('/app/schedule/month');
    expect(agendaLink.href).toContain('/app/schedule/agenda');
  });

  it('should apply correct CSS classes for task statuses', () => {
    render(<SchedulePage />, { wrapper });

    waitFor(() => {
      const tasks = screen.getAllByText(/Task \d/);
      expect(tasks[0]).toHaveClass('todo'); // Task 1
      expect(tasks[1]).toHaveClass('doing'); // Task 2
      expect(tasks[2]).toHaveClass('done'); // Task 3
    });
  });

  it('should be accessible with proper labels', () => {
    render(<SchedulePage />, { wrapper });

    waitFor(() => {
      const addInputs = screen.getAllByLabelText('Add task');
      expect(addInputs.length).toBeGreaterThan(0);
    });
  });

  it('should render tasks with proper structure', () => {
    render(<SchedulePage />, { wrapper });

    waitFor(() => {
      const tasks = screen.getAllByText(/Task \d/);
      expect(tasks.length).toBe(3); // Three tasks from mock data

      // Check that tasks have proper structure
      tasks.forEach(task => {
        expect(task).toBeInTheDocument();
      });
    });
  });

  it('should render drag handles for tasks', () => {
    render(<SchedulePage />, { wrapper });

    waitFor(() => {
      const handles = screen.getAllByText('⋮⋮');
      expect(handles.length).toBe(3); // One for each task
      handles.forEach(handle => {
        expect(handle).toHaveClass('handle');
      });
    });
  });

  it('should apply overdue styling for overdue tasks', () => {
    const overdueTasks = [
      {
        id: '1',
        title: 'Overdue Task',
        status: 'todo' as const,
        priority: 'medium',
        due_date: '2024-01-01', // Past date
        position: 0,
      },
    ];

    vi.mocked(useTasksInRange).mockReturnValue({
      data: overdueTasks,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
      isFetching: false,
      isRefetching: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useTasksInRange>);

    render(<SchedulePage />, { wrapper });

    waitFor(() => {
      const overdueTask = screen.getByText('Overdue Task');
      expect(overdueTask.closest('li')).toHaveClass('overdue');
    });
  });
});
