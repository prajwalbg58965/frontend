import { Component, ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen bg-rail-bg text-rail-text font-sans flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <svg className="mx-auto mb-4 w-16 h-16 text-rail-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <h2 className="text-xl font-semibold text-rail-text mb-2">RailSentinel encountered an error</h2>
            <p className="text-sm text-rail-textMuted mb-6">
              Something went wrong while loading the dashboard. The development team has been notified.
            </p>
            <button
              onClick={this.handleRetry}
              className="btn-primary"
            >
              Reload Application
            </button>
            {this.state.error && (
              <details className="mt-6 text-left p-4 bg-rail-bg border border-rail-border rounded text-xs text-rail-textMuted">
                <summary className="cursor-pointer font-mono mb-2">Error Details</summary>
                <pre className="whitespace-pre-wrap font-mono">{this.state.error.message}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}