import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditorErrorBoundary } from './EditorErrorBoundary';
import React from 'react';

// Component that throws an error for testing
const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('EditorErrorBoundary', () => {
  // Suppress console errors during tests
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  
  afterEach(() => {
    console.error = originalError;
  });

  it('should render children when no error occurs', () => {
    render(
      <EditorErrorBoundary>
        <div>Test content</div>
      </EditorErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should catch errors and display error UI', () => {
    render(
      <EditorErrorBoundary>
        <ThrowError shouldThrow={true} />
      </EditorErrorBoundary>
    );

    expect(screen.getByText(/Editor Error/i)).toBeInTheDocument();
    expect(screen.getByText(/encountered an unexpected error/i)).toBeInTheDocument();
  });

  it('should display retry button for non-critical errors', () => {
    render(
      <EditorErrorBoundary>
        <ThrowError shouldThrow={true} />
      </EditorErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should display refresh and go home buttons', () => {
    render(
      <EditorErrorBoundary>
        <ThrowError shouldThrow={true} />
      </EditorErrorBoundary>
    );

    expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go to home/i })).toBeInTheDocument();
  });

  it('should call onError callback when error is caught', () => {
    const onError = vi.fn();
    
    render(
      <EditorErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </EditorErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it('should reset error state when retry is clicked', () => {
    const { rerender } = render(
      <EditorErrorBoundary>
        <ThrowError shouldThrow={true} />
      </EditorErrorBoundary>
    );

    // Error UI should be visible
    expect(screen.getByText(/Editor Error/i)).toBeInTheDocument();

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);

    // Re-render with no error
    rerender(
      <EditorErrorBoundary>
        <ThrowError shouldThrow={false} />
      </EditorErrorBoundary>
    );

    // Should show normal content
    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;
    
    render(
      <EditorErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </EditorErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should show error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <EditorErrorBoundary>
        <ThrowError shouldThrow={true} />
      </EditorErrorBoundary>
    );

    expect(screen.getByText(/Error:/i)).toBeInTheDocument();
    expect(screen.getByText(/Test error/i)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });
});

describe('EditorErrorBoundary - Error Recovery', () => {
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  
  afterEach(() => {
    console.error = originalError;
  });

  it('should handle multiple errors and show critical error message', () => {
    const { rerender } = render(
      <EditorErrorBoundary>
        <ThrowError shouldThrow={true} />
      </EditorErrorBoundary>
    );

    // First error
    expect(screen.getByText(/Editor Error/i)).toBeInTheDocument();
    
    // Click retry
    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);

    // Trigger second error
    rerender(
      <EditorErrorBoundary>
        <ThrowError shouldThrow={true} />
      </EditorErrorBoundary>
    );

    // Click retry again
    const retryButton2 = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton2);

    // Trigger third error
    rerender(
      <EditorErrorBoundary>
        <ThrowError shouldThrow={true} />
      </EditorErrorBoundary>
    );

    // Should show critical error message
    expect(screen.getByText(/Critical Editor Error/i)).toBeInTheDocument();
    expect(screen.getByText(/multiple errors/i)).toBeInTheDocument();
    
    // Retry button should not be visible for critical errors
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
  });
});
