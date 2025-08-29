import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  useKpis,
  useTodayTasks,
  useTopOverdue,
  useWeekTasksSummary,
  useToggleTaskDone,
} from '../../../src/app/focus/api';
import * as supabase from '../../../src/lib/supabase';
import * as dateUtils from '../../../src/app/schedule/date';

// Mock Supabase
vi.mock('../../../src/lib/supabase', () => ({
  getSupabaseClient: vi.fn(),
  isSupabaseConfigured: vi.fn(),
}));

// Mock date utilities
vi.mock('../../../src/app/schedule/date', () => ({
  startOfWeek: vi.fn(),
  addDays: vi.fn(),
  toISODate: vi.fn(),
}));

const mockSupabaseClient = {
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

describe('Focus API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabase.getSupabaseClient).mockReturnValue(
      mockSupabaseClient as unknown as ReturnType<
        typeof supabase.getSupabaseClient
      >
    );
    vi.mocked(supabase.isSupabaseConfigured).mockReturnValue(true);
    vi.mocked(dateUtils.toISODate).mockReturnValue('2024-01-15');
    vi.mocked(dateUtils.startOfWeek).mockReturnValue(new Date('2024-01-15'));
    vi.mocked(dateUtils.addDays).mockReturnValue(new Date('2024-01-22'));
  });

  describe('useKpis', () => {
    it('fetches KPIs from invoice_public when available', async () => {
      const mockData = [
        { amount_total: 1000, computed_status: 'sent', due_date: '2024-01-20' },
        {
          amount_total: 2000,
          computed_status: 'overdue',
          due_date: '2024-01-10',
        },
        { amount_total: 500, computed_status: 'paid', due_date: '2024-01-15' },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          data: mockData,
          error: null,
        }),
      });

      mockSupabaseClient.from = mockFrom;

      const { result } = renderHook(() => useKpis(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual({
          unpaidTotal: 3000,
          overdueCount: 1,
        });
      });

      expect(mockFrom).toHaveBeenCalledWith('invoice_public');
    });

    it('falls back to invoices table when invoice_public fails', async () => {
      const mockData = [
        { amount_total: 1000, status: 'sent', due_date: '2024-01-20' },
        { amount_total: 2000, status: 'overdue', due_date: '2024-01-10' },
      ];

      const mockFrom = vi
        .fn()
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            data: null,
            error: new Error('Table not found'),
          }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            data: mockData,
            error: null,
          }),
        });

      mockSupabaseClient.from = mockFrom;

      const { result } = renderHook(() => useKpis(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual({
          unpaidTotal: 3000,
          overdueCount: 1,
        });
      });

      expect(mockFrom).toHaveBeenCalledWith('invoice_public');
      expect(mockFrom).toHaveBeenCalledWith('invoices');
    });

    it('returns default values when Supabase is not configured', async () => {
      vi.mocked(supabase.isSupabaseConfigured).mockReturnValue(false);

      const { result } = renderHook(() => useKpis(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual({
          unpaidTotal: 0,
          overdueCount: 0,
        });
      });
    });
  });

  describe('useTodayTasks', () => {
    it('fetches today tasks correctly', async () => {
      const mockData = [
        {
          id: '1',
          title: 'Task 1',
          status: 'todo',
          priority: 'high',
          due_date: '2024-01-15',
          position: 1,
        },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            neq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                data: mockData,
                error: null,
              }),
            }),
          }),
        }),
      });

      mockSupabaseClient.from = mockFrom;

      const { result } = renderHook(() => useTodayTasks(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });

      expect(mockFrom).toHaveBeenCalledWith('tasks');
    });
  });

  describe('useTopOverdue', () => {
    it('fetches top overdue invoices with client names', async () => {
      const mockInvoiceData = [
        {
          id: 'inv-1',
          client_id: 'client-1',
          amount_total: 1000,
          due_date: '2024-01-10',
          computed_status: 'overdue',
        },
      ];

      const mockClientData = [{ id: 'client-1', name: 'Acme Corp' }];

      const mockFrom = vi
        .fn()
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              data: mockInvoiceData,
              error: null,
            }),
          }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              data: mockClientData,
              error: null,
            }),
          }),
        });

      mockSupabaseClient.from = mockFrom;

      const { result } = renderHook(() => useTopOverdue(3), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toHaveLength(1);
        expect(result.current.data![0]).toMatchObject({
          id: 'inv-1',
          client_name: 'Acme Corp',
          amount_total: 1000,
          days_overdue: expect.any(Number),
        });
      });
    });

    it('handles missing client names gracefully', async () => {
      const mockInvoiceData = [
        {
          id: 'inv-1',
          client_id: 'client-1',
          amount_total: 1000,
          due_date: '2024-01-10',
          computed_status: 'overdue',
        },
      ];

      const mockFrom = vi
        .fn()
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              data: mockInvoiceData,
              error: null,
            }),
          }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              data: [],
              error: null,
            }),
          }),
        });

      mockSupabaseClient.from = mockFrom;

      const { result } = renderHook(() => useTopOverdue(3), { wrapper });

      await waitFor(() => {
        expect(result.current.data![0].client_name).toBe('Client');
      });
    });
  });

  describe('useWeekTasksSummary', () => {
    it('calculates week summary correctly', async () => {
      const mockData = [
        { status: 'done', due_date: '2024-01-15' },
        { status: 'todo', due_date: '2024-01-16' },
        { status: 'done', due_date: '2024-01-17' },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            lt: vi.fn().mockReturnValue({
              data: mockData,
              error: null,
            }),
          }),
        }),
      });

      mockSupabaseClient.from = mockFrom;

      const { result } = renderHook(() => useWeekTasksSummary(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual({
          dueThisWeek: 3,
          doneThisWeek: 2,
        });
      });
    });
  });

  describe('useToggleTaskDone', () => {
    it('toggles task status correctly', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            data: null,
            error: null,
          }),
        }),
      });

      mockSupabaseClient.from = mockFrom;

      const { result } = renderHook(() => useToggleTaskDone(), { wrapper });

      await result.current.mutateAsync({ id: '1', done: true });

      expect(mockFrom).toHaveBeenCalledWith('tasks');
      expect(mockFrom().update).toHaveBeenCalledWith({ status: 'done' });
      expect(mockFrom().update().eq).toHaveBeenCalledWith('id', '1');
    });

    it('handles errors during toggle', async () => {
      const mockError = new Error('Update failed');
      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            data: null,
            error: mockError,
          }),
        }),
      });

      mockSupabaseClient.from = mockFrom;

      const { result } = renderHook(() => useToggleTaskDone(), { wrapper });

      await expect(
        result.current.mutateAsync({ id: '1', done: false })
      ).rejects.toThrow('Update failed');
    });
  });
});
