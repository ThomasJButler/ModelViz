/**
 * @file request-history.tsx
 * @author Tom Butler
 * @date 2025-11-26
 * @description Detailed request history and logs dashboard component
 */

"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Search, Filter, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, DollarSign, Zap, ArrowUpDown } from 'lucide-react';
import { MetricsService } from '@/lib/services/MetricsService';
import { ApiCallMetric } from '@/lib/types/metrics';

interface SortConfig {
  key: keyof ApiCallMetric | null;
  direction: 'asc' | 'desc';
}

const providerColors: Record<string, string> = {
  OpenAI: '#10B981',
  Anthropic: '#8B5CF6',
  Perplexity: '#06B6D4',
  Google: '#3B82F6'
};

export function RequestHistory() {
  const [metrics, setMetrics] = useState<ApiCallMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTimeRange, setFilterTimeRange] = useState<string>('24h');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'timestamp', direction: 'desc' });
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const service = MetricsService.getInstance();
      const allMetrics = await service.getRecentMetrics(500);

      if (allMetrics.length > 0) {
        setMetrics(allMetrics);
      } else {
        // Demo data
        const demoMetrics: ApiCallMetric[] = Array.from({ length: 50 }, (_, i) => {
          const providers = ['OpenAI', 'Anthropic', 'Google', 'Perplexity'];
          const models: Record<string, string[]> = {
            OpenAI: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
            Anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
            Google: ['gemini-pro', 'gemini-1.5-pro'],
            Perplexity: ['pplx-70b-online', 'pplx-7b-online']
          };
          const provider = providers[Math.floor(Math.random() * providers.length)];
          const model = models[provider][Math.floor(Math.random() * models[provider].length)];
          const success = Math.random() > 0.1;
          const promptTokens = Math.floor(Math.random() * 500) + 50;
          const completionTokens = Math.floor(Math.random() * 1000) + 100;

          return {
            id: `demo-${i}`,
            timestamp: Date.now() - Math.random() * 86400000 * 3,
            provider,
            model,
            inputFormat: ['json', 'text', 'code'][Math.floor(Math.random() * 3)] as 'json' | 'text' | 'code',
            promptTokens,
            completionTokens,
            tokensUsed: promptTokens + completionTokens,
            latency: Math.floor(Math.random() * 2000) + 200,
            estimatedCost: Math.random() * 0.05,
            status: success ? 'success' : 'error',
            errorMessage: success ? undefined : 'Rate limit exceeded',
            promptLength: Math.floor(Math.random() * 1000) + 100,
            responseLength: Math.floor(Math.random() * 2000) + 200
          };
        });
        setMetrics(demoMetrics);
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

  // Filter and sort metrics
  const filteredMetrics = useMemo(() => {
    let result = [...metrics];

    // Apply time range filter
    const now = Date.now();
    const timeRanges: Record<string, number> = {
      '1h': 3600000,
      '24h': 86400000,
      '7d': 604800000,
      '30d': 2592000000
    };
    if (filterTimeRange !== 'all') {
      const cutoff = now - (timeRanges[filterTimeRange] || 86400000);
      result = result.filter(m => new Date(m.timestamp).getTime() > cutoff);
    }

    // Apply provider filter
    if (filterProvider !== 'all') {
      result = result.filter(m => m.provider === filterProvider);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(m => m.status === filterStatus);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(m =>
        m.provider.toLowerCase().includes(query) ||
        m.model.toLowerCase().includes(query) ||
        m.errorMessage?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key!];
        const bVal = b[sortConfig.key!];

        if (aVal === undefined || bVal === undefined) return 0;
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [metrics, filterProvider, filterStatus, filterTimeRange, searchQuery, sortConfig]);

  // Paginated metrics
  const paginatedMetrics = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredMetrics.slice(start, start + pageSize);
  }, [filteredMetrics, page]);

  const totalPages = Math.ceil(filteredMetrics.length / pageSize);

  const handleSort = (key: keyof ApiCallMetric) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <History className="w-8 h-8 text-matrix-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-matrix-primary flex items-center gap-2">
          <History className="w-5 h-5" />
          Request History
        </h3>
        <span className="text-sm text-foreground/60">
          {filteredMetrics.length} requests
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-matrix-primary/50"
          />
        </div>

        {/* Provider Filter */}
        <select
          value={filterProvider}
          onChange={(e) => setFilterProvider(e.target.value)}
          className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground"
        >
          <option value="all">All Providers</option>
          <option value="OpenAI">OpenAI</option>
          <option value="Anthropic">Anthropic</option>
          <option value="Google">Google</option>
          <option value="Perplexity">Perplexity</option>
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground"
        >
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="error">Error</option>
        </select>

        {/* Time Range Filter */}
        <select
          value={filterTimeRange}
          onChange={(e) => setFilterTimeRange(e.target.value)}
          className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground"
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 bg-background/50 rounded-lg border border-border text-sm font-medium text-foreground/60">
        <button
          onClick={() => handleSort('timestamp')}
          className="col-span-2 flex items-center gap-1 hover:text-foreground transition-colors"
        >
          Time
          <ArrowUpDown className="w-3 h-3" />
        </button>
        <button
          onClick={() => handleSort('provider')}
          className="col-span-2 flex items-center gap-1 hover:text-foreground transition-colors"
        >
          Provider
          <ArrowUpDown className="w-3 h-3" />
        </button>
        <div className="col-span-2">Model</div>
        <button
          onClick={() => handleSort('latency')}
          className="col-span-2 flex items-center gap-1 hover:text-foreground transition-colors"
        >
          Latency
          <ArrowUpDown className="w-3 h-3" />
        </button>
        <div className="col-span-2">Tokens</div>
        <button
          onClick={() => handleSort('estimatedCost')}
          className="col-span-1 flex items-center gap-1 hover:text-foreground transition-colors"
        >
          Cost
          <ArrowUpDown className="w-3 h-3" />
        </button>
        <div className="col-span-1 text-center">Status</div>
      </div>

      {/* Request List */}
      <div className="space-y-2">
        {paginatedMetrics.length === 0 ? (
          <p className="text-center text-foreground/50 py-8">No requests found</p>
        ) : (
          paginatedMetrics.map((metric) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`rounded-lg border transition-colors cursor-pointer ${
                metric.status === 'success'
                  ? 'border-border hover:border-matrix-primary/30 bg-background/50'
                  : 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10'
              }`}
              onClick={() => setExpandedRequest(expandedRequest === metric.id ? null : metric.id)}
            >
              {/* Desktop View */}
              <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-3 items-center">
                <div className="col-span-2 text-sm text-foreground/80">
                  {formatTimestamp(metric.timestamp)}
                </div>
                <div className="col-span-2">
                  <span
                    className="px-2 py-0.5 text-xs rounded font-mono"
                    style={{
                      backgroundColor: `${providerColors[metric.provider]}20`,
                      color: providerColors[metric.provider]
                    }}
                  >
                    {metric.provider}
                  </span>
                </div>
                <div className="col-span-2 text-sm font-mono text-foreground/70 truncate">
                  {metric.model}
                </div>
                <div className="col-span-2 text-sm">
                  <span className={`font-mono ${
                    metric.latency < 500 ? 'text-green-500' :
                    metric.latency < 2000 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {formatDuration(metric.latency)}
                  </span>
                </div>
                <div className="col-span-2 text-sm text-foreground/70">
                  <span className="font-mono">
                    {metric.tokensUsed}
                  </span>
                  <span className="text-xs text-foreground/50 ml-1">tokens</span>
                </div>
                <div className="col-span-1 text-sm font-mono text-matrix-primary">
                  ${metric.estimatedCost.toFixed(4)}
                </div>
                <div className="col-span-1 flex justify-center">
                  {metric.status === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>

              {/* Mobile View */}
              <div className="md:hidden p-4">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="px-2 py-0.5 text-xs rounded font-mono"
                    style={{
                      backgroundColor: `${providerColors[metric.provider]}20`,
                      color: providerColors[metric.provider]
                    }}
                  >
                    {metric.provider}
                  </span>
                  <div className="flex items-center gap-2">
                    {metric.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    {expandedRequest === metric.id ? (
                      <ChevronUp className="w-4 h-4 text-foreground/50" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-foreground/50" />
                    )}
                  </div>
                </div>
                <p className="text-sm font-mono text-foreground/80 mb-2">{metric.model}</p>
                <div className="flex items-center gap-4 text-xs text-foreground/60">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(metric.latency)}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    ${metric.estimatedCost.toFixed(4)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {metric.tokensUsed} tokens
                  </span>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedRequest === metric.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 pb-4 border-t border-border/50"
                  >
                    <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-foreground/50 mb-1">Prompt Tokens</p>
                        <p className="font-mono">{metric.promptTokens.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-foreground/50 mb-1">Completion Tokens</p>
                        <p className="font-mono">{metric.completionTokens.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-foreground/50 mb-1">Format</p>
                        <p className="capitalize">{metric.inputFormat}</p>
                      </div>
                      <div>
                        <p className="text-xs text-foreground/50 mb-1">Request ID</p>
                        <p className="font-mono text-xs truncate">{metric.id}</p>
                      </div>
                    </div>
                    {metric.errorMessage && (
                      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-xs text-red-400 font-medium mb-1">Error Message</p>
                        <p className="text-sm text-red-300 font-mono">{metric.errorMessage}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-sm text-foreground/60">
            Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredMetrics.length)} of {filteredMetrics.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-border rounded hover:bg-matrix-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-foreground/60">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm border border-border rounded hover:bg-matrix-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
