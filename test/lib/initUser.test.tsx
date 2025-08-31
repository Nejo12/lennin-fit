/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock Supabase
vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn() as any,
    },
    rpc: vi.fn() as any,
  },
}));

// Mock workspace functions
vi.mock('../../src/lib/workspace', () => ({
  ensureUserInitialized: vi.fn(),
}));

import { useInitUser } from '../../src/lib/initUser';

describe('useInitUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.error to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes user with full name', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const { supabase } = await import('../../src/lib/supabase');
    const { ensureUserInitialized } = await import('../../src/lib/workspace');

    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: mockUser },
    });
    (ensureUserInitialized as any).mockResolvedValue(undefined);

    renderHook(() => useInitUser('John Doe'));

    // Wait for the effect to run
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(supabase.auth.getUser).toHaveBeenCalled();
    expect(ensureUserInitialized).toHaveBeenCalled();
  });

  it('handles null full name', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const { supabase } = await import('../../src/lib/supabase');
    const { ensureUserInitialized } = await import('../../src/lib/workspace');

    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: mockUser },
    });
    (ensureUserInitialized as any).mockResolvedValue(undefined);

    renderHook(() => useInitUser(undefined));

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(ensureUserInitialized).toHaveBeenCalled();
  });

  it('handles no user', async () => {
    const { supabase } = await import('../../src/lib/supabase');
    const { ensureUserInitialized } = await import('../../src/lib/workspace');

    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: null },
    });

    renderHook(() => useInitUser('John Doe'));

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(supabase.auth.getUser).toHaveBeenCalled();
    expect(ensureUserInitialized).not.toHaveBeenCalled();
  });

  it('handles initialization error gracefully', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const { supabase } = await import('../../src/lib/supabase');
    const { ensureUserInitialized } = await import('../../src/lib/workspace');

    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: mockUser },
    });
    (ensureUserInitialized as any).mockRejectedValue(new Error('Init failed'));

    renderHook(() => useInitUser('John Doe'));

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(ensureUserInitialized).toHaveBeenCalled();
  });

  it('handles general error gracefully', async () => {
    const { supabase } = await import('../../src/lib/supabase');

    (supabase.auth.getUser as any).mockRejectedValue(new Error('Auth failed'));

    renderHook(() => useInitUser('John Doe'));

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(supabase.auth.getUser).toHaveBeenCalled();
  });
});
