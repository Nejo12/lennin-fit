import { renderHook, act } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { useQuickActions } from '../../../src/app/common/actions';
import { useCreateInvoice } from '../../../src/app/invoices/api';
import { useCreateTaskQuick } from '../../../src/app/schedule/api';
import { useCreateClient } from '../../../src/app/leads/api';
import { track } from '../../../src/lib/track';
import { vi, type MockedFunction } from 'vitest';

// Mock window.prompt for testing
type MockPrompt = MockedFunction<
  (message?: string, defaultText?: string) => string | null
>;

// Mock dependencies
vi.mock('react-router-dom');
vi.mock('@/app/invoices/api');
vi.mock('@/app/schedule/api');
vi.mock('@/app/leads/api');
vi.mock('@/lib/track');

interface MockMutation {
  mutateAsync: MockedFunction<(...args: unknown[]) => Promise<unknown>>;
}

const mockNavigate = vi.fn();
const mockCreateInvoice: MockMutation = {
  mutateAsync: vi.fn(),
};
const mockCreateTaskQuick: MockMutation = {
  mutateAsync: vi.fn(),
};
const mockCreateClient: MockMutation = {
  mutateAsync: vi.fn(),
};

describe('useQuickActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as MockedFunction<typeof useNavigate>).mockReturnValue(
      mockNavigate as unknown as ReturnType<typeof useNavigate>
    );
    (
      useCreateInvoice as MockedFunction<typeof useCreateInvoice>
    ).mockReturnValue(
      mockCreateInvoice as unknown as ReturnType<typeof useCreateInvoice>
    );
    (
      useCreateTaskQuick as MockedFunction<typeof useCreateTaskQuick>
    ).mockReturnValue(
      mockCreateTaskQuick as unknown as ReturnType<typeof useCreateTaskQuick>
    );
    (useCreateClient as MockedFunction<typeof useCreateClient>).mockReturnValue(
      mockCreateClient as unknown as ReturnType<typeof useCreateClient>
    );
  });

  describe('newInvoice', () => {
    it('should create invoice and navigate to invoices page', async () => {
      const mockInvoiceId = 'invoice-123';
      mockCreateInvoice.mutateAsync.mockResolvedValue(mockInvoiceId);

      const { result } = renderHook(() => useQuickActions());

      await act(async () => {
        await result.current.newInvoice();
      });

      expect(mockCreateInvoice.mutateAsync).toHaveBeenCalledWith({
        client_id: undefined,
        notes: '',
      });
      expect(track).toHaveBeenCalledWith('qa_new_invoice', {
        id: mockInvoiceId,
        client: null,
      });
      expect(mockNavigate).toHaveBeenCalledWith(
        '/app/invoices?open=invoice-123'
      );
    });

    it('should create invoice with client_id and notes', async () => {
      const mockInvoiceId = 'invoice-456';
      const options = {
        client_id: 'client-123',
        notes: 'Test notes',
      };
      mockCreateInvoice.mutateAsync.mockResolvedValue(mockInvoiceId);

      const { result } = renderHook(() => useQuickActions());

      await act(async () => {
        await result.current.newInvoice(options);
      });

      expect(mockCreateInvoice.mutateAsync).toHaveBeenCalledWith({
        client_id: 'client-123',
        notes: 'Test notes',
      });
      expect(track).toHaveBeenCalledWith('qa_new_invoice', {
        id: mockInvoiceId,
        client: 'client-123',
      });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Failed to create invoice');
      mockCreateInvoice.mutateAsync.mockRejectedValue(error);
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useQuickActions());

      await act(async () => {
        await expect(result.current.newInvoice()).rejects.toThrow(
          'Failed to create invoice'
        );
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to create invoice:',
        error
      );
      consoleSpy.mockRestore();
    });
  });

  describe('newTask', () => {
    it('should create task with default values and navigate to schedule', async () => {
      mockCreateTaskQuick.mutateAsync.mockResolvedValue(undefined);

      const { result } = renderHook(() => useQuickActions());

      await act(async () => {
        await result.current.newTask();
      });

      const expectedDate = new Date().toISOString().slice(0, 10);
      expect(mockCreateTaskQuick.mutateAsync).toHaveBeenCalledWith({
        title: 'New task',
        due_date: expectedDate,
      });
      expect(track).toHaveBeenCalledWith('qa_new_task', {
        title: 'New task',
        due_date: expectedDate,
      });
      expect(mockNavigate).toHaveBeenCalledWith('/app/schedule');
    });

    it('should create task with custom title and due date', async () => {
      const customDate = new Date('2024-12-25');
      mockCreateTaskQuick.mutateAsync.mockResolvedValue(undefined);

      const { result } = renderHook(() => useQuickActions());

      await act(async () => {
        await result.current.newTask({
          title: 'Custom task',
          due: customDate,
        });
      });

      expect(mockCreateTaskQuick.mutateAsync).toHaveBeenCalledWith({
        title: 'Custom task',
        due_date: '2024-12-25',
      });
      expect(track).toHaveBeenCalledWith('qa_new_task', {
        title: 'Custom task',
        due_date: '2024-12-25',
      });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Failed to create task');
      mockCreateTaskQuick.mutateAsync.mockRejectedValue(error);
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useQuickActions());

      await act(async () => {
        await expect(result.current.newTask()).rejects.toThrow(
          'Failed to create task'
        );
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to create task:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('scheduleMeeting', () => {
    beforeEach(() => {
      // Mock window.prompt
      (global as typeof globalThis & { prompt: MockPrompt }).prompt =
        vi.fn() as MockPrompt;
    });

    afterEach(() => {
      (global as typeof globalThis & { prompt?: MockPrompt }).prompt =
        undefined as unknown as MockPrompt;
    });

    it('should schedule meeting with user input', async () => {
      (global as typeof globalThis & { prompt: MockPrompt }).prompt
        .mockReturnValueOnce('Client Meeting')
        .mockReturnValueOnce('2024-12-25');
      mockCreateTaskQuick.mutateAsync.mockResolvedValue(undefined);

      const { result } = renderHook(() => useQuickActions());

      await act(async () => {
        await result.current.scheduleMeeting();
      });

      expect(global.prompt).toHaveBeenCalledWith(
        'Meeting title?',
        'Client call'
      );
      expect(global.prompt).toHaveBeenCalledWith(
        'Date (YYYY-MM-DD)?',
        expect.any(String)
      );
      expect(mockCreateTaskQuick.mutateAsync).toHaveBeenCalledWith({
        title: 'Meeting: Client Meeting',
        due_date: '2024-12-25',
      });
      expect(track).toHaveBeenCalledWith('qa_schedule_meeting', {
        title: 'Client Meeting',
        due_date: '2024-12-25',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/app/schedule');
    });

    it('should not create meeting if title is cancelled', async () => {
      (
        global as typeof globalThis & { prompt: MockPrompt }
      ).prompt.mockReturnValueOnce(null);

      const { result } = renderHook(() => useQuickActions());

      await act(async () => {
        await result.current.scheduleMeeting();
      });

      expect(mockCreateTaskQuick.mutateAsync).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should not create meeting if date is cancelled', async () => {
      (global as typeof globalThis & { prompt: MockPrompt }).prompt
        .mockReturnValueOnce('Client Meeting')
        .mockReturnValueOnce(null);

      const { result } = renderHook(() => useQuickActions());

      await act(async () => {
        await result.current.scheduleMeeting();
      });

      expect(mockCreateTaskQuick.mutateAsync).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      (global as typeof globalThis & { prompt: MockPrompt }).prompt
        .mockReturnValueOnce('Client Meeting')
        .mockReturnValueOnce('2024-12-25');
      const error = new Error('Failed to schedule meeting');
      mockCreateTaskQuick.mutateAsync.mockRejectedValue(error);
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useQuickActions());

      await act(async () => {
        await expect(result.current.scheduleMeeting()).rejects.toThrow(
          'Failed to schedule meeting'
        );
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to schedule meeting:',
        error
      );
      consoleSpy.mockRestore();
    });
  });

  describe('addLead', () => {
    beforeEach(() => {
      // Mock window.prompt
      (global as typeof globalThis & { prompt: MockPrompt }).prompt =
        vi.fn() as MockPrompt;
    });

    afterEach(() => {
      (global as typeof globalThis & { prompt?: MockPrompt }).prompt =
        undefined as unknown as MockPrompt;
    });

    it('should add lead with user input', async () => {
      const mockClient = { id: 'client-123', name: 'John Doe' };
      (global as typeof globalThis & { prompt: MockPrompt }).prompt
        .mockReturnValueOnce('John Doe')
        .mockReturnValueOnce('john@example.com')
        .mockReturnValueOnce('+1234567890');
      mockCreateClient.mutateAsync.mockResolvedValue(mockClient);

      const { result } = renderHook(() => useQuickActions());

      await act(async () => {
        await result.current.addLead();
      });

      expect(global.prompt).toHaveBeenCalledWith('Lead / Client name?');
      expect(global.prompt).toHaveBeenCalledWith('Client email? (optional)');
      expect(global.prompt).toHaveBeenCalledWith('Client phone? (optional)');
      expect(mockCreateClient.mutateAsync).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
      });
      expect(track).toHaveBeenCalledWith('qa_add_lead', {
        client_id: 'client-123',
        name: 'John Doe',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/app/leads?open=client-123');
    });

    it('should add lead with minimal input', async () => {
      const mockClient = { id: 'client-456', name: 'Jane Doe' };
      (global as typeof globalThis & { prompt: MockPrompt }).prompt
        .mockReturnValueOnce('Jane Doe')
        .mockReturnValueOnce('')
        .mockReturnValueOnce('');
      mockCreateClient.mutateAsync.mockResolvedValue(mockClient);

      const { result } = renderHook(() => useQuickActions());

      await act(async () => {
        await result.current.addLead();
      });

      expect(mockCreateClient.mutateAsync).toHaveBeenCalledWith({
        name: 'Jane Doe',
        email: null,
        phone: null,
      });
    });

    it('should not add lead if name is cancelled', async () => {
      (
        global as typeof globalThis & { prompt: MockPrompt }
      ).prompt.mockReturnValueOnce(null);

      const { result } = renderHook(() => useQuickActions());

      await act(async () => {
        await result.current.addLead();
      });

      expect(mockCreateClient.mutateAsync).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      (global as typeof globalThis & { prompt: MockPrompt }).prompt
        .mockReturnValueOnce('John Doe')
        .mockReturnValueOnce('')
        .mockReturnValueOnce('');
      const error = new Error('Failed to add lead');
      mockCreateClient.mutateAsync.mockRejectedValue(error);
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useQuickActions());

      await act(async () => {
        await expect(result.current.addLead()).rejects.toThrow(
          'Failed to add lead'
        );
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to add lead:', error);
      consoleSpy.mockRestore();
    });
  });
});
