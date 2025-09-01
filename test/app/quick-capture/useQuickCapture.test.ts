import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGlobalShortcuts } from '../../../src/app/quick-capture/useQuickCapture';

describe('useGlobalShortcuts', () => {
  const mockNewInvoice = vi.fn();
  const mockOpenQuickCapture = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock addEventListener and removeEventListener
    vi.spyOn(window, 'addEventListener');
    vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should add keydown event listener on mount', () => {
    renderHook(() => useGlobalShortcuts(mockNewInvoice, mockOpenQuickCapture));

    expect(window.addEventListener).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    );
  });

  it('should remove keydown event listener on unmount', () => {
    const { unmount } = renderHook(() =>
      useGlobalShortcuts(mockNewInvoice, mockOpenQuickCapture)
    );

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    );
  });

  it('should call newInvoice on Cmd+I (Mac)', () => {
    renderHook(() => useGlobalShortcuts(mockNewInvoice, mockOpenQuickCapture));

    // Mock Mac platform
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      writable: true,
    });

    const event = new KeyboardEvent('keydown', {
      key: 'i',
      metaKey: true,
    });

    window.dispatchEvent(event);

    expect(mockNewInvoice).toHaveBeenCalledTimes(1);
  });

  it('should call newInvoice on Ctrl+I (Windows/Linux)', () => {
    renderHook(() => useGlobalShortcuts(mockNewInvoice, mockOpenQuickCapture));

    // Mock Windows platform
    Object.defineProperty(navigator, 'platform', {
      value: 'Win32',
      writable: true,
    });

    const event = new KeyboardEvent('keydown', {
      key: 'i',
      ctrlKey: true,
    });

    window.dispatchEvent(event);

    expect(mockNewInvoice).toHaveBeenCalledTimes(1);
  });

  it('should call openQuickCapture on Cmd+T (Mac)', () => {
    renderHook(() => useGlobalShortcuts(mockNewInvoice, mockOpenQuickCapture));

    // Mock Mac platform
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      writable: true,
    });

    const event = new KeyboardEvent('keydown', {
      key: 't',
      metaKey: true,
    });

    window.dispatchEvent(event);

    expect(mockOpenQuickCapture).toHaveBeenCalledTimes(1);
  });

  it('should call openQuickCapture on Ctrl+T (Windows/Linux)', () => {
    renderHook(() => useGlobalShortcuts(mockNewInvoice, mockOpenQuickCapture));

    // Mock Windows platform
    Object.defineProperty(navigator, 'platform', {
      value: 'Win32',
      writable: true,
    });

    const event = new KeyboardEvent('keydown', {
      key: 't',
      ctrlKey: true,
    });

    window.dispatchEvent(event);

    expect(mockOpenQuickCapture).toHaveBeenCalledTimes(1);
  });

  it('should prevent default behavior for handled shortcuts', () => {
    renderHook(() => useGlobalShortcuts(mockNewInvoice, mockOpenQuickCapture));

    // Mock Mac platform
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      writable: true,
    });

    const event = new KeyboardEvent('keydown', {
      key: 'i',
      metaKey: true,
    });

    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should not trigger actions for unhandled keys', () => {
    renderHook(() => useGlobalShortcuts(mockNewInvoice, mockOpenQuickCapture));

    // Mock Mac platform
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      writable: true,
    });

    const event = new KeyboardEvent('keydown', {
      key: 'x',
      metaKey: true,
    });

    window.dispatchEvent(event);

    expect(mockNewInvoice).not.toHaveBeenCalled();
    expect(mockOpenQuickCapture).not.toHaveBeenCalled();
  });

  it('should not trigger actions without modifier keys', () => {
    renderHook(() => useGlobalShortcuts(mockNewInvoice, mockOpenQuickCapture));

    const event = new KeyboardEvent('keydown', {
      key: 'i',
    });

    window.dispatchEvent(event);

    expect(mockNewInvoice).not.toHaveBeenCalled();
    expect(mockOpenQuickCapture).not.toHaveBeenCalled();
  });

  it('should handle case insensitive keys', () => {
    renderHook(() => useGlobalShortcuts(mockNewInvoice, mockOpenQuickCapture));

    // Mock Mac platform
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      writable: true,
    });

    const event = new KeyboardEvent('keydown', {
      key: 'I', // Uppercase
      metaKey: true,
    });

    window.dispatchEvent(event);

    expect(mockNewInvoice).toHaveBeenCalledTimes(1);
  });
});
