import React from 'react';
import { vi, type MockedFunction } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateClient } from '../../../src/app/leads/api';
import { supabase } from '../../../src/lib/supabase';
import { currentOrgId } from '../../../src/lib/workspace';
import type { Client } from '../../../src/types/db';

// Mock dependencies
vi.mock('../../../src/lib/supabase');
vi.mock('../../../src/lib/workspace');

interface MockSupabaseClient {
  rpc: MockedFunction<(name: string) => Promise<{ error: Error | null }>>;
  from: MockedFunction<(table: string) => MockSupabaseQueryBuilder>;
}

interface MockSupabaseQueryBuilder {
  insert: MockedFunction<
    (data: Record<string, unknown>) => MockSupabaseSelectBuilder
  >;
}

interface MockSupabaseSelectBuilder {
  select: MockedFunction<(columns: string) => MockSupabaseSingleBuilder>;
}

interface MockSupabaseSingleBuilder {
  single: MockedFunction<
    () => Promise<{ data: Client | null; error: Error | null }>
  >;
}

const mockSupabase = supabase as unknown as MockSupabaseClient;
const mockCurrentOrgId = currentOrgId as MockedFunction<typeof currentOrgId>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useCreateClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentOrgId.mockResolvedValue('org-123');
  });

  it('should create client and return client data', async () => {
    const mockClientData = { id: 'client-123', name: 'John Doe' };
    const mockPayload = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      notes: null,
    };

    mockSupabase.rpc.mockResolvedValue({ error: null });
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockClientData,
            error: null,
          }),
        }),
      }),
    } as MockSupabaseQueryBuilder);

    const { result } = renderHook(() => useCreateClient(), {
      wrapper: createWrapper(),
    });

    let createdClient: Client | undefined;
    await act(async () => {
      createdClient = await result.current.mutateAsync(mockPayload);
    });

    expect(mockSupabase.rpc).toHaveBeenCalledWith('ensure_membership');
    expect(mockSupabase.from).toHaveBeenCalledWith('clients');
    expect(createdClient!).toEqual(mockClientData);
  });

  it('should handle database errors gracefully with mock fallback', async () => {
    const mockPayload = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      notes: null,
    };

    const dbError = new Error('Database error');
    mockSupabase.rpc.mockResolvedValue({ error: null });
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: dbError,
          }),
        }),
      }),
    } as MockSupabaseQueryBuilder);

    const { result } = renderHook(() => useCreateClient(), {
      wrapper: createWrapper(),
    });

    let createdClient: Client | undefined;
    await act(async () => {
      createdClient = await result.current.mutateAsync(mockPayload);
    });

    // Should fallback to mock data when database error occurs
    expect(createdClient!).toEqual({
      id: 'mock-id',
      name: 'John Doe',
    });
  });

  it('should handle membership errors gracefully', async () => {
    const mockClientData = { id: 'client-123', name: 'John Doe' };
    const mockPayload = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      notes: null,
    };

    const membershipError = new Error('Membership error');
    mockSupabase.rpc.mockResolvedValue({ error: membershipError });
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockClientData,
            error: null,
          }),
        }),
      }),
    } as MockSupabaseQueryBuilder);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useCreateClient(), {
      wrapper: createWrapper(),
    });

    let createdClient: Client | undefined;
    await act(async () => {
      createdClient = await result.current.mutateAsync(mockPayload);
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to ensure membership:',
      membershipError
    );
    expect(createdClient!).toEqual(mockClientData);
    consoleSpy.mockRestore();
  });

  it('should fallback to mock data on error', async () => {
    const mockPayload = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      notes: null,
    };

    mockSupabase.rpc.mockRejectedValue(new Error('Connection error'));

    const { result } = renderHook(() => useCreateClient(), {
      wrapper: createWrapper(),
    });

    let createdClient: Client | undefined;
    await act(async () => {
      createdClient = await result.current.mutateAsync(mockPayload);
    });

    expect(createdClient!).toEqual({
      id: 'mock-id',
      name: 'John Doe',
    });
  });

  it('should handle minimal payload', async () => {
    const mockClientData = { id: 'client-456', name: 'Jane Doe' };
    const mockPayload = {
      name: 'Jane Doe',
      email: null,
      notes: null,
    };

    mockSupabase.rpc.mockResolvedValue({ error: null });
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockClientData,
            error: null,
          }),
        }),
      }),
    } as MockSupabaseQueryBuilder);

    const { result } = renderHook(() => useCreateClient(), {
      wrapper: createWrapper(),
    });

    let createdClient: Client | undefined;
    await act(async () => {
      createdClient = await result.current.mutateAsync(mockPayload);
    });

    expect(createdClient!).toEqual(mockClientData);
  });
});
