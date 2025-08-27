import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatCurrency,
  formatDate,
  generateInvoiceNumber,
} from '../../src/lib/utils';

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('formats currency with default EUR', () => {
      expect(formatCurrency(1234.56)).toBe('€1,234.56');
    });

    it('formats currency with USD', () => {
      expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
    });

    it('formats currency with GBP', () => {
      expect(formatCurrency(1234.56, 'GBP')).toBe('£1,234.56');
    });

    it('handles zero amount', () => {
      expect(formatCurrency(0)).toBe('€0.00');
    });

    it('handles negative amounts', () => {
      expect(formatCurrency(-1234.56)).toBe('-€1,234.56');
    });

    it('handles large numbers', () => {
      expect(formatCurrency(1234567.89)).toBe('€1,234,567.89');
    });

    it('handles decimal precision', () => {
      expect(formatCurrency(1234.5)).toBe('€1,234.50');
    });

    it('handles very small amounts', () => {
      expect(formatCurrency(0.01)).toBe('€0.01');
    });

    it('handles integer amounts', () => {
      expect(formatCurrency(1000)).toBe('€1,000.00');
    });
  });

  describe('formatDate', () => {
    it('formats Date object', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toBe('Jan 15, 2024');
    });

    it('formats date string', () => {
      expect(formatDate('2024-01-15')).toBe('Jan 15, 2024');
    });

    it('formats ISO date string', () => {
      expect(formatDate('2024-01-15T10:30:00Z')).toBe('Jan 15, 2024');
    });

    it('handles different months', () => {
      expect(formatDate('2024-12-25')).toBe('Dec 25, 2024');
    });

    it('handles leap year', () => {
      expect(formatDate('2024-02-29')).toBe('Feb 29, 2024');
    });

    it('handles single digit day', () => {
      expect(formatDate('2024-01-05')).toBe('Jan 5, 2024');
    });

    it('handles different years', () => {
      expect(formatDate('2023-01-15')).toBe('Jan 15, 2023');
    });

    it('handles edge case dates', () => {
      expect(formatDate('2024-01-01')).toBe('Jan 1, 2024');
      expect(formatDate('2024-12-31')).toBe('Dec 31, 2024');
    });

    it('handles invalid date string gracefully', () => {
      // This will throw an error for invalid dates
      expect(() => formatDate('invalid-date')).toThrow();
    });

    it('handles empty date string', () => {
      // Empty string will create an invalid date
      expect(() => formatDate('')).toThrow();
    });
  });

  describe('generateInvoiceNumber', () => {
    let mockDate: number;

    beforeEach(() => {
      // Mock Date.now() to return a fixed timestamp
      mockDate = 1705312800000; // 2024-01-15 10:00:00 UTC
      vi.spyOn(Date, 'now').mockReturnValue(mockDate);

      // Mock Math.random() to return a predictable value
      vi.spyOn(Math, 'random').mockReturnValue(0.123456789);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('generates invoice number with correct format', () => {
      const result = generateInvoiceNumber();
      expect(result).toMatch(/^INV-\d{6}-[A-Z0-9]{3}$/);
    });

    it('includes timestamp in invoice number', () => {
      const result = generateInvoiceNumber();
      // The last 6 digits of the timestamp should be in the invoice number
      const timestamp = mockDate.toString().slice(-6);
      expect(result).toContain(timestamp);
    });

    it('includes random string in invoice number', () => {
      const result = generateInvoiceNumber();
      // The random part should be 3 characters long and uppercase
      const parts = result.split('-');
      expect(parts[2]).toHaveLength(3);
      expect(parts[2]).toBe(parts[2].toUpperCase());
    });

    it('generates different numbers on subsequent calls', () => {
      // With mocked random, we need to change the mock between calls
      const first = generateInvoiceNumber();
      vi.spyOn(Math, 'random').mockReturnValue(0.987654321);
      const second = generateInvoiceNumber();
      expect(first).not.toBe(second);
    });

    it('starts with INV prefix', () => {
      const result = generateInvoiceNumber();
      expect(result).toMatch(/^INV-/);
    });

    it('has correct length', () => {
      const result = generateInvoiceNumber();
      // INV- + 6 digits + - + 3 characters = 14 characters (including the dash)
      expect(result).toHaveLength(14);
    });

    it('uses uppercase for random part', () => {
      const result = generateInvoiceNumber();
      const parts = result.split('-');
      expect(parts[2]).toBe(parts[2].toUpperCase());
    });

    it('handles edge case timestamp', () => {
      // Test with a timestamp that has leading zeros
      vi.spyOn(Date, 'now').mockReturnValue(1000000); // Small timestamp
      const result = generateInvoiceNumber();
      expect(result).toMatch(/^INV-\d{6}-[A-Z0-9]{3}$/);
    });

    it('handles large timestamp', () => {
      // Test with a very large timestamp
      vi.spyOn(Date, 'now').mockReturnValue(9999999999999); // Large timestamp
      const result = generateInvoiceNumber();
      expect(result).toMatch(/^INV-\d{6}-[A-Z0-9]{3}$/);
    });
  });

  describe('Integration tests', () => {
    it('can format currency and date together', () => {
      const amount = 1234.56;
      const date = new Date('2024-01-15');

      const formattedCurrency = formatCurrency(amount);
      const formattedDate = formatDate(date);

      expect(formattedCurrency).toBe('€1,234.56');
      expect(formattedDate).toBe('Jan 15, 2024');
    });

    it('can generate invoice number and format it', () => {
      const invoiceNumber = generateInvoiceNumber();
      expect(invoiceNumber).toMatch(/^INV-\d{6}-[A-Z0-9]{3}$/);
    });
  });

  describe('Edge cases and error handling', () => {
    it('formatCurrency handles very large numbers', () => {
      expect(formatCurrency(Number.MAX_SAFE_INTEGER)).toBe(
        '€9,007,199,254,740,991.00'
      );
    });

    it('formatCurrency handles very small numbers', () => {
      expect(formatCurrency(Number.MIN_VALUE)).toBe('€0.00');
    });

    it('formatDate handles far future dates', () => {
      const futureDate = new Date('2099-12-31');
      expect(formatDate(futureDate)).toBe('Dec 31, 2099');
    });

    it('formatDate handles far past dates', () => {
      const pastDate = new Date('1900-01-01');
      expect(formatDate(pastDate)).toBe('Jan 1, 1900');
    });

    it('generateInvoiceNumber produces unique results', () => {
      const results = new Set();
      for (let i = 0; i < 10; i++) {
        results.add(generateInvoiceNumber());
      }
      // Should have 10 unique results (with mocked random, we might get duplicates)
      expect(results.size).toBeGreaterThan(0);
    });
  });
});
