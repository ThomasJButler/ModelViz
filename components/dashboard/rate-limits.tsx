/**
 * @file rate-limits.tsx
 * @author Tom Butler
 * @date 2025-11-26
 * @description Rate limit tracking and visualization per provider
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Gauge, AlertTriangle, RefreshCw, Clock, Activity } from 'lucide-react';
import { MetricsService } from '@/lib/services/MetricsService';

interface RateLimitStatus {
  provider: string;
  requestsRemaining: number;
  requestsLimit: number;
  tokensRemaining: number;
  tokensLimit: number;
  resetTime: Date | null;
  usagePercent: number;
  status: 'healthy' | 'warning' | 'critical';
}

const providerColors: Record<string, string> = {
  OpenAI: '#10B981',
  Anthropic: '#8B5CF6',
  Perplexity: '#06B6D4',
  Google: '#3B82F6'
};

// Rate limit configurations per provider (typical defaults)
const rateLimitDefaults: Record<string, { rpm: number; tpm: number }> = {
  OpenAI: { rpm: 3500, tpm: 90000 },
  Anthropic: { rpm: 1000, tpm: 100000 },
  Google: { rpm: 60, tpm: 60000 },
  Perplexity: { rpm: 20, tpm: 50000 }
};

export function RateLimits() {
  const [rateLimits, setRateLimits] = useState<RateLimitStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const service = MetricsService.getInstance();
      const aggregated = await service.getAggregatedMetrics('today');

      // Calculate rate limit usage based on recent activity
      const providers = Object.keys(aggregated.byProvider);

      if (providers.length > 0) {
        // Real data - estimate rate limit usage from metrics
        const limits: RateLimitStatus[] = providers.map(provider => {
          const providerData = aggregated.byProvider[provider];
          const defaults = rateLimitDefaults[provider] || { rpm: 100, tpm: 50000 };

          // Estimate current usage (requests in last minute would need real-time tracking)
          // For now, use daily totals as approximation
          const requestsUsed = providerData.totalCalls;
          const tokensUsed = providerData.totalTokens;

          // Calculate percentage used (simplified - in production would track per minute)
          const requestUsagePercent = Math.min((requestsUsed / (defaults.rpm * 60)) * 100, 100);
          const tokenUsagePercent = Math.min((tokensUsed / (defaults.tpm * 60)) * 100, 100);
          const usagePercent = Math.max(requestUsagePercent, tokenUsagePercent);

          return {
            provider,
            requestsRemaining: Math.max(0, defaults.rpm - (requestsUsed % defaults.rpm)),
            requestsLimit: defaults.rpm,
            tokensRemaining: Math.max(0, defaults.tpm - (tokensUsed % defaults.tpm)),
            tokensLimit: defaults.tpm,
            resetTime: new Date(Date.now() + 60000), // Next minute
            usagePercent,
            status: usagePercent >= 90 ? 'critical' : usagePercent >= 70 ? 'warning' : 'healthy'
          };
        });

        setRateLimits(limits);
      } else {
        // Demo data
        const demoLimits: RateLimitStatus[] = [
          {
            provider: 'OpenAI',
            requestsRemaining: 2850,
            requestsLimit: 3500,
            tokensRemaining: 72000,
            tokensLimit: 90000,
            resetTime: new Date(Date.now() + 45000),
            usagePercent: 20,
            status: 'healthy'
          },
          {
            provider: 'Anthropic',
            requestsRemaining: 750,
            requestsLimit: 1000,
            tokensRemaining: 85000,
            tokensLimit: 100000,
            resetTime: new Date(Date.now() + 30000),
            usagePercent: 25,
            status: 'healthy'
          },
          {
            provider: 'Google',
            requestsRemaining: 12,
            requestsLimit: 60,
            tokensRemaining: 45000,
            tokensLimit: 60000,
            resetTime: new Date(Date.now() + 20000),
            usagePercent: 80,
            status: 'warning'
          },
          {
            provider: 'Perplexity',
            requestsRemaining: 2,
            requestsLimit: 20,
            tokensRemaining: 5000,
            tokensLimit: 50000,
            resetTime: new Date(Date.now() + 55000),
            usagePercent: 92,
            status: 'critical'
          }
        ];
        setRateLimits(demoLimits);
      }

      setLastUpdate(new Date());
      setLoading(false);
    };

    loadData();

    // Refresh every 10 seconds
    const interval = setInterval(loadData, 10000);

    // Listen for metrics updates
    const handleUpdate = () => loadData();
    window.addEventListener('metrics-updated', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('metrics-updated', handleUpdate);
    };
  }, []);

  const getStatusColor = (status: RateLimitStatus['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
    }
  };

  const getStatusBg = (status: RateLimitStatus['status']) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/10 border-green-500/30';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'critical': return 'bg-red-500/10 border-red-500/30';
    }
  };

  const formatTimeRemaining = (resetTime: Date | null): string => {
    if (!resetTime) return '--';
    const diff = Math.max(0, resetTime.getTime() - Date.now());
    const seconds = Math.floor(diff / 1000);
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Gauge className="w-8 h-8 text-matrix-primary animate-pulse" />
      </div>
    );
  }

  // Prepare chart data
  const chartData = rateLimits.map(limit => ({
    name: limit.provider,
    usage: limit.usagePercent,
    remaining: 100 - limit.usagePercent
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-matrix-primary flex items-center gap-2">
          <Gauge className="w-5 h-5" />
          Rate Limits
        </h3>
        <div className="flex items-center gap-3 text-sm text-foreground/70">
          <div className="flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            <span className="text-xs">Updated {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Rate Limit Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {rateLimits.map((limit, index) => (
          <motion.div
            key={limit.provider}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${getStatusBg(limit.status)}`}
          >
            {/* Provider Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: providerColors[limit.provider] || '#00ff00' }}
                />
                <span className="font-semibold text-foreground">{limit.provider}</span>
              </div>
              {limit.status !== 'healthy' && (
                <AlertTriangle className={`w-4 h-4 ${getStatusColor(limit.status)}`} />
              )}
            </div>

            {/* Circular Progress */}
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  strokeWidth="8"
                  fill="none"
                  className="stroke-background/50"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r="40"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  style={{
                    stroke: providerColors[limit.provider] || '#00ff00',
                  }}
                  initial={{ strokeDasharray: '0 251.2' }}
                  animate={{
                    strokeDasharray: `${(limit.usagePercent / 100) * 251.2} 251.2`
                  }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className={`text-xl font-bold ${getStatusColor(limit.status)}`}>
                  {limit.usagePercent.toFixed(0)}%
                </span>
                <span className="text-xs text-foreground/50">used</span>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground/60">Requests</span>
                <span className="font-mono">
                  {limit.requestsRemaining.toLocaleString()} / {limit.requestsLimit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/60">Tokens</span>
                <span className="font-mono">
                  {limit.tokensRemaining.toLocaleString()} / {limit.tokensLimit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-foreground/60 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Resets in
                </span>
                <span className="font-mono text-matrix-primary">
                  {formatTimeRemaining(limit.resetTime)}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Usage Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50"
      >
        <h4 className="text-sm font-medium text-foreground/80 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Rate Limit Usage by Provider
        </h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" width={80} />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Usage']}
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid rgba(0, 255, 0, 0.3)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="usage" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={providerColors[entry.name] || '#00ff00'}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Alerts Section */}
      {rateLimits.some(l => l.status !== 'healthy') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5"
        >
          <h4 className="text-sm font-medium text-yellow-500 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Rate Limit Alerts
          </h4>
          <ul className="space-y-1">
            {rateLimits
              .filter(l => l.status !== 'healthy')
              .map(limit => (
                <li key={limit.provider} className="text-sm text-foreground/70">
                  <span className="font-medium">{limit.provider}</span>: {' '}
                  {limit.status === 'critical'
                    ? 'Critical - approaching rate limit'
                    : 'Warning - high usage detected'}
                  {' '}({limit.usagePercent.toFixed(0)}% used)
                </li>
              ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
