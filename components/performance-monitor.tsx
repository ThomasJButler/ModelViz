/**
 * @file performance-monitor.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Performance monitoring component tracking render times and resource usage.
 */

'use client';

/**
 * Performance monitoring dashboard component
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity,
  Zap,
  HardDrive,
  Network,
  AlertCircle,
  RefreshCw,
  Download,
  BarChart3
} from 'lucide-react';
import { 
  getMemoryUsage, 
  analyzeResourceTiming, 
  trackBundleSize,
  createFPSMonitor
} from '@/lib/performance';
import { apiCache, persistentCache } from '@/lib/cache';

interface PerformanceMetrics {
  memory: ReturnType<typeof getMemoryUsage>;
  resources: ReturnType<typeof analyzeResourceTiming>;
  bundle: ReturnType<typeof trackBundleSize>;
  fps: number;
  cacheSize: number;
}

/**
 * @constructor
 */
export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const fpsMonitor = useCallback(() => createFPSMonitor(), [])();

  const collectMetrics = useCallback(() => {
    const memory = getMemoryUsage();
    const resources = analyzeResourceTiming();
    const bundle = trackBundleSize();
    const fps = fpsMonitor.getFPS();
    const cacheSize = apiCache.size();

    setMetrics({
      memory,
      resources,
      bundle,
      fps,
      cacheSize
    });
  }, [fpsMonitor]);

  /** @constructs */
  useEffect(() => {
    if (isMonitoring) {
      fpsMonitor.start();
      const interval = setInterval(collectMetrics, 1000);
      return () => {
        clearInterval(interval);
        fpsMonitor.stop();
      };
    }
  }, [isMonitoring, collectMetrics, fpsMonitor]);

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  const clearCache = () => {
    apiCache.clear();
    persistentCache.cleanup();
    collectMetrics();
  };

  const exportMetrics = () => {
    if (!metrics) return;
    
    const data = {
      timestamp: new Date().toISOString(),
      metrics
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Monitor
            </CardTitle>
            <CardDescription>
              Real-time performance metrics and optimization insights
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={isMonitoring ? "destructive" : "default"}
              size="sm"
              onClick={toggleMonitoring}
            >
              {isMonitoring ? "Stop" : "Start"} Monitoring
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "Hide" : "Show"} Details
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!isMonitoring && !metrics ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Click &quot;Start Monitoring&quot; to begin collecting performance metrics
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <Badge variant={metrics?.fps && metrics.fps > 50 ? "default" : "destructive"}>
                      {metrics?.fps || 0} FPS
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Frame Rate</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <Badge variant={metrics?.memory?.percentUsed && metrics.memory.percentUsed < 80 ? "default" : "destructive"}>
                      {metrics?.memory?.percentUsed || 0}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Memory Usage</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Network className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">
                      {metrics?.resources?.total || 0}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Resources Loaded</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">
                      {metrics?.cacheSize || 0}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Cache Entries</p>
                </CardContent>
              </Card>
            </div>

            {showDetails && (
              <Tabs defaultValue="memory" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="memory">Memory</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                  <TabsTrigger value="timing">Timing</TabsTrigger>
                  <TabsTrigger value="cache">Cache</TabsTrigger>
                </TabsList>
                
                <TabsContent value="memory" className="space-y-4">
                  {metrics?.memory && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>JS Heap Used</span>
                          <span>{metrics.memory.usedJSHeapSize} MB</span>
                        </div>
                        <Progress value={metrics.memory.percentUsed} />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Heap</p>
                          <p className="font-medium">{metrics.memory.totalJSHeapSize} MB</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Heap Limit</p>
                          <p className="font-medium">{metrics.memory.jsHeapSizeLimit} MB</p>
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="resources" className="space-y-4">
                  {metrics?.resources && (
                    <>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Resource Types</h4>
                        {Object.entries(metrics.resources.byType).map(([type, count]) => (
                          <div key={type} className="flex justify-between text-sm">
                            <span className="capitalize">{type}</span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                      </div>
                      {metrics.resources.slowest.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Slowest Resources</h4>
                          {metrics.resources.slowest.map((resource, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="truncate max-w-[200px]">{resource.name}</span>
                              <Badge variant="secondary">{resource.duration}ms</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="timing" className="space-y-4">
                  {metrics?.bundle && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">DOM Content Loaded</p>
                        <p className="text-lg font-medium">{metrics.bundle.domContentLoaded}ms</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Load Complete</p>
                        <p className="text-lg font-medium">{metrics.bundle.loadComplete}ms</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">DOM Interactive</p>
                        <p className="text-lg font-medium">{metrics.bundle.domInteractive}ms</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">First Byte</p>
                        <p className="text-lg font-medium">{metrics.bundle.firstByte}ms</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="cache" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">API Cache</p>
                        <p className="text-xs text-muted-foreground">
                          {metrics?.cacheSize || 0} entries in memory
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearCache}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Clear Cache
                      </Button>
                    </div>
                    <Alert>
                      <AlertDescription>
                        Caching improves performance by storing API responses temporarily.
                        Clear cache if you need fresh data.
                      </AlertDescription>
                    </Alert>
                  </div>
                </TabsContent>
              </Tabs>
            )}
            
            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportMetrics}
                disabled={!metrics}
              >
                <Download className="h-4 w-4 mr-1" />
                Export Metrics
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}