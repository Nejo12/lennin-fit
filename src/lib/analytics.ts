import posthog from 'posthog-js';

// Analytics configuration
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST =
  import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

// Initialize PostHog
if (POSTHOG_KEY && typeof window !== 'undefined') {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    loaded: posthog => {
      if (process.env.NODE_ENV === 'development') {
        posthog.debug();
      }
    },
    capture_pageview: false, // We'll handle this manually
    capture_pageleave: true,
    autocapture: true,
    disable_session_recording: process.env.NODE_ENV === 'development',
  });
}

// Analytics event types
export type AnalyticsEvent =
  | 'page_view'
  | 'user_signup'
  | 'user_login'
  | 'task_created'
  | 'task_completed'
  | 'invoice_created'
  | 'client_added'
  | 'feature_used'
  | 'error_occurred'
  | 'performance_metric';

// Analytics properties interface
export interface AnalyticsProperties {
  [key: string]: unknown;
  page_name?: string;
  page_category?: string;
  user_id?: string;
  session_id?: string;
  timestamp?: number;
}

// Analytics service class
class AnalyticsService {
  private isEnabled: boolean;
  private sessionId: string;

  constructor() {
    this.isEnabled = !!POSTHOG_KEY;
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Track page views
  trackPageView(pageName: string, properties?: AnalyticsProperties) {
    if (!this.isEnabled) return;

    const eventProperties: AnalyticsProperties = {
      page_name: pageName,
      page_category: this.getPageCategory(pageName),
      session_id: this.sessionId,
      timestamp: Date.now(),
      ...properties,
    };

    posthog.capture('page_view', eventProperties);

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Page View:', pageName, eventProperties);
    }
  }

  // Track custom events
  trackEvent(eventName: AnalyticsEvent, properties?: AnalyticsProperties) {
    if (!this.isEnabled) return;

    const eventProperties: AnalyticsProperties = {
      session_id: this.sessionId,
      timestamp: Date.now(),
      ...properties,
    };

    posthog.capture(eventName, eventProperties);

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Event:', eventName, eventProperties);
    }
  }

  // Track user identification
  identifyUser(userId: string, userProperties?: Record<string, unknown>) {
    if (!this.isEnabled) return;

    posthog.identify(userId, {
      session_id: this.sessionId,
      ...userProperties,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 User Identified:', userId, userProperties);
    }
  }

  // Track performance metrics
  trackPerformance(
    metricName: string,
    value: number,
    properties?: AnalyticsProperties
  ) {
    this.trackEvent('performance_metric', {
      metric_name: metricName,
      metric_value: value,
      ...properties,
    });
  }

  // Track errors
  trackError(error: Error, context?: Record<string, unknown>) {
    this.trackEvent('error_occurred', {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      ...context,
    });
  }

  // Track feature usage
  trackFeatureUsage(featureName: string, properties?: AnalyticsProperties) {
    this.trackEvent('feature_used', {
      feature_name: featureName,
      ...properties,
    });
  }

  // Get page category for better organization
  private getPageCategory(pageName: string): string {
    if (pageName.includes('dashboard')) return 'dashboard';
    if (pageName.includes('tasks')) return 'tasks';
    if (pageName.includes('clients')) return 'clients';
    if (pageName.includes('invoices')) return 'invoices';
    if (pageName.includes('auth')) return 'authentication';
    if (pageName === '/') return 'landing';
    return 'other';
  }

  // Get analytics instance
  getInstance() {
    return posthog;
  }

  // Check if analytics is enabled
  isAnalyticsEnabled(): boolean {
    return this.isEnabled;
  }
}

// Create singleton instance
export const analytics = new AnalyticsService();

// React hook for analytics
export const useAnalytics = () => {
  const trackPageView = (
    pageName: string,
    properties?: AnalyticsProperties
  ) => {
    analytics.trackPageView(pageName, properties);
  };

  const trackEvent = (
    eventName: AnalyticsEvent,
    properties?: AnalyticsProperties
  ) => {
    analytics.trackEvent(eventName, properties);
  };

  const trackFeatureUsage = (
    featureName: string,
    properties?: AnalyticsProperties
  ) => {
    analytics.trackFeatureUsage(featureName, properties);
  };

  const trackPerformance = (
    metricName: string,
    value: number,
    properties?: AnalyticsProperties
  ) => {
    analytics.trackPerformance(metricName, value, properties);
  };

  return {
    trackPageView,
    trackEvent,
    trackFeatureUsage,
    trackPerformance,
    isEnabled: analytics.isAnalyticsEnabled(),
  };
};

// Performance monitoring integration
export const trackPageLoadPerformance = () => {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      if (navigation) {
        analytics.trackPerformance(
          'page_load_time',
          navigation.loadEventEnd - navigation.loadEventStart
        );
        analytics.trackPerformance(
          'dom_content_loaded',
          navigation.domContentLoadedEventEnd -
            navigation.domContentLoadedEventStart
        );
        analytics.trackPerformance(
          'first_paint',
          performance.getEntriesByName('first-paint')[0]?.startTime || 0
        );
        analytics.trackPerformance(
          'first_contentful_paint',
          performance.getEntriesByName('first-contentful-paint')[0]
            ?.startTime || 0
        );
      }
    }, 0);
  });
};

// Error tracking integration
export const setupErrorTracking = () => {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', event => {
    analytics.trackError(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', event => {
    analytics.trackError(new Error(event.reason), {
      type: 'unhandled_promise_rejection',
    });
  });
};
