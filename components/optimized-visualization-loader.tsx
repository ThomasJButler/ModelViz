/**
 * @file optimized-visualization-loader.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Optimised visualisation loader with performance enhancements and lazy loading.
 */

'use client';

import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { performance } from '@/lib/performance';

// Define visualisation types
export type VisualisationType = 
  | 'network-graph' 
  | 'data-flow'
  | 'real-time-metrics'
  | 'advanced-chart'
  | 'resource-tree'
  | 'particle-universe'
  | 'neural-flow'
  | 'network-3d'
  | 'quantum-field'
  | 'model-evolution'
  | 'data-cleaner'
  | 'ai-consciousness'
  | 'enhanced-network-graph';

interface VisualisationLoaderProps {
  type: VisualisationType;
  data?: any;
  priority?: boolean;
  onLoadComplete?: () => void;
}

// Custom loading component
const VisualisationSkeleton = ({ type }: { type: string }) => (
  <Card className="w-full h-[500px] flex items-center justify-center bg-muted/10">
    <div className="text-center space-y-4">
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Loading {type.replace('-', ' ')}</p>
        <p className="text-xs text-muted-foreground">Optimizing performance...</p>
      </div>
    </div>
  </Card>
);

// Error boundary component
class VisualisationErrorBoundary extends React.Component<
  { children: React.ReactNode; type: string },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Visualisation error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load {this.props.type} visualization.
            {this.state.error?.message && (
              <div className="mt-2 text-xs font-mono">
                {this.state.error.message}
              </div>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

// Lazy load visualisations with performance tracking
const createLazyVisualization = (name: string, importFn: () => Promise<any>) => {
  return lazy(() => {
    performance.mark(`${name}-start`);
    return importFn().then(module => {
      performance.measure(`${name}-load`, `${name}-start`);
      return module;
    });
  });
};

const visualisations = {
  'network-graph': createLazyVisualization(
    'network-graph',
    () => import('@/components/visualisations/network-graph')
  ),
  'data-flow': createLazyVisualization(
    'data-flow',
    () => import('@/components/visualisations/data-flow')
  ),
  'real-time-metrics': createLazyVisualization(
    'real-time-metrics',
    () => import('@/components/visualisations/real-time-metrics')
  ),
  'advanced-chart': createLazyVisualization(
    'advanced-chart',
    () => import('@/components/visualisations/advanced-chart')
  ),
  'resource-tree': createLazyVisualization(
    'resource-tree',
    () => import('@/components/visualisations/resource-tree')
  ),
  'particle-universe': createLazyVisualization(
    'particle-universe',
    () => import('@/components/visualisations/particle-universe')
  ),
  'neural-flow': createLazyVisualization(
    'neural-flow',
    () => import('@/components/visualisations/neural-flow')
  ),
  'network-3d': createLazyVisualization(
    'network-3d',
    () => import('@/components/visualisations/network-3d')
  ),
  'quantum-field': createLazyVisualization(
    'quantum-field',
    () => import('@/components/visualisations/quantum-field')
  ),
  'model-evolution': createLazyVisualization(
    'model-evolution',
    () => import('@/components/visualisations/scientific/model-evolution')
  ),
  'data-cleaner': createLazyVisualization(
    'data-cleaner',
    () => import('@/components/visualisations/scientific/data-cleaner')
  ),
  'ai-consciousness': createLazyVisualization(
    'ai-consciousness',
    () => import('@/components/visualisations/ai-consciousness')
  ),
  'enhanced-network-graph': createLazyVisualization(
    'enhanced-network-graph',
    () => import('@/components/visualisations/enhanced-network-graph')
  ),
};

/**
 * @constructor
 */
export function OptimizedVisualisationLoader({ 
  type, 
  data, 
  priority = false,
  onLoadComplete 
}: VisualisationLoaderProps) {
  const [isVisible, setIsVisible] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);
  const VisualisationComponent = visualisations[type];

  /** @constructs */
  useEffect(() => {
    if (priority || isVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Preload 100px before entering viewport
        threshold: 0.01
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isVisible]);

  /** @constructs */
  useEffect(() => {
    if (isVisible && onLoadComplete) {
      // Notify when component starts loading
      const timer = setTimeout(onLoadComplete, 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onLoadComplete]);

  if (!VisualisationComponent) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Unknown visualization type: {type}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div ref={containerRef} className="w-full min-h-[500px]">
      {isVisible ? (
        <VisualisationErrorBoundary type={type}>
          <Suspense fallback={<VisualisationSkeleton type={type} />}>
            <VisualisationComponent data={data} />
          </Suspense>
        </VisualisationErrorBoundary>
      ) : (
        <VisualisationSkeleton type={type} />
      )}
    </div>
  );
}

// Preload visualization modules
/**
 * @constructor
 */
export const preloadVisualization = (type: VisualisationType) => {
  const component = visualisations[type];
  if (component) {
    // This triggers the lazy loading by attempting to render
    // Note: React.lazy doesn't have a preload method, so we can't actually preload
    // This is kept for API compatibility but doesn't do anything
  }
};

// Batch preload multiple visualizations
/**
 * @constructor
 */
export const preloadVisualizations = (types: VisualisationType[]) => {
  types.forEach(type => preloadVisualization(type));
};