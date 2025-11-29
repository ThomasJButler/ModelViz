/**
 * @file api-gateway.tsx (redesigned as Provider Performance)
 * @author Tom Butler
 * @date 2025-10-23
 * @description Provider performance monitoring showing request distribution, latency comparison, health status, and cost efficiency.
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell } from 'recharts';
import { Network, Globe, Zap, Clock, DollarSign, Activity, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { MetricsService } from '@/lib/services/MetricsService';
import { format, subDays } from 'date-fns';

// Provider color scheme matching the plan
const providerColors = {
  openai: '#10B981',    // Green
  anthropic: '#8B5CF6', // Purple
  deepseek: '#F59E0B',  // Orange
  google: '#3B82F6'     // Blue
};

interface ProviderMetric {
  provider: string;
  calls: number;
  latency: number;
  errors: number;
  cost: number;
  successRate: number;
}

interface ProviderHealthScore {
  provider: string;
  availability: number;
  performance: number;
  reliability: number;
  efficiency: number;
}

/**
 * @constructor
 */
export function APIGateway() {
  const [timeRange, setTimeRange] = useState('7d');
  const [providerMetrics, setProviderMetrics] = useState<ProviderMetric[]>([]);
  const [healthScores, setHealthScores] = useState<ProviderHealthScore[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [avgLatency, setAvgLatency] = useState(0);
  const [errorRate, setErrorRate] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const service = MetricsService.getInstance();

      // Map timeRange to MetricsService range
      const rangeMap: Record<string, 'today' | 'week' | 'month'> = {
        '24h': 'today',
        '7d': 'week',
        '30d': 'month'
      };
      const range = rangeMap[timeRange] || 'week';

      const aggregated = await service.getAggregatedMetrics(range);

      // Check if we have real data
      if (aggregated.byProvider && Object.keys(aggregated.byProvider).length > 0) {
        // Transform provider stats
        const providers: ProviderMetric[] = Object.entries(aggregated.byProvider).map(([provider, stats]) => ({
          provider: provider.charAt(0).toUpperCase() + provider.slice(1),
          calls: stats.totalCalls,
          latency: Math.round(stats.avgLatency),
          errors: stats.failedCalls,
          cost: stats.totalCost,
          successRate: (stats.successfulCalls / stats.totalCalls) * 100
        }));

        setProviderMetrics(providers);

        // Calculate health scores for each provider
        const allLatencies = providers.map(p => p.latency);
        const allCosts = providers.map(p => p.cost / p.calls); // Cost per call
        const minLatency = Math.min(...allLatencies);
        const maxLatency = Math.max(...allLatencies);
        const minCostPerCall = Math.min(...allCosts);
        const maxCostPerCall = Math.max(...allCosts);

        const health: ProviderHealthScore[] = providers.map(provider => {
          const latencyScore = maxLatency > minLatency
            ? 100 - ((provider.latency - minLatency) / (maxLatency - minLatency)) * 100
            : 100;

          const costPerCall = provider.cost / provider.calls;
          const costScore = maxCostPerCall > minCostPerCall
            ? 100 - ((costPerCall - minCostPerCall) / (maxCostPerCall - minCostPerCall)) * 100
            : 100;

          return {
            provider: provider.provider,
            availability: provider.calls > 0 ? 100 : 0, // If there are calls, provider is available
            performance: latencyScore,
            reliability: provider.successRate,
            efficiency: costScore
          };
        });

        setHealthScores(health);

        // Calculate summary metrics
        setTotalRequests(aggregated.totalCalls);
        setAvgLatency(Math.round(aggregated.avgLatency));
        setErrorRate(aggregated.totalCalls > 0
          ? ((aggregated.failedCalls / aggregated.totalCalls) * 100)
          : 0);
      } else {
        // Fallback to demo data
        const demoProviders: ProviderMetric[] = [
          { provider: 'OpenAI', calls: 12500, latency: 145, errors: 25, cost: 15.50, successRate: 99.8 },
          { provider: 'Anthropic', calls: 8900, latency: 165, errors: 18, cost: 12.30, successRate: 99.8 },
          { provider: 'DeepSeek', calls: 6700, latency: 125, errors: 15, cost: 3.20, successRate: 99.8 },
          { provider: 'Google', calls: 4500, latency: 135, errors: 9, successRate: 99.8, cost: 2.80 }
        ];

        setProviderMetrics(demoProviders);

        const demoHealth: ProviderHealthScore[] = [
          { provider: 'OpenAI', availability: 99.9, performance: 92, reliability: 99.8, efficiency: 85 },
          { provider: 'Anthropic', availability: 99.8, performance: 88, reliability: 99.8, efficiency: 82 },
          { provider: 'DeepSeek', availability: 99.7, performance: 95, reliability: 99.8, efficiency: 95 },
          { provider: 'Google', availability: 99.9, performance: 93, reliability: 99.8, efficiency: 96 }
        ];

        setHealthScores(demoHealth);
        setTotalRequests(32600);
        setAvgLatency(142);
        setErrorRate(0.2);
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
  }, [timeRange]);

  const getProviderColor = (provider: string): string => {
    const lowerProvider = provider.toLowerCase();
    return providerColors[lowerProvider as keyof typeof providerColors] || '#00ff00';
  };

  const getHealthStatus = (successRate: number) => {
    if (successRate >= 99.5) return { icon: CheckCircle, color: 'text-green-500', status: 'Excellent' };
    if (successRate >= 98) return { icon: AlertCircle, color: 'text-yellow-500', status: 'Good' };
    return { icon: XCircle, color: 'text-red-500', status: 'Poor' };
  };

  return (
    <div className="space-y-6">
      {/* Provider Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: 'Total Requests',
            value: totalRequests >= 1000000
              ? `${(totalRequests / 1000000).toFixed(1)}M`
              : totalRequests >= 1000
              ? `${(totalRequests / 1000).toFixed(1)}K`
              : totalRequests.toString(),
            icon: Globe,
            color: 'text-matrix-primary'
          },
          {
            title: 'Avg. Latency',
            value: `${avgLatency}ms`,
            icon: Clock,
            color: 'text-matrix-secondary'
          },
          {
            title: 'Error Rate',
            value: `${errorRate.toFixed(1)}%`,
            icon: Zap,
            color: errorRate < 1 ? 'text-green-500' : 'text-red-500'
          }
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.title}
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${metric.color}`} />
              </div>
              <h4 className="text-sm font-medium text-foreground/70">{metric.title}</h4>
              <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Provider Request Distribution */}
        <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium text-matrix-primary">Request Distribution</h4>
            <div className="flex gap-2">
              {['24h', '7d', '30d'].map(range => (
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
          <div className="h-64">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-matrix-primary/50">Loading provider data...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={providerMetrics}>
                  <XAxis dataKey="provider" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => {
                      return [value.toLocaleString(), name === 'calls' ? 'Requests' : name];
                    }}
                  />
                  <Bar
                    dataKey="calls"
                    name="calls"
                    radius={[4, 4, 0, 0]}
                  >
                    {providerMetrics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getProviderColor(entry.provider)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Provider Health Comparison */}
        <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
          <h4 className="text-sm font-medium text-matrix-primary mb-4">Provider Health Scores</h4>
          <div className="h-64">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-matrix-primary/50">Loading health data...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={healthScores.length > 0 ? healthScores : []}>
                  <PolarGrid stroke="#333" />
                  <PolarAngleAxis dataKey="provider" stroke="#666" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#666" />
                  <Radar
                    name="Availability"
                    dataKey="availability"
                    stroke={providerColors.openai}
                    fill={providerColors.openai}
                    fillOpacity={0.2}
                  />
                  <Radar
                    name="Performance"
                    dataKey="performance"
                    stroke={providerColors.anthropic}
                    fill={providerColors.anthropic}
                    fillOpacity={0.2}
                  />
                  <Radar
                    name="Reliability"
                    dataKey="reliability"
                    stroke={providerColors.deepseek}
                    fill={providerColors.deepseek}
                    fillOpacity={0.2}
                  />
                  <Radar
                    name="Efficiency"
                    dataKey="efficiency"
                    stroke={providerColors.google}
                    fill={providerColors.google}
                    fillOpacity={0.2}
                  />
                  <Legend />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => `${value.toFixed(1)}%`}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Provider Performance Table */}
      <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
        <h4 className="text-sm font-medium text-matrix-primary mb-4">Provider Performance</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="p-2 text-foreground/70">Provider</th>
                <th className="p-2 text-foreground/70">Requests</th>
                <th className="p-2 text-foreground/70">Avg Latency</th>
                <th className="p-2 text-foreground/70">Success Rate</th>
                <th className="p-2 text-foreground/70">Total Cost</th>
                <th className="p-2 text-foreground/70">Health</th>
              </tr>
            </thead>
            <tbody>
              {providerMetrics.map((provider) => {
                const health = getHealthStatus(provider.successRate);
                const HealthIcon = health.icon;
                const providerColor = getProviderColor(provider.provider);

                return (
                  <tr key={provider.provider} className="border-t border-border hover:bg-background/50 transition-colors">
                    <td className="p-2">
                      <span className="font-medium" style={{ color: providerColor }}>
                        {provider.provider}
                      </span>
                    </td>
                    <td className="p-2">{provider.calls.toLocaleString()}</td>
                    <td className="p-2">{provider.latency}ms</td>
                    <td className="p-2">{provider.successRate.toFixed(1)}%</td>
                    <td className="p-2">${provider.cost.toFixed(2)}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <HealthIcon className={`w-4 h-4 ${health.color}`} />
                        <span className="text-sm">{health.status}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Efficiency Comparison */}
      <div className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50">
        <h4 className="text-sm font-medium text-matrix-primary mb-4">Cost Efficiency (Cost per Request)</h4>
        <div className="h-64">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-matrix-primary/50">Loading cost data...</p>
            </div>
          ) : providerMetrics.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={providerMetrics.map(p => ({
                provider: p.provider,
                costPerRequest: p.calls > 0 ? (p.cost / p.calls) : 0
              }))}>
                <XAxis dataKey="provider" stroke="#666" />
                <YAxis stroke="#666" tickFormatter={(value) => `$${value.toFixed(4)}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(4)}`, 'Cost per Request']}
                />
                <Bar
                  dataKey="costPerRequest"
                  name="Cost per Request"
                  radius={[4, 4, 0, 0]}
                >
                  {providerMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getProviderColor(entry.provider)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-matrix-primary/50">No provider data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
