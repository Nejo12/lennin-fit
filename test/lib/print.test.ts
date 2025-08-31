import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { printInvoice, downloadInvoiceAsPDF } from '../../src/lib/print';

// Mock window.print
const mockPrint = vi.fn();
Object.defineProperty(window, 'print', {
  value: mockPrint,
  writable: true,
});



describe('Print utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('printInvoice', () => {
    it('adds printing class to body and calls window.print', () => {
      printInvoice('test-invoice-id');

      expect(document.body.classList.contains('printing-invoice')).toBe(true);
      expect(mockPrint).toHaveBeenCalledTimes(1);
    });

    it('removes printing class after timeout', async () => {
      vi.useFakeTimers();

      printInvoice('test-invoice-id');

      expect(document.body.classList.contains('printing-invoice')).toBe(true);

      vi.advanceTimersByTime(1000);

      expect(document.body.classList.contains('printing-invoice')).toBe(false);

      vi.useRealTimers();
    });
  });

  describe('downloadInvoiceAsPDF', () => {
    it('calls window.print when executed', () => {
      downloadInvoiceAsPDF('test-invoice-id');

      expect(mockPrint).toHaveBeenCalledTimes(1);
    });
  });
});
