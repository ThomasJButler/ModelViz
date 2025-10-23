/**
 * @file lazy-wrappers.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Lazy loading wrapper components for code splitting and performance optimisation.
 */

/**
 * Lazy loading wrappers for heavy components to improve initial bundle size
 */

import dynamic from 'next/dynamic';
import { ComponentType, ReactNode, useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

// Loading fallback components
const EditorSkeleton = () => (
  <div className="w-full h-[400px] rounded-lg border bg-muted/20 flex items-center justify-center">
    <div className="text-center space-y-2">
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Loading editor...</p>
    </div>
  </div>
);

const VisualizationSkeleton = () => (
  <div className="w-full h-[500px] rounded-lg border bg-muted/20 flex items-center justify-center">
    <div className="text-center space-y-2">
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Loading visualization...</p>
    </div>
  </div>
);

const ChartSkeleton = () => (
  <div className="w-full h-[300px] rounded-lg border bg-muted/20 p-4">
    <div className="space-y-4">
      <Skeleton className="h-4 w-32" />
      <div className="flex items-end space-x-2 h-[240px]">
        {[...Array(6)].map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${Math.random() * 100 + 40}%` }}
          />
        ))}
      </div>
    </div>
  </div>
);

// Lazy loaded Code Editor
/**
 * @constructor
 */
export const LazyCodeEditor = dynamic(
  () => import('@/components/code-editor').then(mod => ({ default: mod.CodeEditor })),
  {
    loading: () => <EditorSkeleton />,
    ssr: false, // Disable SSR for Monaco editor
  }
);

// Lazy loaded 3D visualizations
/**
 * @constructor
 */
export const LazyNetwork3D = dynamic(
  () => import('@/components/visualisations/network-3d'),
  {
    loading: () => <VisualizationSkeleton />,
    ssr: false,
  }
);

/**
 * @constructor
 */
export const LazyParticleUniverse = dynamic(
  () => import('@/components/visualisations/particle-universe'),
  {
    loading: () => <VisualizationSkeleton />,
    ssr: false,
  }
);

/**
 * @constructor
 */
export const LazyAIConsciousness = dynamic(
  () => import('@/components/visualisations/ai-consciousness'),
  {
    loading: () => <VisualizationSkeleton />,
    ssr: false,
  }
);

// Lazy loaded D3 visualizations
/**
 * @constructor
 */
export const LazyResourceTree = dynamic(
  () => import('@/components/visualisations/resource-tree'),
  {
    loading: () => <VisualizationSkeleton />,
    ssr: false,
  }
);

/**
 * @constructor
 */
export const LazyModelEvolution = dynamic(
  () => import('@/components/visualisations/scientific/model-evolution'),
  {
    loading: () => <VisualizationSkeleton />,
    ssr: false,
  }
);

// Lazy loaded chart components
/**
 * @constructor
 */
export const LazyPerformanceChart = dynamic(
  () => import('@/components/performance-chart').then(mod => ({ default: mod.PerformanceChart })),
  {
    loading: () => <ChartSkeleton />,
  }
);

/**
 * @constructor
 */
export const LazyUsageChart = dynamic(
  () => import('@/components/usage-chart').then(mod => ({ default: mod.UsageChart })),
  {
    loading: () => <ChartSkeleton />,
  }
);

// Lazy loaded analytics components
/**
 * @constructor
 */
export const LazyAnalyticsTabs = dynamic(
  () => import('@/components/analytics/analytics-tabs').then(mod => ({ default: mod.AnalyticsTabs })),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    ),
  }
);

// Generic lazy wrapper with custom loading
/**
 * @constructor
 */
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  LoadingComponent?: ComponentType
): ComponentType<P> {
  return dynamic(importFn, {
    loading: LoadingComponent ? () => <LoadingComponent /> : undefined,
    ssr: false,
  });
}

// Intersection Observer wrapper for viewport-based lazy loading
/**
 * @constructor
 */
export const LazyLoad = ({ 
  children, 
  fallback,
  rootMargin = '100px'
}: { 
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /** @constructs */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref}>
      {isIntersecting ? children : (fallback || <div className="min-h-[200px]" />)}
    </div>
  );
};

// Preload component on hover
/**
 * @constructor
 */
export const PreloadOnHover = ({
  children,
  load
}: {
  children: ReactNode;
  load: () => void;
}) => {
  const [hasLoaded, setHasLoaded] = useState(false);

  const handleMouseEnter = () => {
    if (!hasLoaded) {
      load();
      setHasLoaded(true);
    }
  };

  return (
    <div onMouseEnter={handleMouseEnter}>
      {children}
    </div>
  );
};