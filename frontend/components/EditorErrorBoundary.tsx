import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Props for EditorErrorBoundary
 */
interface EditorErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  fallback?: ReactNode;
}

/**
 * State for EditorErrorBoundary
 */
interface EditorErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * EditorErrorBoundary catches errors in the BlockSuite editor and provides
 * a fallback UI with recovery options.
 * 
 * Features:
 * - Catches React errors in child components
 * - Displays user-friendly error messages
 * - Provides retry and refresh options
 * - Logs errors for debugging
 * - Prevents cascading failures
 * 
 * Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5
 */
export class EditorErrorBoundary extends Component<
  EditorErrorBoundaryProps,
  EditorErrorBoundaryState
> {
  constructor(props: EditorErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  /**
   * Update state when an error is caught
   */
  static getDerivedStateFromError(error: Error): Partial<EditorErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log error details and notify parent component
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    console.error('[EditorErrorBoundary] Caught error:', error);
    console.error('[EditorErrorBoundary] Error info:', errorInfo);

    // Update state with error details
    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Notify parent component if callback provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to monitoring service (if available)
    this.logErrorToService(error, errorInfo);
  }

  /**
   * Log error to external monitoring service
   * In production, this would send to Sentry, LogRocket, etc.
   */
  private logErrorToService(error: Error, errorInfo: ErrorInfo): void {
    // TODO: Integrate with monitoring service
    // Example: Sentry.captureException(error, { extra: errorInfo });
    
    // For now, just log to console
    console.log('[EditorErrorBoundary] Error logged:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Reset error state and retry rendering
   */
  private handleRetry = (): void => {
    console.log('[EditorErrorBoundary] Retrying...');
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Reload the entire page
   */
  private handleRefresh = (): void => {
    console.log('[EditorErrorBoundary] Refreshing page...');
    window.location.reload();
  };

  /**
   * Navigate to home/dashboard
   */
  private handleGoHome = (): void => {
    console.log('[EditorErrorBoundary] Navigating to home...');
    // In a real app, this would use router navigation
    window.location.href = '/';
  };

  /**
   * Render error UI or children
   */
  render(): ReactNode {
    const { hasError, error, errorInfo, errorCount } = this.state;
    const { children, fallback } = this.props;

    // If no error, render children normally
    if (!hasError) {
      return children;
    }

    // If custom fallback provided, use it
    if (fallback) {
      return fallback;
    }

    // Determine error severity based on error count
    const isCritical = errorCount >= 3;

    // Default error UI
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 p-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          {/* Error Title */}
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-3">
            {isCritical ? 'Critical Editor Error' : 'Editor Error'}
          </h2>

          {/* Error Message */}
          <p className="text-gray-600 text-center mb-6">
            {isCritical
              ? 'The editor has encountered multiple errors. Please refresh the page or contact support if the problem persists.'
              : 'The editor encountered an unexpected error. You can try again or refresh the page.'}
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mb-6 p-4 bg-gray-100 rounded-md">
              <p className="text-sm font-mono text-gray-800 mb-2">
                <strong>Error:</strong> {error.message}
              </p>
              {error.stack && (
                <details className="text-xs font-mono text-gray-600">
                  <summary className="cursor-pointer hover:text-gray-800">
                    Stack Trace
                  </summary>
                  <pre className="mt-2 overflow-auto max-h-40 whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </details>
              )}
              {errorInfo && errorInfo.componentStack && (
                <details className="text-xs font-mono text-gray-600 mt-2">
                  <summary className="cursor-pointer hover:text-gray-800">
                    Component Stack
                  </summary>
                  <pre className="mt-2 overflow-auto max-h-40 whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* Error Count Warning */}
          {errorCount > 1 && (
            <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800 text-center">
                ⚠️ This error has occurred {errorCount} times
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Retry Button (only if not critical) */}
            {!isCritical && (
              <button
                onClick={this.handleRetry}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium"
              >
                <RefreshCw size={18} />
                <span>Try Again</span>
              </button>
            )}

            {/* Refresh Page Button */}
            <button
              onClick={this.handleRefresh}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-md transition-colors font-medium ${
                isCritical
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <RefreshCw size={18} />
              <span>Refresh Page</span>
            </button>

            {/* Go Home Button */}
            <button
              onClick={this.handleGoHome}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
            >
              <Home size={18} />
              <span>Go to Home</span>
            </button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-gray-500 text-center mt-6">
            If this problem persists, please{' '}
            <a
              href="mailto:support@example.com"
              className="text-primary-600 hover:underline"
            >
              contact support
            </a>
            .
          </p>
        </div>
      </div>
    );
  }
}
