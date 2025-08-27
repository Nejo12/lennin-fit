import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory: PerformanceMemory;
}

interface PerformanceMetrics {
  renderTime: number;
  interactionTime: number;
  memoryUsage?: number;
}

interface PerformanceOptions {
  trackMemory?: boolean;
  trackInteractions?: boolean;
  onMetrics?: (metrics: PerformanceMetrics) => void;
  componentName?: string;
}

export const usePerformance = (options: PerformanceOptions = {}) => {
  const {
    trackMemory = false,
    trackInteractions = true,
    onMetrics,
    componentName = 'Unknown',
  } = options;

  const renderStartTime = useRef<number>(0);
  const interactionStartTime = useRef<number>(0);
  // const isTracking = useRef<boolean>(false); // Unused for now

  // Track render performance
  useEffect(() => {
    renderStartTime.current = performance.now();

    return () => {
      const renderTime = performance.now() - renderStartTime.current;

      if (onMetrics) {
        const metrics: PerformanceMetrics = {
          renderTime,
          interactionTime: 0,
        };

        // Track memory usage if available
        if (trackMemory && 'memory' in performance) {
          const memory = (performance as PerformanceWithMemory).memory;
          metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
        }

        onMetrics(metrics);
      }

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[Performance] ${componentName} render time: ${renderTime.toFixed(2)}ms`
        );
      }
    };
  }, [onMetrics, trackMemory, componentName]);

  // Track user interactions
  const trackInteraction = useCallback(
    (interactionName: string) => {
      if (!trackInteractions) return;

      const startTime = performance.now();
      interactionStartTime.current = startTime;

      return () => {
        const interactionTime = performance.now() - startTime;

        if (onMetrics) {
          onMetrics({
            renderTime: 0,
            interactionTime,
          });
        }

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
          console.log(
            `[Performance] ${componentName} ${interactionName}: ${interactionTime.toFixed(2)}ms`
          );
        }
      };
    },
    [trackInteractions, onMetrics, componentName]
  );

  // Track specific interactions
  const trackClick = useCallback(
    (interactionName: string = 'click') => {
      return trackInteraction(interactionName);
    },
    [trackInteraction]
  );

  const trackInput = useCallback(
    (interactionName: string = 'input') => {
      return trackInteraction(interactionName);
    },
    [trackInteraction]
  );

  const trackScroll = useCallback(
    (interactionName: string = 'scroll') => {
      return trackInteraction(interactionName);
    },
    [trackInteraction]
  );

  return {
    trackInteraction,
    trackClick,
    trackInput,
    trackScroll,
  };
};

// Hook for tracking API performance
export const useApiPerformance = (apiName: string) => {
  const trackApiCall = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      options?: { onMetrics?: (duration: number) => void }
    ): Promise<T> => {
      const startTime = performance.now();

      try {
        const result = await apiCall();
        const duration = performance.now() - startTime;

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API Performance] ${apiName}: ${duration.toFixed(2)}ms`);
        }

        options?.onMetrics?.(duration);
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;

        // Log error performance
        if (process.env.NODE_ENV === 'development') {
          console.error(
            `[API Performance] ${apiName} failed after ${duration.toFixed(2)}ms:`,
            error
          );
        }

        throw error;
      }
    },
    [apiName]
  );

  return { trackApiCall };
};

// Hook for tracking component mount/unmount performance
export const useComponentLifecycle = (componentName: string) => {
  const mountTime = useRef<number>(0);
  const isMounted = useRef<boolean>(false);

  useEffect(() => {
    mountTime.current = performance.now();
    isMounted.current = true;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Lifecycle] ${componentName} mounted`);
    }

    return () => {
      const unmountTime = performance.now();
      const totalLifetime = unmountTime - mountTime.current;
      isMounted.current = false;

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[Lifecycle] ${componentName} unmounted after ${totalLifetime.toFixed(2)}ms`
        );
      }
    };
  }, [componentName]);

  const getLifetime = useCallback(() => {
    if (!isMounted.current) return 0;
    return performance.now() - mountTime.current;
  }, []);

  return { getLifetime, isMounted: isMounted.current };
};

// Performance monitoring utilities
export const performanceUtils = {
  // Measure function execution time
  measure: <T>(fn: () => T, name: string = 'Function'): T => {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    }

    return result;
  },

  // Measure async function execution time
  measureAsync: async <T>(
    fn: () => Promise<T>,
    name: string = 'Async Function'
  ): Promise<T> => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    }

    return result;
  },

  // Get memory usage
  getMemoryUsage: (): number | null => {
    if ('memory' in performance) {
      const memory = (performance as PerformanceWithMemory).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return null;
  },

  // Check if performance monitoring is supported
  isSupported: (): boolean => {
    return 'performance' in window && 'now' in performance;
  },
};
