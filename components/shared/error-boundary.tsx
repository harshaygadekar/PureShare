/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 * Client-side error handling
 */

'use client';

import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex min-h-[400px] items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-lg">
            <AlertTitle className="mb-2 text-base font-semibold">
              Something went wrong
            </AlertTitle>
            <AlertDescription className="space-y-4">
              <p className="text-sm">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <pre className="mt-2 overflow-auto text-xs">
                  {this.state.error.stack}
                </pre>
              )}
              <div className="flex gap-2">
                <Button onClick={this.handleReset} size="sm">
                  Try again
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                >
                  Reload page
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}
