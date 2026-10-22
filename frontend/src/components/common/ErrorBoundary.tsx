import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in FitTrack Pro:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
          <div className="max-w-md w-full rounded-3xl border border-destructive/20 bg-card/80 backdrop-blur-xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-5 border border-destructive/20">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="font-display font-bold text-2xl mb-2">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              An unexpected application error occurred. We have logged the incident details.
            </p>
            {this.state.error && (
              <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/10 text-xs font-mono text-destructive mb-6 text-left overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <div className="flex gap-3">
              <Button
                onClick={() => window.location.reload()}
                className="flex-1 rounded-xl font-medium gap-2 shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                className="flex-1 rounded-xl font-medium gap-2 border-border/80"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
