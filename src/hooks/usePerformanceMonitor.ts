import { useEffect, useRef, useCallback } from 'react';
import { analytics } from '../lib/analytics';

// Type definitions for performance metrics
export interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
  component: string;
  type: string;
  severity?: 'warning' | 'critical';
}

export interface PerformanceMonitorOptions {
  threshold?: number;
  trackSlowRenders?: boolean;
  trackMemoryUsage?: boolean;
  enabled?: boolean;
  sampleRate?: number; // 0-1, percentage of users to monitor
}

export interface PerformanceMonitorReturn {
  metrics: PerformanceMetrics[];
  getSlowOperations: () => PerformanceMetrics[];
  clearMetrics: () => void;
  isMonitoring: boolean;
}

// Safety check for PerformanceObserver support
const isPerformanceObserverSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    'PerformanceObserver' in window &&
    typeof PerformanceObserver !== 'undefined'
  );
};

// Safety check for performance.memory support
const isMemorySupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    'performance' in window &&
    'memory' in performance
  );
};

// Generate a random number for sampling
const shouldSample = (sampleRate: number): boolean => {
  return Math.random() < sampleRate;
};

export const usePerformanceMonitor = (
  componentName: string,
  options: PerformanceMonitorOptions = {}
): PerformanceMonitorReturn => {
  const {
    threshold = 100,
    trackSlowRenders = true,
    trackMemoryUsage = false,
    enabled = true,
    sampleRate = 1.0,
  } = options;

  const metrics = useRef<PerformanceMetrics[]>([]);
  const renderStartTime = useRef<number>(0);
  const observerRef = useRef<PerformanceObserver | null>(null);
  const memoryIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMonitoring =
    enabled && isPerformanceObserverSupported() && shouldSample(sampleRate);

  // Clear metrics function
  const clearMetrics = useCallback(() => {
    metrics.current = [];
  }, []);

  // Get slow operations function
  const getSlowOperations = useCallback(() => {
    return metrics.current.filter(m => m.duration > threshold);
  }, [threshold]);

  // Safe analytics tracking with error handling
  const safeTrack = useCallback(
    (event: string, properties: Record<string, unknown>) => {
      try {
        analytics.trackEvent(event as unknown as 'performance_metric', {
          ...properties,
          environment: process.env.NODE_ENV,
          timestamp: Date.now(),
          component: componentName,
        });
      } catch (error) {
        // Silently fail in production, log in development
        if (process.env.NODE_ENV === 'development') {
          console.warn('Performance monitoring analytics failed:', error);
        }
      }
    },
    [componentName]
  );

  // Track render performance
  useEffect(() => {
    if (!isMonitoring || !trackSlowRenders) return;

    renderStartTime.current = performance.now();

    return () => {
      try {
        const renderDuration = performance.now() - renderStartTime.current;

        if (renderDuration > threshold) {
          const severity = renderDuration > 500 ? 'critical' : 'warning';

          const metric: PerformanceMetrics = {
            name: 'render',
            duration: renderDuration,
            timestamp: Date.now(),
            component: componentName,
            type: 'render',
            severity,
          };

          metrics.current.push(metric);

          safeTrack('performance_slow_render', {
            duration: renderDuration,
            severity,
            threshold,
          });
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Render performance tracking failed:', error);
        }
      }
    };
  }, [isMonitoring, trackSlowRenders, threshold, componentName, safeTrack]);

  // Performance observer for measures and navigation
  useEffect(() => {
    if (!isMonitoring) return;

    try {
      observerRef.current = new PerformanceObserver(list => {
        try {
          list.getEntries().forEach(entry => {
            if (
              entry.entryType === 'measure' ||
              entry.entryType === 'navigation'
            ) {
              const metric: PerformanceMetrics = {
                name: entry.name,
                duration: entry.duration,
                timestamp: Date.now(),
                component: componentName,
                type: entry.entryType,
              };

              metrics.current.push(metric);

              // Track slow operations
              if (entry.duration > threshold) {
                const severity = entry.duration > 500 ? 'critical' : 'warning';
                metric.severity = severity;

                safeTrack('performance_slow', {
                  name: entry.name,
                  duration: entry.duration,
                  severity,
                  threshold,
                  type: entry.entryType,
                });
              }
            }
          });
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Performance observer processing failed:', error);
          }
        }
      });

      observerRef.current.observe({
        entryTypes: ['measure', 'navigation'],
      });

      return () => {
        try {
          if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Performance observer cleanup failed:', error);
          }
        }
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Performance observer setup failed:', error);
      }
    }
  }, [isMonitoring, threshold, componentName, safeTrack]);

  // Memory usage tracking
  useEffect(() => {
    if (!isMonitoring || !trackMemoryUsage || !isMemorySupported()) return;

    try {
      memoryIntervalRef.current = setInterval(() => {
        try {
          const memory = (
            performance as Performance & {
              memory: { usedJSHeapSize: number; totalJSHeapSize: number };
            }
          ).memory;
          const usedMB = memory.usedJSHeapSize / (1024 * 1024);
          const totalMB = memory.totalJSHeapSize / (1024 * 1024);

          // Alert if memory usage is high (>50MB used or >80% of total)
          if (usedMB > 50 || usedMB / totalMB > 0.8) {
            safeTrack('performance_high_memory', {
              usedMB: Math.round(usedMB),
              totalMB: Math.round(totalMB),
              percentage: Math.round((usedMB / totalMB) * 100),
            });
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Memory tracking failed:', error);
          }
        }
      }, 30000); // Check every 30 seconds

      return () => {
        try {
          if (memoryIntervalRef.current) {
            clearInterval(memoryIntervalRef.current);
            memoryIntervalRef.current = null;
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Memory interval cleanup failed:', error);
          }
        }
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Memory tracking setup failed:', error);
      }
    }
  }, [isMonitoring, trackMemoryUsage, safeTrack]);

  return {
    metrics: metrics.current,
    getSlowOperations,
    clearMetrics,
    isMonitoring,
  };
};
