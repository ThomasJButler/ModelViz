/**
 * @file api-health-monitor.tsx
 * @description Real-time API health status visualization with sparklines
 */

"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, CheckCircle, AlertTriangle, XCircle, Zap, Clock } from 'lucide-react';
import { MetricsService } from '@/lib/services/MetricsService';

interface ProviderHealth {
  provider: string;
  status: 'healthy' | 'degraded' | 'down';
  successRate: number;
  avgLatency: number;
  latencyTrend: number[];
  lastError: string | null;
  callsToday: number;
  errorCount: number;
}

const providerColors: Record<string, string> = {
  OpenAI: '#10B981',
  Anthropic: '#8B5CF6',
  Perplexity: '#06B6D4',
  Google: '#3B82F6',
  Mistral: '#00ff88',
  Cohere: '#8800ff'
};

export function APIHealthMonitor() {
  const [providers, setProviders] = useState<ProviderHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const service = MetricsService.getInstance();
      const recentMetrics = await service.getRecentMetrics(500);
      const aggregated = await service.getAggregatedMetrics('today');

      console.log('[APIHealthMonitor] Recent metrics:', recentMetrics.length);
      console.log('[APIHealthMonitor] Providers:', Object.keys(aggregated.byProvider));

      if (Object.keys(aggregated.byProvider).length > 0) {
        // Real data - group by provider
        const providerMap = new Map<string, {
          latencies: number[];
          successes: number;
          failures: number;
          lastError: string | null;
        }>();

        recentMetrics.forEach(metric => {
          if (!providerMap.has(metric.provider)) {
            providerMap.set(metric.provider, {
              latencies: [],
              successes: 0,
              failures: 0,
              lastError: null
            });
          }
          const stats = providerMap.get(metric.provider)!;
          stats.latencies.push(metric.latency);
          if (metric.status === 'success') {
            stats.successes++;
          } else {
            stats.failures++;
            if (metric.errorMessage) stats.lastError = metric.errorMessage;
          }
        });

        const healthData: ProviderHealth[] = Array.from(providerMap.entries()).map(([provider, stats]) => {
          const total = stats.successes + stats.failures;
          const successRate = total > 0 ? (stats.successes / total) * 100 : 100;
          const avgLatency = stats.latencies.length > 0
            ? Math.round(stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length)
            : 0;

          // Get last 20 latencies for sparkline
          const latencyTrend = stats.latencies.slice(-20).map((l, i) => ({ x: i, y: l }));

          return {
            provider,
            status: successRate >= 98 ? 'healthy' : successRate >= 90 ? 'degraded' : 'down',
            successRate,
            avgLatency,
            latencyTrend: stats.latencies.slice(-20),
            lastError: stats.lastError,
            callsToday: aggregated.byProvider[provider]?.totalCalls || total,
            errorCount: stats.failures
          };
        });

        setProviders(healthData);
      } else {
        // Demo data
        const demoProviders: ProviderHealth[] = [
          {
            provider: 'OpenAI',
            status: 'healthy',
            successRate: 99.8,
            avgLatency: 245,
            latencyTrend: Array.from({ length: 20 }, () => 200 + Math.random() * 100),
            lastError: null,
            callsToday: 142,
            errorCount: 0
          },
          {
            provider: 'Anthropic',
            status: 'healthy',
            successRate: 100,
            avgLatency: 312,
            latencyTrend: Array.from({ length: 20 }, () => 280 + Math.random() * 80),
            lastError: null,
            callsToday: 98,
            errorCount: 0
          },
          {
            provider: 'Google',
            status: 'healthy',
            successRate: 98.5,
            avgLatency: 189,
            latencyTrend: Array.from({ length: 20 }, () => 150 + Math.random() * 80),
            lastError: null,
            callsToday: 67,
            errorCount: 1
          },
          {
            provider: 'Perplexity',
            status: 'degraded',
            successRate: 94.2,
            avgLatency: 420,
            latencyTrend: Array.from({ length: 20 }, () => 350 + Math.random() * 150),
            lastError: 'Rate limit exceeded',
            callsToday: 45,
            errorCount: 3
          }
        ];
        setProviders(demoProviders);
      }

      setLoading(false);
    };

    loadData();

    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);

    // Listen for metrics updates
    const handleUpdate = () => loadData();
    window.addEventListener('metrics-updated', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('metrics-updated', handleUpdate);
    };
  }, []);

  const getStatusIcon = (status: ProviderHealth['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'down':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: ProviderHealth['status']) => {
    switch (status) {
      case 'healthy': return 'border-green-500/30 bg-green-500/5';
      case 'degraded': return 'border-yellow-500/30 bg-yellow-500/5';
      case 'down': return 'border-red-500/30 bg-red-500/5';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="w-8 h-8 text-matrix-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-matrix-primary flex items-center gap-2">
          <Activity className="w-5 h-5" />
          API Health Monitor
        </h3>
        <div className="flex items-center gap-2 text-sm text-foreground/70">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs">Live</span>
          </div>
        </div>
      </div>

      {/* Provider Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {providers.map((provider, index) => (
          <motion.div
            key={provider.provider}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedProvider(
              selectedProvider === provider.provider ? null : provider.provider
            )}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${getStatusColor(provider.status)}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{
                    scale: provider.status === 'healthy' ? [1, 1.2, 1] : 1,
                    opacity: provider.status === 'healthy' ? [1, 0.5, 1] : 1
                  }}
                  transition={{
                    duration: 2,
                    repeat: provider.status === 'healthy' ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: providerColors[provider.provider] || '#00ff00' }}
                  />
                </motion.div>
                <span className="font-semibold text-foreground">{provider.provider}</span>
              </div>
              {getStatusIcon(provider.status)}
            </div>

            {/* Success Rate */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-foreground/60">Uptime</span>
                <span className={`font-bold ${
                  provider.successRate >= 98 ? 'text-green-500' :
                  provider.successRate >= 90 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {provider.successRate.toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 bg-background/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${provider.successRate}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    provider.successRate >= 98 ? 'bg-green-500' :
                    provider.successRate >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
              </div>
            </div>

            {/* Sparkline */}
            <div className="h-10 mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={provider.latencyTrend.map((y, x) => ({ x, y }))}>
                  <Line
                    type="monotone"
                    dataKey="y"
                    stroke={providerColors[provider.provider] || '#00ff00'}
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-foreground/60">
                <Zap className="w-3 h-3" />
                <span>{provider.avgLatency}ms avg</span>
              </div>
              <div className="flex items-center gap-1 text-foreground/60">
                <Clock className="w-3 h-3" />
                <span>{provider.callsToday} today</span>
              </div>
            </div>

            {/* Error indicator */}
            {provider.errorCount > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400"
              >
                {provider.errorCount} error{provider.errorCount > 1 ? 's' : ''} today
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Selected Provider Details */}
      <AnimatePresence>
        {selectedProvider && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50"
          >
            {(() => {
              const provider = providers.find(p => p.provider === selectedProvider);
              if (!provider) return null;

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-matrix-primary">
                      {provider.provider} Details
                    </h4>
                    <button
                      onClick={() => setSelectedProvider(null)}
                      className="text-foreground/50 hover:text-foreground"
                    >
                      Close
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-foreground/60 mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(provider.status)}
                        <span className="capitalize">{provider.status}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/60 mb-1">Success Rate</p>
                      <p className="font-bold">{provider.successRate.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/60 mb-1">Avg Response Time</p>
                      <p className="font-bold">{provider.avgLatency}ms</p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/60 mb-1">Calls Today</p>
                      <p className="font-bold">{provider.callsToday}</p>
                    </div>
                  </div>

                  {provider.lastError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-xs text-red-400 font-medium mb-1">Last Error</p>
                      <p className="text-sm text-red-300">{provider.lastError}</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overall Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-xs text-foreground/70 mb-1">Active Providers</p>
          <p className="text-lg font-bold text-matrix-primary">{providers.length}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-foreground/70 mb-1">Avg Success Rate</p>
          <p className="text-lg font-bold text-matrix-secondary">
            {(providers.reduce((sum, p) => sum + p.successRate, 0) / providers.length || 0).toFixed(1)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-foreground/70 mb-1">Total Calls Today</p>
          <p className="text-lg font-bold text-matrix-tertiary">
            {providers.reduce((sum, p) => sum + p.callsToday, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
