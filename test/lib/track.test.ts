import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { track } from '../../src/lib/track';

// Mock window object
const mockWindow = {
  posthog: {
    capture: vi.fn(),
  },
  plausible: vi.fn(),
};

describe('track', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock window object
    Object.defineProperty(window, 'posthog', {
      value: mockWindow.posthog,
      writable: true,
    });
    Object.defineProperty(window, 'plausible', {
      value: mockWindow.plausible,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call posthog.capture when posthog is available', () => {
    const eventName = 'test_event';
    const props = { key: 'value' };

    track(eventName, props);

    expect(mockWindow.posthog.capture).toHaveBeenCalledWith(eventName, props);
  });

  it('should call plausible when plausible is available', () => {
    const eventName = 'test_event';
    const props = { key: 'value' };

    track(eventName, props);

    expect(mockWindow.plausible).toHaveBeenCalledWith(eventName, { props });
  });

  it('should work without props', () => {
    const eventName = 'test_event';

    track(eventName);

    expect(mockWindow.posthog.capture).toHaveBeenCalledWith(
      eventName,
      undefined
    );
    expect(mockWindow.plausible).toHaveBeenCalledWith(eventName, {
      props: undefined,
    });
  });

  it('should handle missing posthog gracefully', () => {
    window.posthog = undefined;

    const eventName = 'test_event';
    const props = { key: 'value' };

    expect(() => track(eventName, props)).not.toThrow();
    expect(mockWindow.plausible).toHaveBeenCalledWith(eventName, { props });
  });

  it('should handle missing plausible gracefully', () => {
    window.plausible = undefined;

    const eventName = 'test_event';
    const props = { key: 'value' };

    expect(() => track(eventName, props)).not.toThrow();
    expect(mockWindow.posthog.capture).toHaveBeenCalledWith(eventName, props);
  });

  it('should handle errors in posthog gracefully', () => {
    mockWindow.posthog.capture.mockImplementation(() => {
      throw new Error('PostHog error');
    });

    const eventName = 'test_event';
    const props = { key: 'value' };

    expect(() => track(eventName, props)).not.toThrow();
    // Both should be called even if posthog throws
    expect(mockWindow.posthog.capture).toHaveBeenCalledWith(eventName, props);
    expect(mockWindow.plausible).toHaveBeenCalledWith(eventName, { props });
  });

  it('should handle errors in plausible gracefully', () => {
    mockWindow.plausible.mockImplementation(() => {
      throw new Error('Plausible error');
    });

    const eventName = 'test_event';
    const props = { key: 'value' };

    expect(() => track(eventName, props)).not.toThrow();
    // Both should be called even if plausible throws
    expect(mockWindow.posthog.capture).toHaveBeenCalledWith(eventName, props);
    expect(mockWindow.plausible).toHaveBeenCalledWith(eventName, { props });
  });
});
