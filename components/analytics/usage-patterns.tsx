/**
 * @file usage-patterns.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Usage pattern analytics showing token consumption and request distribution over time.
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, Tooltip, XAxis, YAxis } from 'recharts';
import { generateTimeSeriesData } from '@/lib/data';
import { TokenUsageHeatmap } from './token-usage-heatmap';
import { MetricsService } from '@/lib/services/MetricsService';
import { format, subDays, subHours } from 'date-fns';

interface ChartData {
  timestamp: string;
  date: string;
  tokens: number;
  requests: number;
  avgLatency: number;
}

/**
 * @constructor
 */
export function UsagePatterns() {
  const [timeRange, setTimeRange] = useState('7d');
  const [usageData, setUsageData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRealData = async () => {
      setLoading(true);
      const service = MetricsService.getInstance();

      try {
        // Determine time range
        let range: 'hour' | 'today' | 'week' | 'month' | 'year' = 'week';
        switch (timeRange) {
          case '24h':
            range = 'today';
            break;
          case '7d':
            range = 'week';
            break;
          case '30d':
            range = 'month';
            break;
          case '90d':
            range = 'year';
            break;
        }

        const aggregated = await service.getAggregatedMetrics(range);

        // Check if we have real data
        if (aggregated.dailyStats.length > 0) {
          // Use real data
          const chartData = aggregated.dailyStats.map((stat) => ({
            timestamp: new Date(stat.timestamp).toLocaleTimeString(),
            date: format(new Date(stat.timestamp), 'MMM dd'),
            tokens: stat.tokens,
            requests: stat.calls,
            avgLatency: Math.round(stat.avgLatency)
          }));
          setUsageData(chartData);
        } else {
          // Fall back to demo data if no real data exists
          const mockData = generateTimeSeriesData(24);
          const fallbackData = mockData.map((item, index) => ({
            timestamp: new Date(item.timestamp).toLocaleTimeString(),
            date: format(subDays(new Date(), 6 - index), 'MMM dd'),
            tokens: item.value1,
            requests: item.value2,
            avgLatency: Math.round(Math.random() * 1000)
          }));
          setUsageData(fallbackData);
        }
      } catch (error) {
        console.error('Error loading usage data:', error);
        // Fall back to demo data on error
        const mockData = generateTimeSeriesData(24);
        const fallbackData = mockData.map((item, index) => ({
          timestamp: new Date(item.timestamp).toLocaleTimeString(),
          date: format(subDays(new Date(), 6 - index), 'MMM dd'),
          tokens: item.value1,
          requests: item.value2,
          avgLatency: Math.round(Math.random() * 1000)
        }));
        setUsageData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    loadRealData();

    // Listen for real-time updates
    const handleUpdate = () => loadRealData();
    if (typeof window !== 'undefined') {
      window.addEventListener('metrics-updated', handleUpdate);
      return () => {
        window.removeEventListener('metrics-updated', handleUpdate);
      };
    }
  }, [timeRange]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-matrix-primary">Usage Patterns</h3>
        <div className="flex gap-2">
          {['24h', '7d', '30d', '90d'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-sm ${
                timeRange === range
                  ? 'bg-matrix-primary/20 text-matrix-primary'
                  : 'text-foreground/70 hover:text-matrix-primary'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Usage Over Time */}
        <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
          <h4 className="text-sm font-medium text-matrix-primary mb-4">Token Usage</h4>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-matrix-primary/50">Loading real-time data...</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usageData}>
                  <defs>
                    <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ff00" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00ff00" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#666"
                  />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => value.toLocaleString()}
                  />
                  <Area
                    type="monotone"
                    dataKey="tokens"
                    stroke="#00ff00"
                    fillOpacity={1}
                    fill="url(#tokenGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Request Distribution */}
        <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
          <h4 className="text-sm font-medium text-matrix-primary mb-4">Request Distribution</h4>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-matrix-primary/50">Loading real-time data...</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usageData}>
                  <XAxis
                    dataKey="date"
                    stroke="#666"
                  />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => value.toLocaleString()}
                  />
                  <Line
                    type="monotone"
                    dataKey="requests"
                    stroke="#00ffff"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Token Usage Heatmap */}
      <TokenUsageHeatmap />
    </div>
  );
}