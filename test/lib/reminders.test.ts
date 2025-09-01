import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  buildReminderEmail,
  type OverdueLike,
} from '../../src/lib/reminders';

describe('formatCurrency', () => {
  it('should format EUR currency correctly', () => {
    expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
  });

  it('should format USD currency correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });

  it('should default to EUR when no currency specified', () => {
    expect(formatCurrency(1234.56)).toBe('€1,234.56');
  });

  it('should handle zero amount', () => {
    expect(formatCurrency(0, 'EUR')).toBe('€0.00');
  });

  it('should handle negative amounts', () => {
    expect(formatCurrency(-1234.56, 'EUR')).toBe('-€1,234.56');
  });

  it('should fallback to simple format on error', () => {
    // Mock Intl.NumberFormat to throw an error
    const originalIntl = global.Intl;
    global.Intl = {
      NumberFormat: Object.assign(
        () => {
          throw new Error('Test error');
        },
        {
          supportedLocalesOf: () => [],
        }
      ),
    } as unknown as typeof Intl;

    expect(formatCurrency(1234.56, 'EUR')).toBe('€1234.56');

    // Restore original Intl
    global.Intl = originalIntl;
  });
});

describe('buildReminderEmail', () => {
  const mockOverdueItem: OverdueLike = {
    id: 'inv-123456',
    client_id: 'client-789',
    client_name: 'John Doe',
    amount_total: 1500.0,
    due_date: '2024-01-15',
    days_overdue: 5,
    status: 'overdue',
  };

  it('should build reminder email with default options', () => {
    const result = buildReminderEmail(mockOverdueItem);

    expect(result.subject).toBe(
      'Friendly reminder: Invoice inv-12 (€1,500.00)'
    );
    expect(result.body).toContain('Hi John Doe,');
    expect(result.body).toContain('invoice inv-12 for €1,500.00');
    expect(result.body).toContain('5 day(s) overdue');
    expect(result.body).toContain('Thanks so much,');
    expect(result.body).toContain('—');
  });

  it('should build reminder email with custom sender', () => {
    const result = buildReminderEmail(mockOverdueItem, {
      sender: 'Jane Smith',
    });

    expect(result.body).toContain('Thanks so much,');
    expect(result.body).toContain('Jane Smith');
  });

  it('should build reminder email with custom currency', () => {
    const result = buildReminderEmail(mockOverdueItem, { currency: 'USD' });

    expect(result.subject).toBe(
      'Friendly reminder: Invoice inv-12 ($1,500.00)'
    );
    expect(result.body).toContain('invoice inv-12 for $1,500.00');
  });

  it('should handle zero days overdue', () => {
    const item = { ...mockOverdueItem, days_overdue: 0 };
    const result = buildReminderEmail(item);

    expect(result.body).toContain('0 day(s) overdue');
  });

  it('should handle null client_id', () => {
    const item = { ...mockOverdueItem, client_id: null };
    const result = buildReminderEmail(item);

    expect(result.body).toContain('Hi John Doe,');
  });

  it('should handle undefined client_id', () => {
    const item = { ...mockOverdueItem, client_id: undefined };
    const result = buildReminderEmail(item);

    expect(result.body).toContain('Hi John Doe,');
  });

  it('should format date correctly in email body', () => {
    const result = buildReminderEmail(mockOverdueItem);
    const expectedDate = new Date('2024-01-15').toLocaleDateString();

    expect(result.body).toContain(`which fell due on ${expectedDate}`);
  });

  it('should include all required email sections', () => {
    const result = buildReminderEmail(mockOverdueItem);

    const lines = result.body.split('\n');
    expect(lines).toContain(
      'Subject: Friendly reminder: Invoice inv-12 (€1,500.00)'
    );
    expect(lines).toContain('');
    expect(lines).toContain('Hi John Doe,');
    expect(lines).toContain('');
    expect(lines).toContain(
      "Hope you're well. This is a friendly reminder about invoice inv-12 for €1,500.00,"
    );
    expect(lines).toContain('which fell due on 1/15/2024 (5 day(s) overdue).');
    expect(lines).toContain('');
    expect(lines).toContain(
      "Could you let me know the expected payment date? If you've already sent it, please ignore this."
    );
    expect(lines).toContain('');
    expect(lines).toContain('Thanks so much,');
    expect(lines).toContain('—');
  });
});
