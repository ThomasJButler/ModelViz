/**
 * @file api-performance-realtime.tsx
 * @description Real-time API performance visualization showing actual response times by provider
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { MetricsService } from '@/lib/services/MetricsService';
import { format } from 'date-fns';

interface PerformanceData {
  timestamp: string;
  [key: string]: number | string;
}

export function APIPerformanceRealtime() {
  const [data, setData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<string[]>([]);

  const colors = {
    OpenAI: '#00ff00',
    Anthropic: '#00ffff',
    DeepSeek: '#ff00ff',
    Google: '#ffff00',
    Perplexity: '#ff8800',
    Mistral: '#00ff88',
    Cohere: '#8800ff'
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const service = MetricsService.getInstance();
      const aggregated = await service.getAggregatedMetrics('today');

      console.log('[APIPerformanceRealtime] Aggregated data:', {
        hasHourlyStats: !!aggregated.hourlyStats,
        hourlyStatsLength: aggregated.hourlyStats?.length || 0,
        totalCalls: aggregated.totalCalls,
        hasProviders: Object.keys(aggregated.byProvider).length
      });

      if (aggregated.hourlyStats && aggregated.hourlyStats.length > 0) {
        // Transform hourly stats to show latency by provider
        const hourlyData: PerformanceData[] = [];
        const providerSet = new Set<string>();

        // Group by hour and calculate avg latency per provider
        const hourMap = new Map<number, Map<string, { total: number; count: number }>>();

        // Get recent metrics to populate hourly data
        const recentMetrics = await service.getRecentMetrics(200);
        console.log('[APIPerformanceRealtime] Recent metrics:', recentMetrics.length);

        recentMetrics.forEach(metric => {
          const hour = new Date(metric.timestamp).getHours();

          if (!hourMap.has(hour)) {
            hourMap.set(hour, new Map());
          }

          const map = hourMap.get(hour)!;
          if (!map.has(metric.provider)) {
            map.set(metric.provider, { total: 0, count: 0 });
          }

          const stats = map.get(metric.provider)!;
          stats.total += metric.latency;
          stats.count += 1;
          providerSet.add(metric.provider);
        });

        console.log('[APIPerformanceRealtime] Hours with data:', hourMap.size, 'Providers:', Array.from(providerSet));

        // Convert to chart format
        hourMap.forEach((providers, hour) => {
          const dataPoint: PerformanceData = {
            timestamp: `${hour}:00`
          };
          providers.forEach((stats, provider) => {
            dataPoint[provider] = Math.round(stats.total / stats.count);
          });
          hourlyData.push(dataPoint);
        });

        // Sort by hour
        hourlyData.sort((a, b) => {
          const hourA = parseInt(a.timestamp.split(':')[0]);
          const hourB = parseInt(b.timestamp.split(':')[0]);
          return hourA - hourB;
        });

        console.log('[APIPerformanceRealtime] Chart data points:', hourlyData.length);

        setData(hourlyData);
        setProviders(Array.from(providerSet));
      } else {
        console.log('[APIPerformanceRealtime] Using demo data - no real metrics available');
        // Demo data
        const demoData: PerformanceData[] = Array.from({ length: 12 }, (_, i) => ({
          timestamp: `${i * 2}:00`,
          OpenAI: 120 + Math.random() * 40,
          Anthropic: 110 + Math.random() * 30,
          DeepSeek: 90 + Math.random() * 20,
          Google: 100 + Math.random() * 25
        }));
        setData(demoData);
        setProviders(['OpenAI', 'Anthropic', 'DeepSeek', 'Google']);
      }

      setLoading(false);
    };

    loadData();

    // Listen for metrics updates
    const handleUpdate = () => loadData();
    window.addEventListener('metrics-updated', handleUpdate);

    return () => {
      window.removeEventListener('metrics-updated', handleUpdate);
    };
  }, []);

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
        <h3 className="text-lg font-semibold text-matrix-primary">API Response Times</h3>
        <div className="flex items-center gap-2 text-sm text-foreground/70">
          <Activity className="w-4 h-4" />
          <span>Last 24 hours</span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="timestamp"
              stroke="#666"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#666"
              label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', style: { fill: '#666' } }}
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
              }}
              formatter={(value: any) => [`${Math.round(value)}ms`, '']}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
            />
            {providers.map(provider => (
              <Line
                key={provider}
                type="monotone"
                dataKey={provider}
                name={provider}
                stroke={colors[provider as keyof typeof colors] || '#00ff00'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Provider Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {providers.slice(0, 4).map(provider => {
          const latestData = data[data.length - 1];
          const previousData = data[data.length - 2];
          const current = latestData?.[provider] as number || 0;
          const previous = previousData?.[provider] as number || 0;
          const trend = current < previous;

          return (
            <motion.div
              key={provider}
              whileHover={{ scale: 1.02 }}
              className="p-3 rounded-lg border border-matrix-primary/20 bg-background/50"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-foreground/70">{provider}</span>
                {trend ? (
                  <TrendingDown className="w-3 h-3 text-green-500" />
                ) : (
                  <TrendingUp className="w-3 h-3 text-red-500" />
                )}
              </div>
              <p className="text-lg font-bold" style={{ color: colors[provider as keyof typeof colors] }}>
                {Math.round(current)}ms
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
