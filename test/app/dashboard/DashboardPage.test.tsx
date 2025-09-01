import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from '../../../src/app/dashboard/DashboardPage';
import { useQuickActions } from '../../../src/app/common/actions';
import {
  useUnpaidTotal,
  useThisWeekTasks,
} from '../../../src/app/dashboard/api';
import { vi, type MockedFunction } from 'vitest';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Task } from '../../../src/types/db';

// Mock dependencies
vi.mock('@/app/common/actions');
vi.mock('@/app/dashboard/api');

interface MockQuickActions {
  newInvoice: MockedFunction<() => Promise<void>>;
  newTask: MockedFunction<() => Promise<void>>;
  scheduleMeeting: MockedFunction<() => Promise<void>>;
  addLead: MockedFunction<() => Promise<void>>;
}

const mockUseQuickActions = useQuickActions as MockedFunction<
  typeof useQuickActions
>;
const mockUseUnpaidTotal = useUnpaidTotal as MockedFunction<
  typeof useUnpaidTotal
>;
const mockUseThisWeekTasks = useThisWeekTasks as MockedFunction<
  typeof useThisWeekTasks
>;

const mockQuickActions: MockQuickActions = {
  newInvoice: vi.fn(),
  newTask: vi.fn(),
  scheduleMeeting: vi.fn(),
  addLead: vi.fn(),
};

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <DashboardPage />
    </BrowserRouter>
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseQuickActions.mockReturnValue(mockQuickActions);
    mockUseUnpaidTotal.mockReturnValue({
      data: 1500,
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<number, Error>);
    mockUseThisWeekTasks.mockReturnValue({
      data: [
        {
          id: 'task-1',
          title: 'Complete project',
          due_date: '2024-12-20',
          status: 'todo',
        },
        {
          id: 'task-2',
          title: 'Review code',
          due_date: '2024-12-22',
          status: 'doing',
        },
      ],
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<Task[], Error>);
  });

  it('should render dashboard with quick actions', () => {
    renderDashboard();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Create Invoice')).toBeInTheDocument();
    expect(screen.getByText('Add Task')).toBeInTheDocument();
    expect(screen.getByText('Schedule Meeting')).toBeInTheDocument();
    expect(screen.getByText('Add Lead')).toBeInTheDocument();
  });

  it('should call newInvoice when Create Invoice button is clicked', () => {
    renderDashboard();

    const createInvoiceButton = screen.getByText('Create Invoice');
    fireEvent.click(createInvoiceButton);

    expect(mockQuickActions.newInvoice).toHaveBeenCalledTimes(1);
  });

  it('should call newTask when Add Task button is clicked', () => {
    renderDashboard();

    const addTaskButton = screen.getByText('Add Task');
    fireEvent.click(addTaskButton);

    expect(mockQuickActions.newTask).toHaveBeenCalledTimes(1);
  });

  it('should call scheduleMeeting when Schedule Meeting button is clicked', () => {
    renderDashboard();

    const scheduleMeetingButton = screen.getByText('Schedule Meeting');
    fireEvent.click(scheduleMeetingButton);

    expect(mockQuickActions.scheduleMeeting).toHaveBeenCalledTimes(1);
  });

  it('should call addLead when Add Lead button is clicked', () => {
    renderDashboard();

    const addLeadButton = screen.getByText('Add Lead');
    fireEvent.click(addLeadButton);

    expect(mockQuickActions.addLead).toHaveBeenCalledTimes(1);
  });

  it('should display unpaid invoices total', () => {
    renderDashboard();

    expect(screen.getAllByText('€1,500')).toHaveLength(2); // One in metrics, one in section
    expect(screen.getAllByText('Unpaid Invoices')).toHaveLength(2); // One in metrics, one in section
  });

  it('should display this week tasks', () => {
    renderDashboard();

    expect(screen.getByText('Complete project')).toBeInTheDocument();
    expect(screen.getByText('Review code')).toBeInTheDocument();
    expect(screen.getByText('Due: 2024-12-20')).toBeInTheDocument();
    expect(screen.getByText('Due: 2024-12-22')).toBeInTheDocument();
  });

  it('should show loading state for unpaid invoices', () => {
    mockUseUnpaidTotal.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as unknown as UseQueryResult<number, Error>);

    renderDashboard();

    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('should show loading state for tasks', () => {
    mockUseThisWeekTasks.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as unknown as UseQueryResult<Task[], Error>);

    renderDashboard();

    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  it('should show empty state when no unpaid invoices', () => {
    mockUseUnpaidTotal.mockReturnValue({
      data: 0,
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<number, Error>);

    renderDashboard();

    expect(screen.getByText('All invoices paid!')).toBeInTheDocument();
  });

  it('should show empty state when no tasks this week', () => {
    mockUseThisWeekTasks.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<Task[], Error>);

    renderDashboard();

    expect(screen.getByText('No tasks due this week!')).toBeInTheDocument();
  });
});
