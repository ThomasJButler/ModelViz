/**
 * @file error-boundary.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Error boundary component for catching and handling React component errors gracefully.
 */

"use client";

import { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * @constructor
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log error to analytics service
    // reportError(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-h-[400px] flex items-center justify-center p-4"
        >
          <div className="text-center max-w-md">
            <AlertTriangle className="w-12 h-12 text-matrix-tertiary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-foreground/70 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={this.handleRetry}
                className="px-4 py-2 bg-matrix-primary text-background rounded-lg hover:bg-matrix-primary/90 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Try again
              </motion.button>
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="text-left mt-4 p-4 bg-card rounded-lg border border-border">
                  <summary className="cursor-pointer text-matrix-primary mb-2">Error Details</summary>
                  <pre className="text-xs overflow-auto p-2 bg-muted rounded">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}