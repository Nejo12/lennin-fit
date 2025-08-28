import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useReorderDay,
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

const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={mockQueryClient}>{children}</QueryClientProvider>
);

describe('Schedule API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryClient.clear();

    // Default mocks
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    vi.mocked(getSupabaseClient).mockReturnValue({
      from: vi.fn(),
    } as unknown as ReturnType<typeof getSupabaseClient>);
    vi.mocked(currentOrgId).mockResolvedValue('test-org-id');
  });

  describe('useTasksInRange', () => {
    it('should fetch tasks in range with position ordering', async () => {
      const mockData = [
        {
          id: '1',
          title: 'Task 1',
          status: 'todo',
          priority: 'medium',
          due_date: '2025-01-01',
          position: 0,
        },
        {
          id: '2',
          title: 'Task 2',
          status: 'doing',
          priority: 'high',
          due_date: '2025-01-01',
          position: 1,
        },
      ];

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lt: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  order: vi
                    .fn()
                    .mockResolvedValue({ data: mockData, error: null }),
                }),
              }),
            }),
          }),
        }),
      };
      vi.mocked(getSupabaseClient).mockReturnValue(
        mockSupabase as unknown as ReturnType<typeof getSupabaseClient>
      );

      const { result } = renderHook(
        () => useTasksInRange('2025-01-01', '2025-01-02'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
    });

    it('should return empty array when Supabase is not configured', async () => {
      vi.mocked(isSupabaseConfigured).mockReturnValue(false);

      const { result } = renderHook(
        () => useTasksInRange('2025-01-01', '2025-01-02'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual([]);
      });
    });
  });

  describe('useCreateTaskQuick', () => {
    it('should create a task with correct parameters', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
      const mockAuth = {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'test-user' } },
          error: null,
        }),
      };
      vi.mocked(getSupabaseClient).mockReturnValue({
        from: mockFrom,
        auth: mockAuth,
      } as unknown as ReturnType<typeof getSupabaseClient>);

      const { result } = renderHook(() => useCreateTaskQuick(), { wrapper });

      await result.current.mutateAsync({
        title: 'New Task',
        due_date: '2025-01-01',
      });

      expect(mockFrom).toHaveBeenCalledWith('tasks');
      expect(mockInsert).toHaveBeenCalledWith({
        org_id: 'test-org-id',
        title: 'New Task',
        due_date: '2025-01-01',
        status: 'todo',
        priority: 'medium',
        position: 0,
      });
    });
  });

  describe('useUpdateTaskQuick', () => {
    it('should update a task with correct parameters', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });
      vi.mocked(getSupabaseClient).mockReturnValue({
        from: mockFrom,
      } as unknown as ReturnType<typeof getSupabaseClient>);

      const { result } = renderHook(() => useUpdateTaskQuick(), { wrapper });

      await result.current.mutateAsync({ id: '1', status: 'done' });

      expect(mockFrom).toHaveBeenCalledWith('tasks');
      expect(mockUpdate).toHaveBeenCalledWith({ id: '1', status: 'done' });
      expect(mockEq).toHaveBeenCalledWith('id', '1');
    });
  });

  describe('useReorderDay', () => {
    it('should reorder tasks with correct position updates', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      const mockFrom = vi.fn().mockReturnValue({ upsert: mockUpsert });
      vi.mocked(getSupabaseClient).mockReturnValue({
        from: mockFrom,
      } as unknown as ReturnType<typeof getSupabaseClient>);

      const { result } = renderHook(() => useReorderDay(), { wrapper });

      const params = {
        due_date: '2025-01-01',
        orderedIds: ['task-2', 'task-1', 'task-3'],
      };

      await result.current.mutateAsync(params);

      expect(mockFrom).toHaveBeenCalledWith('tasks');
      expect(mockUpsert).toHaveBeenCalledWith(
        [
          { id: 'task-2', position: 0 },
          { id: 'task-1', position: 1 },
          { id: 'task-3', position: 2 },
        ],
        { onConflict: 'id' }
      );
    });

    it('should handle upsert errors', async () => {
      const mockError = new Error('Database error');
      const mockUpsert = vi.fn().mockResolvedValue({ error: mockError });
      const mockFrom = vi.fn().mockReturnValue({ upsert: mockUpsert });
      vi.mocked(getSupabaseClient).mockReturnValue({
        from: mockFrom,
      } as unknown as ReturnType<typeof getSupabaseClient>);

      const { result } = renderHook(() => useReorderDay(), { wrapper });

      const params = {
        due_date: '2025-01-01',
        orderedIds: ['task-1', 'task-2'],
      };

      await expect(result.current.mutateAsync(params)).rejects.toThrow(
        'Database error'
      );
    });
  });
});
