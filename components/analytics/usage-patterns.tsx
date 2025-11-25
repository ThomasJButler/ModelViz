/**
 * @file usage-patterns.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Usage pattern analytics showing token consumption and request distribution over time.
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { generateTimeSeriesData } from '@/lib/data';
import { MetricsService } from '@/lib/services/MetricsService';
import { format, subDays, subHours } from 'date-fns';

// Provider color scheme matching the plan
const providerColors = {
  openai: '#10B981',    // Green
  anthropic: '#8B5CF6', // Purple
  deepseek: '#F59E0B',  // Orange
  google: '#3B82F6'     // Blue
};

interface ChartData {
  timestamp: string;
  date: string;
  tokens: number;
  requests: number;
  avgLatency: number;
  openai?: number;
  anthropic?: number;
  deepseek?: number;
  google?: number;
  openaiRequests?: number;
  anthropicRequests?: number;
  deepseekRequests?: number;
  googleRequests?: number;
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
          // Process real data with provider breakdown
          const chartData = aggregated.dailyStats.map((stat: any) => {
            // Extract provider-specific data if available
            const providerTokens = stat.tokensByProvider || {};
            const providerRequests = stat.requestsByProvider || {};

            return {
              timestamp: new Date(stat.timestamp).toLocaleTimeString(),
              date: format(new Date(stat.timestamp), 'MMM dd'),
              tokens: stat.tokens,
              requests: stat.calls,
              avgLatency: Math.round(stat.avgLatency),
              // Provider-specific token data
              openai: providerTokens.openai || 0,
              anthropic: providerTokens.anthropic || 0,
              deepseek: providerTokens.deepseek || 0,
              google: providerTokens.google || 0,
              // Provider-specific request counts
              openaiRequests: providerRequests.openai || 0,
              anthropicRequests: providerRequests.anthropic || 0,
              deepseekRequests: providerRequests.deepseek || 0,
              googleRequests: providerRequests.google || 0,
            };
          });
          setUsageData(chartData);
        } else {
          // Fall back to demo data with simulated provider distribution
          const mockData = generateTimeSeriesData(24);
          const fallbackData = mockData.map((item, index) => {
            const totalTokens = item.value1;
            const totalRequests = item.value2;

            // Simulate provider distribution
            const openaiPercentage = 0.4;
            const anthropicPercentage = 0.3;
            const deepseekPercentage = 0.2;
            const googlePercentage = 0.1;

            return {
              timestamp: new Date(item.timestamp).toLocaleTimeString(),
              date: format(subDays(new Date(), 6 - index), 'MMM dd'),
              tokens: totalTokens,
              requests: totalRequests,
              avgLatency: Math.round(Math.random() * 1000),
              openai: Math.floor(totalTokens * openaiPercentage),
              anthropic: Math.floor(totalTokens * anthropicPercentage),
              deepseek: Math.floor(totalTokens * deepseekPercentage),
              google: Math.floor(totalTokens * googlePercentage),
              openaiRequests: Math.floor(totalRequests * openaiPercentage),
              anthropicRequests: Math.floor(totalRequests * anthropicPercentage),
              deepseekRequests: Math.floor(totalRequests * deepseekPercentage),
              googleRequests: Math.floor(totalRequests * googlePercentage),
            };
          });
          setUsageData(fallbackData);
        }
      } catch (error) {
        console.error('Error loading usage data:', error);
        // Fall back to demo data on error with provider simulation
        const mockData = generateTimeSeriesData(24);
        const fallbackData = mockData.map((item, index) => {
          const totalTokens = item.value1;
          const totalRequests = item.value2;

          return {
            timestamp: new Date(item.timestamp).toLocaleTimeString(),
            date: format(subDays(new Date(), 6 - index), 'MMM dd'),
            tokens: totalTokens,
            requests: totalRequests,
            avgLatency: Math.round(Math.random() * 1000),
            openai: Math.floor(totalTokens * 0.4),
            anthropic: Math.floor(totalTokens * 0.3),
            deepseek: Math.floor(totalTokens * 0.2),
            google: Math.floor(totalTokens * 0.1),
            openaiRequests: Math.floor(totalRequests * 0.4),
            anthropicRequests: Math.floor(totalRequests * 0.3),
            deepseekRequests: Math.floor(totalRequests * 0.2),
            googleRequests: Math.floor(totalRequests * 0.1),
          };
        });
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
          <h4 className="text-sm font-medium text-matrix-primary mb-4">Token Usage by Provider</h4>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-matrix-primary/50">Loading real-time data...</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usageData}>
                  <defs>
                    <linearGradient id="openaiGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={providerColors.openai} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={providerColors.openai} stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="anthropicGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={providerColors.anthropic} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={providerColors.anthropic} stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="deepseekGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={providerColors.deepseek} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={providerColors.deepseek} stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="googleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={providerColors.google} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={providerColors.google} stopOpacity={0.1} />
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
                    formatter={(value: number, name: string) => {
                      const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
                      return [`${value.toLocaleString()} tokens`, formattedName];
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="rect"
                    formatter={(value: string) => value.charAt(0).toUpperCase() + value.slice(1)}
                  />
                  <Area
                    type="monotone"
                    dataKey="google"
                    stackId="1"
                    stroke={providerColors.google}
                    fillOpacity={1}
                    fill="url(#googleGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="deepseek"
                    stackId="1"
                    stroke={providerColors.deepseek}
                    fillOpacity={1}
                    fill="url(#deepseekGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="anthropic"
                    stackId="1"
                    stroke={providerColors.anthropic}
                    fillOpacity={1}
                    fill="url(#anthropicGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="openai"
                    stackId="1"
                    stroke={providerColors.openai}
                    fillOpacity={1}
                    fill="url(#openaiGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Request Distribution */}
        <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
          <h4 className="text-sm font-medium text-matrix-primary mb-4">Request Distribution by Provider</h4>
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
                    formatter={(value: number, name: string) => {
                      const providerName = name.replace('Requests', '');
                      const formattedName = providerName.charAt(0).toUpperCase() + providerName.slice(1);
                      return [`${value.toLocaleString()} requests`, formattedName];
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="line"
                    formatter={(value: string) => {
                      const providerName = value.replace('Requests', '');
                      return providerName.charAt(0).toUpperCase() + providerName.slice(1);
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="openaiRequests"
                    stroke={providerColors.openai}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="anthropicRequests"
                    stroke={providerColors.anthropic}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="deepseekRequests"
                    stroke={providerColors.deepseek}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="googleRequests"
                    stroke={providerColors.google}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}