import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../utils';
import { createMockTask } from '../../utils';

vi.mock('../../../src/app/tasks/api', () => ({
  useTasks: vi.fn(),
  useCreateTask: vi.fn(),
  useUpdateTask: vi.fn(),
  useDeleteTask: vi.fn(),
}));

import TasksPage from '../../../src/app/tasks/TasksPage';
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from '../../../src/app/tasks/api';

// Type the mocked functions
const mockedUseTasks = useTasks as ReturnType<typeof vi.fn>;
const mockedUseCreateTask = useCreateTask as ReturnType<typeof vi.fn>;
const mockedUseUpdateTask = useUpdateTask as ReturnType<typeof vi.fn>;
const mockedUseDeleteTask = useDeleteTask as ReturnType<typeof vi.fn>;

describe('TasksPage', () => {
  const mockTasks = [
    createMockTask({ id: '1', title: 'Task 1', status: 'todo' }),
    createMockTask({ id: '2', title: 'Task 2', status: 'doing' }),
    createMockTask({ id: '3', title: 'Task 3', status: 'done' }),
  ];

  const mockCreateMutation = {
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null as string | null,
  };

  const mockUpdateMutation = {
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  };

  const mockDeleteMutation = {
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockedUseTasks.mockReturnValue({
      data: mockTasks,
      isLoading: false,
      error: null,
    });

    mockedUseCreateTask.mockReturnValue(mockCreateMutation);
    mockedUseUpdateTask.mockReturnValue(mockUpdateMutation);
    mockedUseDeleteTask.mockReturnValue(mockDeleteMutation);
  });

  describe('Rendering', () => {
    it('renders page title and subtitle', () => {
      renderWithProviders(<TasksPage />);

      expect(screen.getByText('Tasks')).toBeInTheDocument();
      expect(
        screen.getByText('Manage your tasks and track progress')
      ).toBeInTheDocument();
    });

    it('renders create task form', () => {
      renderWithProviders(<TasksPage />);

      expect(screen.getByPlaceholderText('Task title')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /add task/i })
      ).toBeInTheDocument();
    });

    it('renders task list when data is available', () => {
      renderWithProviders(<TasksPage />);

      expect(screen.getByDisplayValue('Task 1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Task 2')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Task 3')).toBeInTheDocument();
    });

    it('renders loading state', () => {
      mockedUseTasks.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      renderWithProviders(<TasksPage />);

      expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
    });

    it('renders error state', () => {
      mockedUseTasks.mockReturnValue({
        data: null,
        isLoading: false,
        error: 'Failed to load tasks',
      });

      renderWithProviders(<TasksPage />);

      expect(
        screen.getByText('Error loading tasks: Failed to load tasks')
      ).toBeInTheDocument();
    });

    it('renders empty state when no tasks', () => {
      mockedUseTasks.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      renderWithProviders(<TasksPage />);

      expect(
        screen.getByText('No tasks yet. Create your first task above!')
      ).toBeInTheDocument();
    });
  });

  describe('Create Task', () => {
    it('creates task with title only', async () => {
      renderWithProviders(<TasksPage />);

      const titleInput = screen.getByPlaceholderText('Task title');
      const submitButton = screen.getByRole('button', { name: /add task/i });

      fireEvent.change(titleInput, { target: { value: 'New Task' } });
      fireEvent.click(submitButton);

      expect(mockCreateMutation.mutate).toHaveBeenCalledWith(
        {
          title: 'New Task',
          due_date: null,
          project_id: null,
          priority: 'medium',
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });

    it('creates task with title and due date', async () => {
      renderWithProviders(<TasksPage />);

      const titleInput = screen.getByPlaceholderText('Task title');
      const dateInput = screen.getByLabelText('Due date');
      const submitButton = screen.getByRole('button', { name: /add task/i });

      fireEvent.change(titleInput, { target: { value: 'New Task' } });
      fireEvent.change(dateInput, { target: { value: '2024-12-31' } });
      fireEvent.click(submitButton);

      expect(mockCreateMutation.mutate).toHaveBeenCalledWith(
        {
          title: 'New Task',
          due_date: '2024-12-31',
          project_id: null,
          priority: 'medium',
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });

    it('clears form after successful creation', async () => {
      renderWithProviders(<TasksPage />);

      const titleInput = screen.getByPlaceholderText('Task title');
      const dateInput = screen.getByLabelText('Due date');
      const submitButton = screen.getByRole('button', { name: /add task/i });

      fireEvent.change(titleInput, { target: { value: 'New Task' } });
      fireEvent.change(dateInput, { target: { value: '2024-12-31' } });
      fireEvent.click(submitButton);

      // Trigger the onSuccess callback to clear the form
      const createCall = mockCreateMutation.mutate.mock.calls[0];
      const onSuccess = createCall[1]?.onSuccess;
      if (onSuccess) {
        onSuccess();
      }

      await waitFor(() => {
        expect(titleInput).toHaveValue('');
        expect(dateInput).toHaveValue('');
      });
    });

    it('shows loading state during creation', () => {
      mockCreateMutation.isPending = true;

      renderWithProviders(<TasksPage />);

      const submitButton = screen.getByText('Adding...');
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('prevents submission with empty title', () => {
      renderWithProviders(<TasksPage />);

      const submitButton = screen.getByRole('button', { name: /add task/i });
      fireEvent.click(submitButton);

      expect(mockCreateMutation.mutate).not.toHaveBeenCalled();
    });
  });

  describe('Update Task', () => {
    it('updates task title on blur', async () => {
      renderWithProviders(<TasksPage />);

      const titleInput = screen.getByDisplayValue('Task 1');
      fireEvent.change(titleInput, { target: { value: 'Updated Task 1' } });
      fireEvent.blur(titleInput);

      // Wait for debounced update
      await waitFor(
        () => {
          expect(mockUpdateMutation.mutate).toHaveBeenCalledWith({
            id: '1',
            title: 'Updated Task 1',
          });
        },
        { timeout: 1000 }
      );
    });

    it('updates task status on change', async () => {
      renderWithProviders(<TasksPage />);

      const statusSelects = screen.getAllByRole('combobox');
      const firstStatusSelect = statusSelects[0]; // First task's status select
      fireEvent.change(firstStatusSelect, { target: { value: 'done' } });

      expect(mockUpdateMutation.mutate).toHaveBeenCalledWith(
        {
          id: '1',
          status: 'done',
        },
        expect.objectContaining({
          onError: expect.any(Function),
        })
      );
    });

    it('updates task due date on change', async () => {
      renderWithProviders(<TasksPage />);

      const dateInputs = screen.getAllByLabelText(/due date for/i);
      const firstDateInput = dateInputs[0];
      fireEvent.change(firstDateInput, { target: { value: '2024-01-15' } });

      await waitFor(() => {
        expect(mockUpdateMutation.mutate).toHaveBeenCalledWith({
          id: '1',
          due_date: '2024-01-15',
        });
      });
    });

    it('handles empty due date update', async () => {
      renderWithProviders(<TasksPage />);

      const dateInputs = screen.getAllByLabelText(/due date for/i);
      const firstDateInput = dateInputs[0];
      fireEvent.change(firstDateInput, { target: { value: '' } });

      await waitFor(() => {
        expect(mockUpdateMutation.mutate).toHaveBeenCalledWith({
          id: '1',
          due_date: null,
        });
      });
    });
  });

  describe('Delete Task', () => {
    it('deletes task when delete button is clicked', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderWithProviders(<TasksPage />);

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);

      expect(mockDeleteMutation.mutate).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          onError: expect.any(Function),
        })
      );

      confirmSpy.mockRestore();
    });

    it('shows confirmation before deleting', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderWithProviders(<TasksPage />);

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);

      expect(confirmSpy).toHaveBeenCalledWith(
        'Are you sure you want to delete this task?'
      );
      expect(mockDeleteMutation.mutate).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          onError: expect.any(Function),
        })
      );

      confirmSpy.mockRestore();
    });

    it('does not delete when user cancels confirmation', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      renderWithProviders(<TasksPage />);

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);

      expect(confirmSpy).toHaveBeenCalledWith(
        'Are you sure you want to delete this task?'
      );
      expect(mockDeleteMutation.mutate).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });

  describe('Task Status Options', () => {
    it('renders all status options for each task', () => {
      renderWithProviders(<TasksPage />);

      const statusSelects = screen.getAllByRole('combobox');
      expect(statusSelects).toHaveLength(3); // One for each task

      statusSelects.forEach(select => {
        const value = (select as HTMLSelectElement).value;
        expect(value).toMatch(/todo|doing|done|blocked/);
      });
    });

    it('displays correct status labels', () => {
      renderWithProviders(<TasksPage />);

      const statusSelects = screen.getAllByRole('combobox');
      const firstSelect = statusSelects[0];

      expect(firstSelect).toHaveValue('todo');
      expect(firstSelect).toHaveTextContent('Todo');
      expect(firstSelect).toHaveTextContent('Doing');
      expect(firstSelect).toHaveTextContent('Done');
      expect(firstSelect).toHaveTextContent('Blocked');
    });
  });

  describe('Form Validation', () => {
    it('requires title for task creation', () => {
      renderWithProviders(<TasksPage />);

      const titleInput = screen.getByPlaceholderText('Task title');
      expect(titleInput).toBeRequired();
    });

    it('prevents form submission without title', () => {
      renderWithProviders(<TasksPage />);

      const submitButton = screen.getByRole('button', { name: /add task/i });
      fireEvent.click(submitButton);

      expect(mockCreateMutation.mutate).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('disables submit button during creation', () => {
      mockCreateMutation.isPending = true;

      renderWithProviders(<TasksPage />);

      const submitButton = screen.getByText('Adding...');
      expect(submitButton).toBeDisabled();
    });

    it('shows loading text during creation', () => {
      mockCreateMutation.isPending = true;

      renderWithProviders(<TasksPage />);

      expect(screen.getByText('Adding...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays API errors', () => {
      mockedUseTasks.mockReturnValue({
        data: null,
        isLoading: false,
        error: 'Network error',
      });

      renderWithProviders(<TasksPage />);

      expect(
        screen.getByText('Error loading tasks: Network error')
      ).toBeInTheDocument();
    });

    it('handles creation errors gracefully', () => {
      mockCreateMutation.isError = true;
      mockCreateMutation.error = 'Failed to create task';

      renderWithProviders(<TasksPage />);

      // The component should still render normally
      expect(screen.getByText('Tasks')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels and placeholders', () => {
      renderWithProviders(<TasksPage />);

      expect(screen.getByPlaceholderText('Task title')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /add task/i })
      ).toBeInTheDocument();
    });

    it('has proper ARIA attributes for form elements', () => {
      renderWithProviders(<TasksPage />);

      const titleInput = screen.getByPlaceholderText('Task title');
      expect(titleInput).toHaveAttribute('required');
    });

    it('has proper button roles', () => {
      renderWithProviders(<TasksPage />);

      expect(
        screen.getByRole('button', { name: /add task/i })
      ).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(
        3
      );
    });
  });

  describe('Edge Cases', () => {
    it('handles tasks with null due dates', () => {
      const tasksWithNullDates = [
        createMockTask({ id: '1', title: 'Task 1', due_date: null }),
      ];

      mockedUseTasks.mockReturnValue({
        data: tasksWithNullDates,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<TasksPage />);

      // Should have one empty date input for the task with null due date
      const dateInputs = screen.getAllByLabelText(/due date for/i);
      expect(dateInputs).toHaveLength(1);
    });

    it('handles tasks with existing due dates', () => {
      const tasksWithDates = [
        createMockTask({ id: '1', title: 'Task 1', due_date: '2024-12-31' }),
      ];

      mockedUseTasks.mockReturnValue({
        data: tasksWithDates,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<TasksPage />);

      expect(screen.getByDisplayValue('2024-12-31')).toBeInTheDocument();
    });

    it('handles very long task titles', () => {
      const longTitle = 'A'.repeat(1000);
      const tasksWithLongTitles = [
        createMockTask({ id: '1', title: longTitle }),
      ];

      mockedUseTasks.mockReturnValue({
        data: tasksWithLongTitles,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<TasksPage />);

      expect(screen.getByDisplayValue(longTitle)).toBeInTheDocument();
    });
  });
});
