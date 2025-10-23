/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Global error boundary component for application-wide error handling
 */
"use client";

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Error boundary component
 * @constructor
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  /** @listens error */
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 text-matrix-tertiary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
        <p className="text-foreground/70 mb-4">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-matrix-primary text-background rounded-lg hover:bg-matrix-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}