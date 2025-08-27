import React, { Component, ErrorInfo, ReactNode } from 'react';

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

      // Show user feedback
      alert('Error has been reported. Thank you for your feedback!');
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
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h2>Something went wrong</h2>
            <p>
              {error
                ? this.getErrorMessage(error)
                : 'An unexpected error occurred.'}
            </p>

            {process.env.NODE_ENV === 'development' && error && (
              <details className="error-details">
                <summary>Error Details (Development)</summary>
                <pre>{error.stack}</pre>
                {this.state.errorInfo && (
                  <pre>{this.state.errorInfo.componentStack}</pre>
                )}
              </details>
            )}

            <div className="error-actions">
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  disabled={isRetrying}
                  className="retry-button"
                  aria-label="Try again"
                >
                  {isRetrying ? 'Retrying...' : 'Try Again'}
                </button>
              )}

              <button
                onClick={this.handleReportError}
                className="report-button"
                aria-label="Report this error"
              >
                Report Error
              </button>

              <button
                onClick={() => window.location.reload()}
                className="reload-button"
                aria-label="Reload page"
              >
                Reload Page
              </button>
            </div>

            {!canRetry && (
              <div className="error-limit">
                <p>
                  Maximum retry attempts reached. Please reload the page or
                  contact support.
                </p>
              </div>
            )}
          </div>

          <style>{`
            .error-boundary {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 2rem;
              background: #f9fafb;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .error-content {
              max-width: 500px;
              text-align: center;
              background: white;
              padding: 3rem 2rem;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              border: 1px solid #e5e7eb;
            }

            .error-icon {
              font-size: 3rem;
              margin-bottom: 1rem;
            }

            h2 {
              color: #1f2937;
              margin: 0 0 1rem 0;
              font-size: 1.5rem;
              font-weight: 600;
            }

            p {
              color: #6b7280;
              margin: 0 0 2rem 0;
              line-height: 1.6;
            }

            .error-details {
              margin: 1.5rem 0;
              text-align: left;
            }

            .error-details summary {
              cursor: pointer;
              color: #374151;
              font-weight: 500;
              margin-bottom: 0.5rem;
            }

            .error-details pre {
              background: #f3f4f6;
              padding: 1rem;
              border-radius: 6px;
              font-size: 0.875rem;
              overflow-x: auto;
              color: #dc2626;
              margin: 0.5rem 0;
            }

            .error-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
              flex-wrap: wrap;
            }

            .retry-button,
            .report-button,
            .reload-button {
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 8px;
              font-size: 0.875rem;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
            }

            .retry-button {
              background: #3b82f6;
              color: white;
            }

            .retry-button:hover:not(:disabled) {
              background: #2563eb;
              transform: translateY(-1px);
            }

            .retry-button:disabled {
              opacity: 0.6;
              cursor: not-allowed;
              transform: none;
            }

            .report-button {
              background: #f3f4f6;
              color: #374151;
              border: 1px solid #d1d5db;
            }

            .report-button:hover {
              background: #e5e7eb;
              transform: translateY(-1px);
            }

            .reload-button {
              background: #10b981;
              color: white;
            }

            .reload-button:hover {
              background: #059669;
              transform: translateY(-1px);
            }

            .error-limit {
              margin-top: 1.5rem;
              padding: 1rem;
              background: #fef2f2;
              border: 1px solid #fecaca;
              border-radius: 6px;
              color: #dc2626;
            }

            @media (max-width: 640px) {
              .error-content {
                padding: 2rem 1rem;
              }

              .error-actions {
                flex-direction: column;
              }

              .retry-button,
              .report-button,
              .reload-button {
                width: 100%;
              }
            }
          `}</style>
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
