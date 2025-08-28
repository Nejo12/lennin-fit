import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useTasksInRange,
  useCreateTaskQuick,
  useUpdateTaskQuick,
} from '../../../src/app/schedule/api';
import {
  getSupabaseClient,
  isSupabaseConfigured,
} from '../../../src/lib/supabase';
import { currentOrgId } from '../../../src/lib/workspace';

// Mock the dependencies
vi.mock('../../../src/lib/supabase');
vi.mock('../../../src/lib/workspace');

const mockSupabase = {
  from: vi.fn(),
};

const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={mockQueryClient}>{children}</QueryClientProvider>
);

describe('schedule API hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryClient.clear();

    // Default mocks
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    vi.mocked(getSupabaseClient).mockReturnValue(
      mockSupabase as unknown as ReturnType<typeof getSupabaseClient>
    );
    vi.mocked(currentOrgId).mockResolvedValue('test-org-id');
  });

  describe('useTasksInRange', () => {
    it('should fetch tasks in date range', async () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Task 1',
          status: 'todo',
          priority: 'medium',
          due_date: '2024-01-15',
        },
        {
          id: '2',
          title: 'Task 2',
          status: 'doing',
          priority: 'high',
          due_date: '2024-01-16',
        },
      ];

      const mockSelect = vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({
          lt: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockTasks, error: null }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof mockSupabase.from>);

      const { result } = renderHook(
        () => useTasksInRange('2024-01-15', '2024-01-22'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTasks);
      expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
      expect(mockSelect).toHaveBeenCalledWith(
        'id, title, status, priority, due_date'
      );
    });

    it('should return empty array when Supabase is not configured', async () => {
      vi.mocked(isSupabaseConfigured).mockReturnValue(false);

      const { result } = renderHook(
        () => useTasksInRange('2024-01-15', '2024-01-22'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database error');
      const mockSelect = vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({
          lt: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as unknown);

      const { result } = renderHook(
        () => useTasksInRange('2024-01-15', '2024-01-22'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(mockError);
    });
  });

  describe('useCreateTaskQuick', () => {
    it('should create a task successfully', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      } as unknown);

      const { result } = renderHook(() => useCreateTaskQuick(), { wrapper });

      const taskData = { title: 'New Task', due_date: '2024-01-15' };

      result.current.mutate(taskData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockInsert).toHaveBeenCalledWith({
        org_id: 'test-org-id',
        title: 'New Task',
        due_date: '2024-01-15',
        status: 'todo',
        priority: 'medium',
        position: 0,
      });
    });

    it('should handle creation errors', async () => {
      const mockError = new Error('Insert failed');
      const mockInsert = vi.fn().mockResolvedValue({ error: mockError });
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      } as unknown);

      const { result } = renderHook(() => useCreateTaskQuick(), { wrapper });

      const taskData = { title: 'New Task', due_date: '2024-01-15' };

      result.current.mutate(taskData);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(mockError);
    });
  });

  describe('useUpdateTaskQuick', () => {
    it('should update a task successfully', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });
      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
      } as unknown);

      const { result } = renderHook(() => useUpdateTaskQuick(), { wrapper });

      const updateData = { id: 'task-1', status: 'done' as const };

      result.current.mutate(updateData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockUpdate).toHaveBeenCalledWith({ id: 'task-1', status: 'done' });
    });

    it('should handle update errors', async () => {
      const mockError = new Error('Update failed');
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: mockError }),
      });
      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
      } as unknown);

      const { result } = renderHook(() => useUpdateTaskQuick(), { wrapper });

      const updateData = { id: 'task-1', status: 'done' as const };

      result.current.mutate(updateData);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(mockError);
    });

    it('should update due_date when provided', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });
      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
      } as unknown);

      const { result } = renderHook(() => useUpdateTaskQuick(), { wrapper });

      const updateData = { id: 'task-1', due_date: '2024-01-20' };

      result.current.mutate(updateData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockUpdate).toHaveBeenCalledWith({
        id: 'task-1',
        due_date: '2024-01-20',
      });
    });
  });
});
