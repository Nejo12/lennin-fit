import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
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

    // In production, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReportError = () => {
    const { error, errorInfo } = this.state;
    if (error) {
      // In a real app, you'd send this to your error reporting service
      console.log('Error reported:', {
        error: error.message,
        stack: error.stack,
        errorInfo,
      });

      // For demo purposes, we'll just show an alert
      alert('Error has been reported. Thank you for your feedback!');
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h2>Something went wrong</h2>
            <p>
              We're sorry, but something unexpected happened. Our team has been
              notified.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development)</summary>
                <pre>{this.state.error.stack}</pre>
                {this.state.errorInfo && (
                  <pre>{this.state.errorInfo.componentStack}</pre>
                )}
              </details>
            )}

            <div className="error-actions">
              <button
                onClick={this.handleRetry}
                className="retry-button"
                aria-label="Try again"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReportError}
                className="report-button"
                aria-label="Report this error"
              >
                Report Error
              </button>
            </div>
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
            .report-button {
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

            .retry-button:hover {
              background: #2563eb;
              transform: translateY(-1px);
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

            @media (max-width: 640px) {
              .error-content {
                padding: 2rem 1rem;
              }

              .error-actions {
                flex-direction: column;
              }

              .retry-button,
              .report-button {
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
