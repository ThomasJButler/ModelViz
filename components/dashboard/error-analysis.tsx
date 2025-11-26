/**
 * @file error-analysis.tsx
 * @author Tom Butler
 * @date 2025-11-26
 * @description Error analysis and debugging dashboard component
 */

"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { AlertTriangle, XCircle, Bug, Clock, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { MetricsService } from '@/lib/services/MetricsService';

interface ErrorData {
  type: string;
  count: number;
  percentage: number;
}

interface ErrorEvent {
  id: string;
  timestamp: Date;
  provider: string;
  model: string;
  errorType: string;
  errorMessage: string;
  statusCode: number | null;
}

interface TimelineData {
  time: string;
  errors: number;
}

const errorColors: Record<string, string> = {
  '400': '#F59E0B', // Bad Request - amber
  '401': '#EF4444', // Unauthorized - red
  '403': '#DC2626', // Forbidden - darker red
  '404': '#6B7280', // Not Found - gray
  '429': '#F97316', // Rate Limited - orange
  '500': '#7C3AED', // Server Error - purple
  '502': '#8B5CF6', // Bad Gateway - lighter purple
  '503': '#A855F7', // Service Unavailable - pink purple
  'timeout': '#06B6D4', // Timeout - cyan
  'network': '#10B981', // Network Error - green
  'unknown': '#6B7280' // Unknown - gray
};

const providerColors: Record<string, string> = {
  OpenAI: '#10B981',
  Anthropic: '#8B5CF6',
  Perplexity: '#06B6D4',
  Google: '#3B82F6'
};

