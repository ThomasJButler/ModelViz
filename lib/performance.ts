/**
 * Performance monitoring utilities for ModelViz
 */

// Web Vitals types
export interface Metric {
  name: string;
  value: number;
  delta?: number;
  id: string;
  entries?: PerformanceEntry[];
}

// Performance metrics collection
export const reportWebVitals = (metric: Metric) => {
  if (typeof window !== 'undefined' && window.performance) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${metric.name}:`, metric.value);
    }

    // Send to analytics endpoint (placeholder for real implementation)
    if (process.env.NODE_ENV === 'production') {
      // Example: send to analytics service
      // fetch('/api/analytics', {
      //   method: 'POST',
      //   body: JSON.stringify(metric),
      //   headers: { 'Content-Type': 'application/json' }
      // });
    }
  }
};

// Custom performance marks
export const performance = {
  mark: (name: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(name);
    }
  },
  
  measure: (name: string, startMark: string, endMark?: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      try {
        window.performance.measure(name, startMark, endMark);
        const entries = window.performance.getEntriesByName(name);
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          console.log(`[Performance] ${name}: ${lastEntry.duration.toFixed(2)}ms`);
        }
      } catch (e) {
        console.error('Performance measurement error:', e);
      }
    }
  },
  
  clearMarks: (name?: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.clearMarks(name);
    }
  },
  
  clearMeasures: (name?: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.clearMeasures(name);
    }
  }
};

// Resource timing analysis
export const analyzeResourceTiming = () => {
  if (typeof window !== 'undefined' && window.performance) {
    const resources = window.performance.getEntriesByType('resource');
    const analysis = {
      total: resources.length,
      byType: {} as Record<string, number>,
      slowest: [] as Array<{ name: string; duration: number }>,
      totalSize: 0,
      totalDuration: 0
    };

    resources.forEach((resource: any) => {
      // Group by resource type
      const type = resource.initiatorType || 'other';
      analysis.byType[type] = (analysis.byType[type] || 0) + 1;
      
      // Track duration
      if (resource.duration) {
        analysis.totalDuration += resource.duration;
      }
      
      // Track size (if available)
      if (resource.transferSize) {
        analysis.totalSize += resource.transferSize;
      }
    });

    // Find slowest resources
    analysis.slowest = resources
      .filter((r: any) => r.duration > 0)
      .sort((a: any, b: any) => b.duration - a.duration)
      .slice(0, 5)
      .map((r: any) => ({
        name: r.name.split('/').pop() || r.name,
        duration: Math.round(r.duration)
      }));

    return analysis;
  }
  return null;
};

// Bundle size tracking
export const trackBundleSize = () => {
  if (typeof window !== 'undefined' && window.performance) {
    const navigation = window.performance.getEntriesByType('navigation')[0] as any;
    if (navigation) {
      return {
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
        domInteractive: Math.round(navigation.domInteractive - navigation.fetchStart),
        firstByte: Math.round(navigation.responseStart - navigation.fetchStart)
      };
    }
  }
  return null;
};

// Memory usage monitoring
export const getMemoryUsage = () => {
  if (typeof window !== 'undefined' && (window.performance as any).memory) {
    const memory = (window.performance as any).memory;
    return {
      usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576), // Convert to MB
      totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576),
      jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1048576),
      percentUsed: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
    };
  }
  return null;
};

// FPS monitoring
export const createFPSMonitor = () => {
  let fps = 0;
  let lastTime = typeof window !== 'undefined' ? window.performance.now() : Date.now();
  let frames = 0;
  let rafId: number | null = null;

  const tick = () => {
    frames++;
    const currentTime = typeof window !== 'undefined' ? window.performance.now() : Date.now();
    
    if (currentTime >= lastTime + 1000) {
      fps = Math.round((frames * 1000) / (currentTime - lastTime));
      frames = 0;
      lastTime = currentTime;
    }
    
    rafId = requestAnimationFrame(tick);
  };

  return {
    start: () => {
      if (!rafId) {
        tick();
      }
    },
    stop: () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    },
    getFPS: () => fps
  };
};