/**
 * @file resource-utilization.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description API resource utilization dashboard monitoring token distribution, cost allocation, and request patterns by provider.
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Zap, DollarSign, Activity, Database } from 'lucide-react';
import { MetricsService } from '@/lib/services/MetricsService';

interface ResourceData {
  name: string;
  value: number;
  color?: string;
}

/**
 * @constructor
 */
export function ResourceUtilization() {
  const [selectedResource, setSelectedResource] = useState('tokens');
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('month');
  const [tokenData, setTokenData] = useState<ResourceData[]>([]);
  const [costData, setCostData] = useState<ResourceData[]>([]);
  const [requestData, setRequestData] = useState<ResourceData[]>([]);
  const [storageUsage, setStorageUsage] = useState(0);
  const [loading, setLoading] = useState(true);

  const colors = ['#00ff00', '#00ffff', '#ff00ff', '#ffff00', '#ff8800', '#00ff88'];

  const resources = [
    { name: 'Tokens', key: 'tokens', icon: Zap },
    { name: 'Costs', key: 'costs', icon: DollarSign },
    { name: 'Requests', key: 'requests', icon: Activity },
    { name: 'Storage', key: 'storage', icon: Database }
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const service = MetricsService.getInstance();
      const aggregated = await service.getAggregatedMetrics(timeRange);

      // Check if we have real data
      if (Object.keys(aggregated.byProvider).length > 0) {
        // Token distribution by provider
        const tokens: ResourceData[] = Object.entries(aggregated.byProvider).map(([provider, stats], index) => ({
          name: provider,
          value: stats.totalTokens,
          color: colors[index % colors.length]
        }));
        setTokenData(tokens);

        // Cost distribution by provider
        const costs: ResourceData[] = Object.entries(aggregated.byProvider).map(([provider, stats], index) => ({
          name: provider,
          value: stats.totalCost,
          color: colors[index % colors.length]
        }));
        setCostData(costs);

        // Request distribution by provider
        const requests: ResourceData[] = Object.entries(aggregated.byProvider).map(([provider, stats], index) => ({
          name: provider,
          value: stats.totalCalls,
          color: colors[index % colors.length]
        }));
        setRequestData(requests);

        // Storage usage (number of metrics stored)
        setStorageUsage(aggregated.totalCalls);
      } else {
        // Fallback to demo data
        const demoTokens: ResourceData[] = [
          { name: 'OpenAI', value: 450000, color: colors[0] },
          { name: 'Anthropic', value: 320000, color: colors[1] },
          { name: 'DeepSeek', value: 180000, color: colors[2] },
          { name: 'Perplexity', value: 120000, color: colors[3] }
        ];
        setTokenData(demoTokens);

        const demoCosts: ResourceData[] = [
          { name: 'OpenAI', value: 45.50, color: colors[0] },
          { name: 'Anthropic', value: 32.80, color: colors[1] },
          { name: 'DeepSeek', value: 8.20, color: colors[2] },
          { name: 'Perplexity', value: 12.40, color: colors[3] }
        ];
        setCostData(demoCosts);

        const demoRequests: ResourceData[] = [
          { name: 'OpenAI', value: 1250, color: colors[0] },
          { name: 'Anthropic', value: 890, color: colors[1] },
          { name: 'DeepSeek', value: 670, color: colors[2] },
          { name: 'Perplexity', value: 450, color: colors[3] }
        ];
        setRequestData(demoRequests);

        setStorageUsage(3260);
      }

      setLoading(false);
    };

    loadData();

    // Listen for metrics updates
    const handleUpdate = () => loadData();
    if (typeof window !== 'undefined') {
      window.addEventListener('metrics-updated', handleUpdate);
      return () => {
        window.removeEventListener('metrics-updated', handleUpdate);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  // Get the current data based on selected resource
  const getCurrentData = () => {
    switch (selectedResource) {
      case 'tokens':
        return tokenData;
      case 'costs':
        return costData;
      case 'requests':
        return requestData;
      case 'storage':
        return [{ name: 'Used', value: storageUsage, color: colors[0] }];
      default:
        return tokenData;
    }
  };

  const currentData = getCurrentData();
  const totalValue = currentData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-matrix-primary">Resource Utilization</h3>
        <div className="flex gap-2">
          {(['week', 'month'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-sm ${
                timeRange === range
                  ? 'bg-matrix-primary/20 text-matrix-primary'
                  : 'text-foreground/70 hover:text-matrix-primary'
              }`}
            >
              {range === 'week' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {resources.map((resource) => {
          const Icon = resource.icon;
          const isSelected = selectedResource === resource.key;

          return (
            <motion.button
              key={resource.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedResource(resource.key)}
              className={`p-4 rounded-lg border ${
                isSelected
                  ? 'border-matrix-primary bg-matrix-primary/10'
                  : 'border-border hover:border-matrix-primary/50'
              } transition-colors`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5 text-matrix-primary" />
              </div>
              <h4 className="text-sm font-medium">{resource.name}</h4>
            </motion.button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-matrix-tertiary">Loading resource data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resource Distribution */}
          <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
            <h4 className="text-sm font-medium text-matrix-primary mb-4">
              {selectedResource.charAt(0).toUpperCase() + selectedResource.slice(1)} Distribution
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={currentData}
                    dataKey="value"
                    nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                    paddingAngle={5}
                  >
                    {currentData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || colors[index % colors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                    formatter={(value: any) => {
                      if (selectedResource === 'costs') {
                        return `$${value.toFixed(2)}`;
                      } else if (selectedResource === 'tokens') {
                        return value.toLocaleString();
                      }
                      return value;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Resource Details */}
          <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
            <h4 className="text-sm font-medium text-matrix-primary mb-4">Resource Details</h4>
            <div className="space-y-4">
              {currentData.map((item, index) => {
                const percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
                return (
                  <div key={item.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">{item.name}</span>
                      <span className="text-matrix-primary">
                        {selectedResource === 'costs'
                          ? `$${item.value.toFixed(2)}`
                          : selectedResource === 'tokens'
                          ? item.value.toLocaleString()
                          : item.value} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="h-full"
                        style={{
                          backgroundColor: item.color || colors[index % colors.length]
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}