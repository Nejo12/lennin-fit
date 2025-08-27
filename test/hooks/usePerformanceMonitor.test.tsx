import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock analytics
vi.mock('../../src/lib/analytics', () => ({
  analytics: {
    trackEvent: vi.fn(),
  },
}));

import { usePerformanceMonitor } from '../../src/hooks/usePerformanceMonitor';

describe('usePerformanceMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should initialize with default options', () => {
      const { result } = renderHook(() =>
        usePerformanceMonitor('TestComponent')
      );

      expect(result.current.metrics).toEqual([]);
      expect(typeof result.current.getSlowOperations).toBe('function');
      expect(typeof result.current.clearMetrics).toBe('function');
    });

    it('should respect enabled option', () => {
      const { result } = renderHook(() =>
        usePerformanceMonitor('TestComponent', { enabled: false })
      );

      expect(result.current.isMonitoring).toBe(false);
    });

    it('should handle missing PerformanceObserver gracefully', () => {
      // Remove PerformanceObserver
      delete (global as Record<string, unknown>).PerformanceObserver;

      const { result } = renderHook(() =>
        usePerformanceMonitor('TestComponent')
      );

      expect(result.current.isMonitoring).toBe(false);
    });
  });

  describe('Utility functions', () => {
    it('should filter slow operations correctly', () => {
      const { result } = renderHook(() =>
        usePerformanceMonitor('TestComponent', { threshold: 50 })
      );

      // Add metrics with different durations
      result.current.metrics.push(
        {
          name: 'fast',
          duration: 30,
          timestamp: Date.now(),
          component: 'TestComponent',
          type: 'measure',
        },
        {
          name: 'slow',
          duration: 80,
          timestamp: Date.now(),
          component: 'TestComponent',
          type: 'measure',
        }
      );

      const slowOps = result.current.getSlowOperations();
      expect(slowOps).toHaveLength(1);
      expect(slowOps[0].name).toBe('slow');
    });

    it('should clear metrics correctly with getSlowOperations', () => {
      const { result } = renderHook(() =>
        usePerformanceMonitor('TestComponent', { threshold: 50 })
      );

      // Add some metrics manually
      const testMetric = {
        name: 'test',
        duration: 100,
        timestamp: Date.now(),
        component: 'TestComponent',
        type: 'measure',
      };

      result.current.metrics.push(testMetric);

      expect(result.current.getSlowOperations()).toHaveLength(1);

      result.current.clearMetrics();

      // The slow operations should be cleared
      expect(result.current.getSlowOperations()).toHaveLength(0);
    });
  });

  describe('Sampling', () => {
    it('should respect sample rate', () => {
      // Mock PerformanceObserver to be supported
      global.PerformanceObserver =
        vi.fn() as unknown as typeof PerformanceObserver;

      // Test with sample rate 0.0 (should always be false)
      const { result: result1 } = renderHook(() =>
        usePerformanceMonitor('TestComponent', { sampleRate: 0.0 })
      );

      // Test with sample rate 1.0 (should always be true)
      const { result: result2 } = renderHook(() =>
        usePerformanceMonitor('TestComponent', { sampleRate: 1.0 })
      );

      expect(result1.current.isMonitoring).toBe(false); // 0.0 sample rate
      expect(result2.current.isMonitoring).toBe(true); // 1.0 sample rate
    });
  });
});