export function ErrorAnalysis() {
  const [errorsByType, setErrorsByType] = useState<ErrorData[]>([]);
  const [recentErrors, setRecentErrors] = useState<ErrorEvent[]>([]);
  const [timeline, setTimeline] = useState<TimelineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedError, setSelectedError] = useState<ErrorEvent | null>(null);
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const service = MetricsService.getInstance();
      const allMetrics = await service.getRecentMetrics(1000);

      // Filter to errors only
      const errorMetrics = allMetrics.filter(m => m.status === 'error');

      if (errorMetrics.length > 0) {
        // Group by error type/status code
        const errorTypeMap = new Map<string, number>();
        errorMetrics.forEach(metric => {
          const errorType = metric.errorMessage?.includes('timeout')
            ? 'timeout'
            : metric.errorMessage?.includes('network')
            ? 'network'
            : metric.errorMessage?.match(/\d{3}/)?.[0] || 'unknown';
          errorTypeMap.set(errorType, (errorTypeMap.get(errorType) || 0) + 1);
        });

        const total = errorMetrics.length;
        const errorData: ErrorData[] = Array.from(errorTypeMap.entries())
          .map(([type, count]) => ({
            type,
            count,
            percentage: (count / total) * 100
          }))
          .sort((a, b) => b.count - a.count);

        setErrorsByType(errorData);

        // Recent errors list
        const recentErrorList: ErrorEvent[] = errorMetrics
          .slice(0, 20)
          .map(metric => ({
            id: metric.id,
            timestamp: new Date(metric.timestamp),
            provider: metric.provider,
            model: metric.model,
            errorType: metric.errorMessage?.match(/\d{3}/)?.[0] || 'Error',
            errorMessage: metric.errorMessage || 'Unknown error',
            statusCode: parseInt(metric.errorMessage?.match(/\d{3}/)?.[0] || '0') || null
          }));

        setRecentErrors(recentErrorList);

        // Timeline - group errors by hour
        const hourMap = new Map<string, number>();
        const now = new Date();
        for (let i = 23; i >= 0; i--) {
          const hour = new Date(now.getTime() - i * 3600000);
          const key = `${hour.getHours()}:00`;
          hourMap.set(key, 0);
        }

        errorMetrics.forEach(metric => {
          const hour = new Date(metric.timestamp);
          const key = `${hour.getHours()}:00`;
          if (hourMap.has(key)) {
            hourMap.set(key, (hourMap.get(key) || 0) + 1);
          }
        });

        const timelineData = Array.from(hourMap.entries()).map(([time, errors]) => ({
          time,
          errors
        }));

        setTimeline(timelineData);
      } else {
        // Demo data
        setErrorsByType([
          { type: '429', count: 12, percentage: 40 },
          { type: '500', count: 8, percentage: 26.7 },
          { type: 'timeout', count: 5, percentage: 16.7 },
          { type: '401', count: 3, percentage: 10 },
          { type: 'network', count: 2, percentage: 6.6 }
        ]);

        const demoErrors: ErrorEvent[] = [
          {
            id: '1',
            timestamp: new Date(Date.now() - 5 * 60000),
            provider: 'OpenAI',
            model: 'gpt-4',
            errorType: '429',
            errorMessage: 'Rate limit exceeded. Please retry after 60 seconds.',
            statusCode: 429
          },
          {
            id: '2',
            timestamp: new Date(Date.now() - 15 * 60000),
            provider: 'Anthropic',
            model: 'claude-3-opus',
            errorType: '500',
            errorMessage: 'Internal server error. The server encountered an unexpected condition.',
            statusCode: 500
          },
          {
            id: '3',
            timestamp: new Date(Date.now() - 30 * 60000),
            provider: 'Google',
            model: 'gemini-pro',
            errorType: 'timeout',
            errorMessage: 'Request timeout after 30000ms',
            statusCode: null
          },
          {
            id: '4',
            timestamp: new Date(Date.now() - 45 * 60000),
            provider: 'Perplexity',
            model: 'pplx-70b-online',
            errorType: '401',
            errorMessage: 'Invalid API key. Please check your credentials.',
            statusCode: 401
          },
          {
            id: '5',
            timestamp: new Date(Date.now() - 60 * 60000),
            provider: 'OpenAI',
            model: 'gpt-3.5-turbo',
            errorType: '429',
            errorMessage: 'Rate limit exceeded on tokens per minute.',
            statusCode: 429
          }
        ];
        setRecentErrors(demoErrors);

        // Demo timeline
        const demoTimeline: TimelineData[] = [];
        for (let i = 23; i >= 0; i--) {
          const hour = new Date(Date.now() - i * 3600000);
          demoTimeline.push({
            time: `${hour.getHours()}:00`,
            errors: Math.floor(Math.random() * 5)
          });
        }
        setTimeline(demoTimeline);
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

  const toggleErrorExpand = (id: string) => {
    const newExpanded = new Set(expandedErrors);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedErrors(newExpanded);
  };

  const filteredErrors = filterProvider === 'all'
    ? recentErrors
    : recentErrors.filter(e => e.provider === filterProvider);

  const totalErrors = errorsByType.reduce((sum, e) => sum + e.count, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Bug className="w-8 h-8 text-matrix-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-matrix-primary flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Error Analysis
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-foreground/60">Total Errors:</span>
          <span className="font-bold text-red-500">{totalErrors}</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {errorsByType.slice(0, 4).map((error, index) => (
          <motion.div
            key={error.type}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-lg border border-border bg-background/50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-foreground/60 uppercase">
                {error.type === 'timeout' ? 'Timeout' :
                 error.type === 'network' ? 'Network' :
                 `HTTP ${error.type}`}
              </span>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: errorColors[error.type] || errorColors.unknown }}
              />
            </div>
            <p className="text-2xl font-bold" style={{ color: errorColors[error.type] || errorColors.unknown }}>
              {error.count}
            </p>
            <p className="text-xs text-foreground/50">{error.percentage.toFixed(1)}% of total</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Error Distribution Pie */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50"
        >
          <h4 className="text-sm font-medium text-foreground/80 mb-4">Error Distribution</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={errorsByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  dataKey="count"
                  nameKey="type"
                  label={({ type, percentage }) => `${type} (${percentage.toFixed(0)}%)`}
                  labelLine={false}
                >
                  {errorsByType.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={errorColors[entry.type] || errorColors.unknown}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [value, name]}
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid rgba(255, 0, 0, 0.3)',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Error Timeline */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50"
        >
          <h4 className="text-sm font-medium text-foreground/80 mb-4">Error Timeline (24h)</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline}>
                <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={3} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid rgba(255, 0, 0, 0.3)',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="errors"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ fill: '#EF4444', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Errors List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-lg border border-matrix-primary/20 bg-background/50"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-foreground/80 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Errors
          </h4>

          {/* Provider Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-foreground/50" />
            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              className="bg-background border border-border rounded px-2 py-1 text-sm text-foreground"
            >
              <option value="all">All Providers</option>
              <option value="OpenAI">OpenAI</option>
              <option value="Anthropic">Anthropic</option>
              <option value="Google">Google</option>
              <option value="Perplexity">Perplexity</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredErrors.length === 0 ? (
            <p className="text-center text-foreground/50 py-4">No errors found</p>
          ) : (
            filteredErrors.map((error) => (
              <motion.div
                key={error.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors cursor-pointer"
                onClick={() => toggleErrorExpand(error.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <XCircle
                      className="w-4 h-4"
                      style={{ color: errorColors[error.errorType] || '#EF4444' }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 text-xs rounded font-mono"
                          style={{
                            backgroundColor: `${providerColors[error.provider]}20`,
                            color: providerColors[error.provider]
                          }}
                        >
                          {error.provider}
                        </span>
                        <span className="text-sm font-medium text-foreground">{error.model}</span>
                        <span
                          className="px-2 py-0.5 text-xs rounded font-mono"
                          style={{
                            backgroundColor: `${errorColors[error.errorType] || errorColors.unknown}20`,
                            color: errorColors[error.errorType] || errorColors.unknown
                          }}
                        >
                          {error.errorType}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-foreground/50">
                      {error.timestamp.toLocaleTimeString()}
                    </span>
                    {expandedErrors.has(error.id) ? (
                      <ChevronUp className="w-4 h-4 text-foreground/50" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-foreground/50" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedErrors.has(error.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-red-500/20"
                    >
                      <p className="text-sm text-foreground/70 font-mono bg-black/30 p-2 rounded">
                        {error.errorMessage}
                      </p>
                      <div className="flex gap-4 mt-2 text-xs text-foreground/50">
                        <span>Status: {error.statusCode || 'N/A'}</span>
                        <span>Time: {error.timestamp.toLocaleString()}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
