/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Real-time AI performance metrics visualisation displaying actual token usage, request rates, costs, and success rates from API calls
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { MetricsService } from '@/lib/services/MetricsService';
import { generateSystemMetrics } from '@/lib/data';

interface MetricData {
  time: string;
  tokenUsageRate: number;
  requestsPerMin: number;
  successRate: number;
  avgLatency: number;
}

/**
 * @constructor
 */
export default function RealTimeMetrics() {
  const [data, setData] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasRealData, setHasRealData] = useState(false);

  /** @constructs */
  useEffect(() => {
    const loadInitialData = async () => {
      const service = MetricsService.getInstance();
      const aggregated = await service.getAggregatedMetrics('today');

      console.log('[RealTimeMetrics] Initial load:', {
        totalCalls: aggregated.totalCalls,
        hasHourlyStats: !!aggregated.hourlyStats,
        hourlyStatsLength: aggregated.hourlyStats?.length || 0
      });

      if (aggregated.totalCalls > 0) {
        setHasRealData(true);

        // Load recent metrics for real-time display
        const recentMetrics = await service.getRecentMetrics(20);

        // Group by minute for rate calculations
        const minuteMap = new Map<string, {
          tokens: number;
          requests: number;
          successes: number;
          latencies: number[];
        }>();

        recentMetrics.forEach(metric => {
          const time = new Date(metric.timestamp);
          const minuteKey = time.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM

          if (!minuteMap.has(minuteKey)) {
            minuteMap.set(minuteKey, { tokens: 0, requests: 0, successes: 0, latencies: [] });
          }

          const stats = minuteMap.get(minuteKey)!;
          stats.tokens += metric.tokensUsed;
          stats.requests += 1;
          if (metric.status === 'success') stats.successes += 1;
          stats.latencies.push(metric.latency);
        });

        // Convert to chart data
        const chartData: MetricData[] = Array.from(minuteMap.entries()).map(([time, stats]) => ({
          time,
          tokenUsageRate: stats.tokens,
          requestsPerMin: stats.requests,
          successRate: (stats.successes / stats.requests) * 100,
          avgLatency: stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length
        }));

        // Sort by time
        chartData.sort((a, b) => a.time.localeCompare(b.time));

        // Keep last 20 data points
        const recentData = chartData.slice(-20);

        console.log('[RealTimeMetrics] Using real data:', recentData.length, 'data points');
        setData(recentData);
      } else {
        console.log('[RealTimeMetrics] No real data, using demo mode');
        setHasRealData(false);

        // Initialize with demo data
        const initialData: MetricData[] = Array.from({ length: 20 }, (_, i) => {
          const demoMetrics = generateSystemMetrics();
          return {
            time: new Date(Date.now() - (19 - i) * 1000).toISOString(),
            tokenUsageRate: demoMetrics.tokenUsageRate,
            requestsPerMin: demoMetrics.requestsPerMin,
            successRate: demoMetrics.successRate,
            avgLatency: 120 + Math.random() * 80 // Demo latency 120-200ms
          };
        });
        setData(initialData);
      }

      setLoading(false);
    };

    loadInitialData();

    // Listen for metrics updates
    const handleMetricsUpdate = async () => {
      const service = MetricsService.getInstance();
      const aggregated = await service.getAggregatedMetrics('today');

      console.log('[RealTimeMetrics] Metrics updated, total calls:', aggregated.totalCalls);

      if (aggregated.totalCalls > 0) {
        setHasRealData(true);

        // Reload recent metrics
        const recentMetrics = await service.getRecentMetrics(20);

        // Group by minute
        const minuteMap = new Map<string, {
          tokens: number;
          requests: number;
          successes: number;
          latencies: number[];
        }>();

        recentMetrics.forEach(metric => {
          const time = new Date(metric.timestamp);
          const minuteKey = time.toISOString().slice(0, 16);

          if (!minuteMap.has(minuteKey)) {
            minuteMap.set(minuteKey, { tokens: 0, requests: 0, successes: 0, latencies: [] });
          }

          const stats = minuteMap.get(minuteKey)!;
          stats.tokens += metric.tokensUsed;
          stats.requests += 1;
          if (metric.status === 'success') stats.successes += 1;
          stats.latencies.push(metric.latency);
        });

        const chartData: MetricData[] = Array.from(minuteMap.entries()).map(([time, stats]) => ({
          time,
          tokenUsageRate: stats.tokens,
          requestsPerMin: stats.requests,
          successRate: (stats.successes / stats.requests) * 100,
          avgLatency: stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length
        }));

        chartData.sort((a, b) => a.time.localeCompare(b.time));
        const recentData = chartData.slice(-20);

        setData(recentData);
      }
    };

    window.addEventListener('metrics-updated', handleMetricsUpdate);

    // Update demo data every second if no real data
    const demoInterval = setInterval(() => {
      if (!hasRealData) {
        setData(prevData => {
          const demoMetrics = generateSystemMetrics();
          const newDataPoint: MetricData = {
            time: new Date().toISOString(),
            tokenUsageRate: demoMetrics.tokenUsageRate,
            requestsPerMin: demoMetrics.requestsPerMin,
            successRate: demoMetrics.successRate,
            avgLatency: 120 + Math.random() * 80
          };
          const newData = [...prevData.slice(1), newDataPoint];
          return newData;
        });
      }
    }, 1000);

    return () => {
      window.removeEventListener('metrics-updated', handleMetricsUpdate);
      clearInterval(demoInterval);
    };
  }, [hasRealData]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-[400px] flex items-center justify-center"
      >
        <div className="text-matrix-primary animate-pulse">Loading real-time metrics...</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[400px]"
    >
      <div className="mb-2 text-xs text-foreground/50 text-right">
        {hasRealData ? '● Live Data' : '● Demo Mode'}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="time"
            stroke="#666"
            tickFormatter={(value) => new Date(value).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#666"
            domain={[0, 'auto']}
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
            }}
            labelFormatter={(value) => new Date(value).toLocaleTimeString()}
            formatter={(value: any, name: string) => {
              if (name === 'Success Rate (%)') {
                return [`${Number(value).toFixed(1)}%`, name];
              } else if (name === 'Avg Latency (ms)') {
                return [`${Math.round(value)}ms`, name];
              }
              return [Math.round(value), name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line
            type="monotone"
            dataKey="tokenUsageRate"
            name="Tokens/min"
            stroke="#00ff00"
            dot={false}
            strokeWidth={2}
            yAxisId={0}
          />
          <Line
            type="monotone"
            dataKey="requestsPerMin"
            name="Requests/min"
            stroke="#00ffff"
            dot={false}
            strokeWidth={2}
            yAxisId={0}
          />
          <Line
            type="monotone"
            dataKey="successRate"
            name="Success Rate (%)"
            stroke="#ff00ff"
            dot={false}
            strokeWidth={2}
            yAxisId={0}
          />
          <Line
            type="monotone"
            dataKey="avgLatency"
            name="Avg Latency (ms)"
            stroke="#ffff00"
            dot={false}
            strokeWidth={2}
            yAxisId={0}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
