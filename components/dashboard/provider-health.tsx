/**
 * @file provider-health.tsx
 * @description Provider health dashboard - uptime, error rates, and reliability metrics
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, AlertTriangle, CheckCircle, XCircle, Clock, Activity } from 'lucide-react';
import { MetricsService } from '@/lib/services/MetricsService';
import { format } from 'date-fns';

interface ProviderHealth {
  provider: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  successRate: number;
  avgLatency: number;
  lastError?: string;
  lastErrorTime?: Date;
  status: 'healthy' | 'degraded' | 'down';
}

export function ProviderHealthDashboard() {
  const [healthData, setHealthData] = useState<ProviderHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallHealth, setOverallHealth] = useState(0);

  const providerColors: Record<string, string> = {
    OpenAI: '#10B981',
    Anthropic: '#8B5CF6',
    Perplexity: '#06B6D4',
    Google: '#3B82F6',
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const service = MetricsService.getInstance();
      const aggregated = await service.getAggregatedMetrics('week');
      const recentMetrics = await service.getRecentMetrics(100);

      if (Object.keys(aggregated.byProvider).length > 0) {
        // Real data
        const health: ProviderHealth[] = Object.entries(aggregated.byProvider).map(([provider, data]) => {
          // Find last error for this provider
          const providerMetrics = recentMetrics.filter(m => m.provider === provider);
          const lastError = providerMetrics.find(m => m.status !== 'success');

          const successRate = data.successRate * 100;
          let status: ProviderHealth['status'] = 'healthy';
          if (successRate < 90) status = 'down';
          else if (successRate < 98) status = 'degraded';

          return {
            provider,
            totalCalls: data.totalCalls,
            successfulCalls: Math.round(data.totalCalls * data.successRate),
            failedCalls: Math.round(data.totalCalls * (1 - data.successRate)),
            successRate,
            avgLatency: Math.round(data.avgLatency),
            lastError: lastError?.errorMessage,
            lastErrorTime: lastError ? new Date(lastError.timestamp) : undefined,
            status
          };
        });

        // Calculate overall health
        const avgHealth = health.reduce((sum, h) => sum + h.successRate, 0) / health.length;

        setHealthData(health);
        setOverallHealth(avgHealth);
      } else {
        // Demo data
        const demoHealth: ProviderHealth[] = [
          {
            provider: 'OpenAI',
            totalCalls: 245,
            successfulCalls: 242,
            failedCalls: 3,
            successRate: 98.8,
            avgLatency: 890,
            status: 'healthy'
          },
          {
            provider: 'Anthropic',
            totalCalls: 187,
            successfulCalls: 186,
            failedCalls: 1,
            successRate: 99.5,
            avgLatency: 750,
            status: 'healthy'
          },
          {
            provider: 'Google',
            totalCalls: 156,
            successfulCalls: 149,
            failedCalls: 7,
            successRate: 95.5,
            avgLatency: 420,
            lastError: 'Rate limit exceeded',
            lastErrorTime: new Date(Date.now() - 3600000),
            status: 'degraded'
          },
          {
            provider: 'Perplexity',
            totalCalls: 92,
            successfulCalls: 91,
            failedCalls: 1,
            successRate: 98.9,
            avgLatency: 1100,
            status: 'healthy'
          }
        ];

        setHealthData(demoHealth);
        setOverallHealth(98.2);
      }

      setLoading(false);
    };

    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('metrics-updated', handleUpdate);

    return () => {
      window.removeEventListener('metrics-updated', handleUpdate);
    };
  }, []);

  const getStatusIcon = (status: ProviderHealth['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'down':
        return <XCircle className="w-5 h-5 text-red-500" />;
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
        <HeartPulse className="w-8 h-8 text-matrix-primary animate-pulse" />
      </div>
    );
  }

  const healthyCount = healthData.filter(h => h.status === 'healthy').length;
  const degradedCount = healthData.filter(h => h.status === 'degraded').length;
  const downCount = healthData.filter(h => h.status === 'down').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-matrix-primary">Provider Health</h3>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-foreground/50" />
          <span className="text-sm text-foreground/70">Last 7 days</span>
        </div>
      </div>

      {/* Overall Health Score */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="p-6 rounded-lg border border-matrix-primary/20 bg-gradient-to-r from-matrix-primary/10 to-transparent"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground/70 mb-1">Overall System Health</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${
                overallHealth >= 98 ? 'text-green-500' :
                overallHealth >= 95 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {overallHealth.toFixed(1)}%
              </span>
              <span className="text-sm text-foreground/50">uptime</span>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-center">
              <div className="flex items-center gap-1 text-green-500">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xl font-bold">{healthyCount}</span>
              </div>
              <p className="text-xs text-foreground/50">Healthy</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 text-yellow-500">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xl font-bold">{degradedCount}</span>
              </div>
              <p className="text-xs text-foreground/50">Degraded</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 text-red-500">
                <XCircle className="w-4 h-4" />
                <span className="text-xl font-bold">{downCount}</span>
              </div>
              <p className="text-xs text-foreground/50">Down</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {healthData.map((health, index) => (
          <motion.div
            key={health.provider}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${getStatusColor(health.status)}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: providerColors[health.provider] }}
                />
                <div>
                  <h4 className="font-semibold text-foreground">{health.provider}</h4>
                  <p className="text-xs text-foreground/50">{health.totalCalls} total calls</p>
                </div>
              </div>
              {getStatusIcon(health.status)}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <p className="text-xs text-foreground/50">Success Rate</p>
                <p className={`text-lg font-bold ${
                  health.successRate >= 98 ? 'text-green-500' :
                  health.successRate >= 95 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {health.successRate.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-foreground/50">Avg Latency</p>
                <p className={`text-lg font-bold ${
                  health.avgLatency < 500 ? 'text-green-500' :
                  health.avgLatency < 1000 ? 'text-yellow-500' : 'text-foreground'
                }`}>
                  {health.avgLatency}ms
                </p>
              </div>
              <div>
                <p className="text-xs text-foreground/50">Errors</p>
                <p className={`text-lg font-bold ${health.failedCalls === 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {health.failedCalls}
                </p>
              </div>
            </div>

            {/* Success Rate Bar */}
            <div className="h-2 bg-black/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${health.successRate}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`h-full rounded-full ${
                  health.successRate >= 98 ? 'bg-green-500' :
                  health.successRate >= 95 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
              />
            </div>

            {/* Last Error (if any) */}
            {health.lastError && (
              <div className="mt-3 p-2 rounded bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2 text-xs text-red-400">
                  <Clock className="w-3 h-3" />
                  <span>Last error: {health.lastError}</span>
                </div>
                {health.lastErrorTime && (
                  <p className="text-xs text-foreground/40 mt-1">
                    {format(health.lastErrorTime, 'MMM dd, HH:mm')}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg border border-border bg-background/50">
          <p className="text-xs text-foreground/50">Total Requests</p>
          <p className="text-xl font-bold text-foreground">
            {healthData.reduce((sum, h) => sum + h.totalCalls, 0).toLocaleString()}
          </p>
        </div>
        <div className="p-3 rounded-lg border border-border bg-background/50">
          <p className="text-xs text-foreground/50">Successful</p>
          <p className="text-xl font-bold text-green-500">
            {healthData.reduce((sum, h) => sum + h.successfulCalls, 0).toLocaleString()}
          </p>
        </div>
        <div className="p-3 rounded-lg border border-border bg-background/50">
          <p className="text-xs text-foreground/50">Failed</p>
          <p className="text-xl font-bold text-red-500">
            {healthData.reduce((sum, h) => sum + h.failedCalls, 0).toLocaleString()}
          </p>
        </div>
        <div className="p-3 rounded-lg border border-border bg-background/50">
          <p className="text-xs text-foreground/50">Avg Response</p>
          <p className="text-xl font-bold text-foreground">
            {Math.round(healthData.reduce((sum, h) => sum + h.avgLatency, 0) / healthData.length)}ms
          </p>
        </div>
      </div>
    </div>
  );
}
