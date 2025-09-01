// Extend Window interface to include analytics libraries
declare global {
  interface Window {
    posthog?: {
      capture: (name: string, props?: Record<string, unknown>) => void;
    };
    plausible?: (
      name: string,
      options?: { props?: Record<string, unknown> }
    ) => void;
  }
}

export function track(name: string, props?: Record<string, unknown>) {
  try {
    if (window.posthog) {
      window.posthog.capture(name, props);
    }
  } catch (error) {
    // Silently fail for analytics
    console.debug('Analytics error:', error);
  }

  try {
    // Or Plausible:
    window.plausible?.(name, { props });
  } catch (error) {
    // Silently fail for analytics
    console.debug('Analytics error:', error);
  }
}
