import React, { Component, ErrorInfo, ReactNode } from 'react';
import styles from './ErrorBoundary.module.scss';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  retryCount?: number;
  maxRetries?: number;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
  isRetrying: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Send to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Send to your error reporting service (e.g., Sentry, LogRocket)
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // Example: Send to your API endpoint
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
      });
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  };

  handleRetry = async () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      // Show permanent error state
      return;
    }

    this.setState({ isRetrying: true });

    try {
      // Wait a bit before retrying
      await new Promise(resolve =>
        setTimeout(resolve, 1000 * (retryCount + 1))
      );

      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1,
        isRetrying: false,
      }));
    } catch (retryError) {
      this.setState({ isRetrying: false });
      console.error('Retry failed:', retryError);
    }
  };

  handleReportError = () => {
    const { error, errorInfo } = this.state;
    if (error) {
      this.reportError(error, errorInfo!);

      // Show user feedback - could be replaced with a toast notification
      console.log('Error has been reported. Thank you for your feedback!');
    }
  };

  getErrorMessage = (error: Error): string => {
    // Provide user-friendly error messages based on error type
    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      return 'Network connection issue. Please check your internet connection.';
    }

    if (error.name === 'TypeError' && error.message.includes('Cannot read')) {
      return 'Something went wrong with the data. Please refresh the page.';
    }

    if (error.message.includes('auth')) {
      return 'Authentication error. Please sign in again.';
    }

    return 'Something unexpected happened. Our team has been notified.';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, retryCount, isRetrying } = this.state;
      const maxRetries = this.props.maxRetries || 3;
      const canRetry = retryCount < maxRetries;

      // Default error UI
      return (
        <div className={styles.errorBoundary}>
          <div className={styles.errorContent}>
            <div className={styles.errorIcon}>⚠️</div>
            <h2 className={styles.title}>Something went wrong</h2>
            <p className={styles.message}>
              {error
                ? this.getErrorMessage(error)
                : 'An unexpected error occurred.'}
            </p>

            {process.env.NODE_ENV === 'development' && error && (
              <details className={styles.errorDetails}>
                <summary>Error Details (Development)</summary>
                <pre>{error.stack}</pre>
                {this.state.errorInfo && (
                  <pre>{this.state.errorInfo.componentStack}</pre>
                )}
              </details>
            )}

            <div className={styles.errorActions}>
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  disabled={isRetrying}
                  className={styles.retryButton}
                  aria-label="Try again"
                >
                  {isRetrying ? 'Retrying...' : 'Try Again'}
                </button>
              )}

              <button
                onClick={this.handleReportError}
                className={styles.reportButton}
                aria-label="Report this error"
              >
                Report Error
              </button>

              <button
                onClick={() => window.location.reload()}
                className={styles.reloadButton}
                aria-label="Reload page"
              >
                Reload Page
              </button>
            </div>

            {!canRetry && (
              <div className={styles.errorLimit}>
                <p>
                  Maximum retry attempts reached. Please reload the page or
                  contact support.
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to throw errors
export const useErrorHandler = () => {
  return React.useCallback((error: Error) => {
    throw error;
  }, []);
};

// Higher-order component for easier error boundary usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};
