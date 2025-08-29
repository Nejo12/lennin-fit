import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  fetchFocusPlan,
  FocusAIRequest,
  FocusAIResponse,
} from '../../../src/app/focus/ai';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Focus AI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchFocusPlan', () => {
    it('sends correct request to AI function', async () => {
      const mockResponse: FocusAIResponse = {
        headline: "Today's Focus",
        top_actions: [
          {
            label: 'Follow up with client',
            why: 'Invoice is overdue',
            nav: 'invoices',
          },
        ],
        followups: ['Schedule meeting'],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        redirected: false,
        type: 'default',
        url: '',
        json: async () => mockResponse,
        clone: () => ({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          redirected: false,
          type: 'default',
          url: '',
          json: async () => mockResponse,
        }),
      } as Response);

      const request: FocusAIRequest = {
        kpis: { unpaidTotal: 5000, overdueCount: 2 },
        todayTasks: [{ title: 'Task 1', status: 'todo', priority: 'high' }],
        topOverdue: [
          {
            id: 'inv-1',
            client_name: 'Acme Corp',
            amount_total: 2500,
            days_overdue: 5,
          },
        ],
      };

      const result = await fetchFocusPlan(request);

      expect(mockFetch).toHaveBeenCalled();

      expect(result).toEqual(mockResponse);
    });

    it('throws error when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers(),
        redirected: false,
        type: 'default',
        url: '',
        json: async () => ({}),
        clone: () => ({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          headers: new Headers(),
          redirected: false,
          type: 'default',
          url: '',
          json: async () => ({}),
        }),
      } as Response);

      const request: FocusAIRequest = {
        kpis: { unpaidTotal: 0, overdueCount: 0 },
        todayTasks: [],
        topOverdue: [],
      };

      await expect(fetchFocusPlan(request)).rejects.toThrow('AI focus failed');
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const request: FocusAIRequest = {
        kpis: { unpaidTotal: 0, overdueCount: 0 },
        todayTasks: [],
        topOverdue: [],
      };

      await expect(fetchFocusPlan(request)).rejects.toThrow('Network error');
    });

    it('handles malformed JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        redirected: false,
        type: 'default',
        url: '',
        json: async () => {
          throw new Error('Invalid JSON');
        },
        clone: () => ({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          redirected: false,
          type: 'default',
          url: '',
          json: async () => {
            throw new Error('Invalid JSON');
          },
        }),
      } as unknown as Response);

      const request: FocusAIRequest = {
        kpis: { unpaidTotal: 0, overdueCount: 0 },
        todayTasks: [],
        topOverdue: [],
      };

      await expect(fetchFocusPlan(request)).rejects.toThrow('Invalid JSON');
    });
  });

  describe('TypeScript types', () => {
    it('has correct FocusAIRequest type', () => {
      const request: FocusAIRequest = {
        kpis: { unpaidTotal: 1000, overdueCount: 1 },
        todayTasks: [{ title: 'Test task', status: 'todo', priority: 'high' }],
        topOverdue: [
          {
            id: 'inv-1',
            client_name: 'Test Client',
            amount_total: 500,
            days_overdue: 3,
          },
        ],
      };

      expect(request.kpis.unpaidTotal).toBe(1000);
      expect(request.todayTasks[0].title).toBe('Test task');
      expect(request.topOverdue[0].client_name).toBe('Test Client');
    });

    it('has correct FocusAIResponse type', () => {
      const response: FocusAIResponse = {
        headline: 'Test Headline',
        top_actions: [
          {
            label: 'Test Action',
            why: 'Test reason',
            nav: 'invoices',
          },
        ],
        followups: ['Test followup'],
      };

      expect(response.headline).toBe('Test Headline');
      expect(response.top_actions[0].nav).toBe('invoices');
      expect(response.followups).toHaveLength(1);
    });

    it('enforces nav type constraints', () => {
      // This should cause a TypeScript error if the type is wrong
      const validNavs: Array<FocusAIResponse['top_actions'][0]['nav']> = [
        'invoices',
        'schedule',
        'leads',
        'tasks',
      ];

      expect(validNavs).toContain('invoices');
      expect(validNavs).toContain('schedule');
      expect(validNavs).toContain('leads');
      expect(validNavs).toContain('tasks');
    });
  });
});
