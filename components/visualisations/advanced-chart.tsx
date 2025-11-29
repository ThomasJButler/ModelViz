/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Advanced area chart visualisation displaying real AI model response times from actual API calls
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { MetricsService } from '@/lib/services/MetricsService';
import { generateAIModelTimeSeries } from '@/lib/data';

interface ChartData {
  timestamp: number;
  [key: string]: number;
}

/**
 * @constructor
 */
export default function AdvancedChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState<string[]>([]);

  const colors: Record<string, { stroke: string; gradient: string }> = {
    'gpt-4': { stroke: '#00ff00', gradient: 'gradient-gpt4' },
    'gpt-4-turbo': { stroke: '#00ff00', gradient: 'gradient-gpt4' },
    'gpt-3.5-turbo': { stroke: '#00ff88', gradient: 'gradient-gpt35' },
    'claude-3-opus': { stroke: '#00ffff', gradient: 'gradient-claude-opus' },
    'claude-3-sonnet': { stroke: '#00ffff', gradient: 'gradient-claude-sonnet' },
    'claude-3-haiku': { stroke: '#00cccc', gradient: 'gradient-claude-haiku' },
    'deepseek-chat': { stroke: '#ff00ff', gradient: 'gradient-deepseek' },
    'deepseek-coder': { stroke: '#ff00ff', gradient: 'gradient-deepseek' },
    'sonar': { stroke: '#ff8800', gradient: 'gradient-perplexity' },
    'llama': { stroke: '#ffff00', gradient: 'gradient-llama' }
  };

  /** @constructs */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const service = MetricsService.getInstance();
      const aggregated = await service.getAggregatedMetrics('today');

      if (aggregated.hourlyStats && aggregated.hourlyStats.length > 0) {
        // Real data - transform hourly stats to show latency by model
        const recentMetrics = await service.getRecentMetrics(200);

        // Group by hour and model
        const hourMap = new Map<number, Map<string, { total: number; count: number }>>();
        const modelSet = new Set<string>();

        recentMetrics.forEach(metric => {
          const hour = new Date(metric.timestamp).getHours();

          if (!hourMap.has(hour)) {
            hourMap.set(hour, new Map());
          }

          const map = hourMap.get(hour)!;
          if (!map.has(metric.model)) {
            map.set(metric.model, { total: 0, count: 0 });
          }

          const stats = map.get(metric.model)!;
          stats.total += metric.latency;
          stats.count += 1;
          modelSet.add(metric.model);
        });

        // Convert to chart format
        const chartData: ChartData[] = [];
        hourMap.forEach((models, hour) => {
          const now = new Date();
          const timestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour).getTime();
          const dataPoint: ChartData = { timestamp };

          models.forEach((stats, model) => {
            dataPoint[model] = Math.round(stats.total / stats.count);
          });

          chartData.push(dataPoint);
        });

        // Sort by hour
        chartData.sort((a, b) => a.timestamp - b.timestamp);

        setData(chartData);
        setModels(Array.from(modelSet));
      } else {
        // Demo data
        setData(generateAIModelTimeSeries());
        setModels(['gpt4', 'claude', 'deepseek']);
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

  const getModelColor = (model: string): { stroke: string; gradient: string } => {
    for (const [key, value] of Object.entries(colors)) {
      if (model.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    return { stroke: '#00ff00', gradient: 'gradient-default' };
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-[400px] flex items-center justify-center"
      >
        <div className="text-matrix-primary animate-pulse">Loading chart data...</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[400px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="gradient-gpt4" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ff00" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00ff00" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradient-gpt35" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradient-claude-opus" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ffff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00ffff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradient-claude-sonnet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ffff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00ffff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradient-claude-haiku" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00cccc" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00cccc" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradient-deepseek" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff00ff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ff00ff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradient-perplexity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff8800" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ff8800" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradient-llama" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ffff00" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ffff00" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradient-default" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ff00" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00ff00" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="timestamp"
            stroke="#666"
            tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
            labelFormatter={(value) => new Date(value).toLocaleTimeString()}
            formatter={(value: any) => [`${Math.round(value)}ms`, '']}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          {models.map((model) => {
            const { stroke, gradient } = getModelColor(model);
            return (
              <Area
                key={model}
                type="monotone"
                dataKey={model}
                name={model}
                stroke={stroke}
                fillOpacity={1}
                fill={`url(#${gradient})`}
                strokeWidth={2}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
