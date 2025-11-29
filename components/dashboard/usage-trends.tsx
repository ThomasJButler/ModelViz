/**
 * @file usage-trends.tsx
 * @description Usage trends visualization with daily/weekly/monthly views and growth indicators
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';
import { MetricsService } from '@/lib/services/MetricsService';
import { TimeRange as MetricsTimeRange } from '@/lib/types/metrics';
import { format, subDays } from 'date-fns';

type TimeRange = 'week' | 'month' | 'year';

interface TrendData {
  date: string;
  calls: number;
  tokens: number;
}

export function UsageTrends() {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [totalCalls, setTotalCalls] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [growthRate, setGrowthRate] = useState(0);
  const [peakDay, setPeakDay] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const service = MetricsService.getInstance();
      const aggregated = await service.getAggregatedMetrics(timeRange);

      if (aggregated.dailyStats && aggregated.dailyStats.length > 0) {
        // Real data
        const chartData: TrendData[] = aggregated.dailyStats.map(day => ({
          date: format(new Date(day.date), 'MMM dd'),
          calls: day.calls,
          tokens: day.tokens
        }));

        // Calculate growth rate (compare first half to second half)
        const midpoint = Math.floor(chartData.length / 2);
        const firstHalf = chartData.slice(0, midpoint).reduce((sum, d) => sum + d.calls, 0);
        const secondHalf = chartData.slice(midpoint).reduce((sum, d) => sum + d.calls, 0);
        const growth = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;

        // Find peak day
        const peak = chartData.reduce((max, d) => d.calls > max.calls ? d : max, chartData[0]);

        setTrendData(chartData);
        setTotalCalls(aggregated.totalCalls);
        setTotalTokens(aggregated.totalTokens);
        setGrowthRate(growth);
        setPeakDay(peak?.date || '');
      } else {
        // Demo data
        const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
        const demoData: TrendData[] = Array.from({ length: days }, (_, i) => {
          const baseValue = 15 + Math.sin(i / 3) * 8;
          return {
            date: format(subDays(new Date(), days - 1 - i), 'MMM dd'),
            calls: Math.round(baseValue + Math.random() * 10),
            tokens: Math.round((baseValue + Math.random() * 10) * 150)
          };
        });

        const total = demoData.reduce((sum, d) => sum + d.calls, 0);
        const tokens = demoData.reduce((sum, d) => sum + d.tokens, 0);
        const peak = demoData.reduce((max, d) => d.calls > max.calls ? d : max, demoData[0]);

        setTrendData(demoData);
        setTotalCalls(total);
        setTotalTokens(tokens);
        setGrowthRate(12.5);
        setPeakDay(peak.date);
      }

      setLoading(false);
    };

    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('metrics-updated', handleUpdate);

    return () => {
      window.removeEventListener('metrics-updated', handleUpdate);
    };
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <TrendingUp className="w-8 h-8 text-matrix-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold text-matrix-primary">Usage Trends</h3>

        {/* Time Range Toggle */}
        <div className="flex gap-1 p-1 bg-black/50 rounded-lg border border-matrix-primary/20">
          {(['week', 'month', 'year'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                timeRange === range
                  ? 'bg-matrix-primary text-black font-medium'
                  : 'text-foreground/70 hover:text-matrix-primary'
              }`}
            >
              {range === 'week' ? '7D' : range === 'month' ? '30D' : '1Y'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-lg border border-matrix-primary/20 bg-matrix-primary/5"
        >
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-matrix-primary" />
            <span className="text-xs text-foreground/70">Total Calls</span>
          </div>
          <p className="text-2xl font-bold text-matrix-primary">
            {totalCalls.toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-lg border border-matrix-secondary/20 bg-matrix-secondary/5"
        >
          <div className="flex items-center gap-2 mb-2">
            {growthRate >= 0 ? (
              <TrendingUp className="w-4 h-4 text-matrix-secondary" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className="text-xs text-foreground/70">Growth</span>
          </div>
          <p className={`text-2xl font-bold ${growthRate >= 0 ? 'text-matrix-secondary' : 'text-red-500'}`}>
            {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-lg border border-matrix-tertiary/20 bg-matrix-tertiary/5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-matrix-tertiary" />
            <span className="text-xs text-foreground/70">Peak Day</span>
          </div>
          <p className="text-lg font-bold text-matrix-tertiary">
            {peakDay}
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-lg border border-cyan-500/20 bg-cyan-500/5"
        >
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-cyan-500" />
            <span className="text-xs text-foreground/70">Avg/Day</span>
          </div>
          <p className="text-2xl font-bold text-cyan-500">
            {Math.round(totalCalls / trendData.length)}
          </p>
        </motion.div>
      </div>

      {/* Trend Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="callsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff00" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00ff00" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="date"
              stroke="#666"
              style={{ fontSize: '11px' }}
              interval={timeRange === 'year' ? 30 : timeRange === 'month' ? 4 : 0}
            />
            <YAxis stroke="#666" style={{ fontSize: '11px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => [
                name === 'calls' ? `${value} calls` : `${value.toLocaleString()} tokens`,
                name === 'calls' ? 'API Calls' : 'Tokens'
              ]}
            />
            <Area
              type="monotone"
              dataKey="calls"
              stroke="#00ff00"
              strokeWidth={2}
              fill="url(#callsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Token Usage */}
      <div className="p-4 rounded-lg border border-border bg-background/50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground/70">Total Tokens Used</span>
          <span className="text-lg font-bold text-foreground">
            {totalTokens.toLocaleString()}
          </span>
        </div>
        <div className="mt-2 h-2 bg-black/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-matrix-primary to-matrix-secondary"
          />
        </div>
      </div>
    </div>
  );
}
