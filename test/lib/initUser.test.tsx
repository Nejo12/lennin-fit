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

import { useInitUser } from '../../src/lib/initUser';

describe('useInitUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.warn to avoid noise in tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes user with full name', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const { supabase } = await import('../../src/lib/supabase');
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: mockUser },
    });
    (supabase.rpc as any).mockResolvedValue({ error: null });

    renderHook(() => useInitUser('John Doe'));

    // Wait for the effect to run
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(supabase.auth.getUser).toHaveBeenCalled();
    expect(supabase.rpc).toHaveBeenCalledWith('init_user', {
      p_full_name: 'John Doe',
    });
    expect(supabase.rpc).toHaveBeenCalledWith('ensure_membership');
  });

  it('handles null full name', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const { supabase } = await import('../../src/lib/supabase');
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: mockUser },
    });
    (supabase.rpc as any).mockResolvedValue({ error: null });

    renderHook(() => useInitUser(undefined));

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(supabase.rpc).toHaveBeenCalledWith('init_user', {
      p_full_name: null,
    });
  });

  it('handles no user', async () => {
    const { supabase } = await import('../../src/lib/supabase');
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: null },
    });

    renderHook(() => useInitUser('John Doe'));

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(supabase.auth.getUser).toHaveBeenCalled();
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it('handles init_user error gracefully', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const { supabase } = await import('../../src/lib/supabase');
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: mockUser },
    });
    (supabase.rpc as any)
      .mockResolvedValueOnce({ error: new Error('Init failed') })
      .mockResolvedValueOnce({ error: null });

    renderHook(() => useInitUser('John Doe'));

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(supabase.rpc).toHaveBeenCalledWith('init_user', {
      p_full_name: 'John Doe',
    });
    expect(supabase.rpc).toHaveBeenCalledWith('ensure_membership');
  });

  it('handles ensure_membership error gracefully', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const { supabase } = await import('../../src/lib/supabase');
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: mockUser },
    });
    (supabase.rpc as any)
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: new Error('Membership failed') });

    renderHook(() => useInitUser('John Doe'));

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(supabase.rpc).toHaveBeenCalledWith('init_user', {
      p_full_name: 'John Doe',
    });
    expect(supabase.rpc).toHaveBeenCalledWith('ensure_membership');
  });

  it('handles general error gracefully', async () => {
    const { supabase } = await import('../../src/lib/supabase');
    (supabase.auth.getUser as any).mockRejectedValue(new Error('Auth failed'));

    renderHook(() => useInitUser('John Doe'));

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(supabase.auth.getUser).toHaveBeenCalled();
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
