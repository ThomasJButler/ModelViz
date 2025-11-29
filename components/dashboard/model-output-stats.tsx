/**
 * @file model-output-stats.tsx
 * @author Tom Butler
 * @date 2025-11-29
 * @description Model output statistics tracking - words, tokens, and interesting metrics
 */

"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Hash, Zap, TrendingUp, BarChart3, Clock } from 'lucide-react';
import { MetricsService } from '@/lib/services/MetricsService';
import { ApiCallMetric } from '@/lib/types/metrics';

interface OutputStats {
  totalWords: number;
  totalTokens: number;
  avgWordsPerResponse: number;
  avgTokensPerResponse: number;
  avgResponseTime: number;
  totalResponses: number;
  longestResponse: number;
  shortestResponse: number;
  tokenEfficiency: number;
}

interface ProviderStats {
  provider: string;
  words: number;
  tokens: number;
  responses: number;
  avgLatency: number;
}

const providerColors: Record<string, string> = {
  OpenAI: '#10B981',
  Anthropic: '#8B5CF6',
  Perplexity: '#06B6D4',
  Google: '#3B82F6'
};

export function ModelOutputStats() {
  const [metrics, setMetrics] = useState<ApiCallMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>('24h');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const service = MetricsService.getInstance();
      const allMetrics = await service.getRecentMetrics(500);

      if (allMetrics.length > 0) {
        setMetrics(allMetrics);
      } else {
        // Demo data
        const demoMetrics: ApiCallMetric[] = Array.from({ length: 30 }, (_, i) => {
          const providers = ['OpenAI', 'Anthropic', 'Google', 'Perplexity'];
          const models: Record<string, string[]> = {
            OpenAI: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
            Anthropic: ['claude-3-5-sonnet', 'claude-3-5-haiku'],
            Google: ['gemini-2.0-flash'],
            Perplexity: ['sonar', 'sonar-pro']
          };
          const provider = providers[Math.floor(Math.random() * providers.length)];
          const model = models[provider][Math.floor(Math.random() * models[provider].length)];
          const promptTokens = Math.floor(Math.random() * 300) + 50;
          const completionTokens = Math.floor(Math.random() * 800) + 100;

          return {
            id: `demo-${i}`,
            timestamp: Date.now() - Math.random() * 86400000 * 3,
            provider,
            model,
            inputFormat: 'text' as const,
            promptTokens,
            completionTokens,
            tokensUsed: promptTokens + completionTokens,
            latency: Math.floor(Math.random() * 2000) + 200,
            estimatedCost: Math.random() * 0.05,
            status: 'success' as const,
            promptLength: Math.floor(Math.random() * 500) + 50,
            responseLength: Math.floor(Math.random() * 2000) + 200
          };
        });
        setMetrics(demoMetrics);
      }

      setLoading(false);
    };

    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('metrics-updated', handleUpdate);

    return () => {
      window.removeEventListener('metrics-updated', handleUpdate);
    };
  }, []);

  // Filter by time range
  const filteredMetrics = useMemo(() => {
    const now = Date.now();
    const timeRanges: Record<string, number> = {
      '1h': 3600000,
      '3h': 10800000,
      '24h': 86400000,
      '7d': 604800000,
      'all': Infinity
    };

    const cutoff = now - (timeRanges[timeRange] || 86400000);
    return metrics.filter(m =>
      m.status === 'success' && new Date(m.timestamp).getTime() > cutoff
    );
  }, [metrics, timeRange]);

  // Calculate overall stats
  const stats: OutputStats = useMemo(() => {
    if (filteredMetrics.length === 0) {
      return {
        totalWords: 0,
        totalTokens: 0,
        avgWordsPerResponse: 0,
        avgTokensPerResponse: 0,
        avgResponseTime: 0,
        totalResponses: 0,
        longestResponse: 0,
        shortestResponse: 0,
        tokenEfficiency: 0
      };
    }

    const totalTokens = filteredMetrics.reduce((sum, m) => sum + (m.completionTokens || 0), 0);
    const totalWords = Math.round(totalTokens * 0.75); // Rough estimation: 1 token ~ 0.75 words
    const totalLatency = filteredMetrics.reduce((sum, m) => sum + m.latency, 0);
    const responseLengths = filteredMetrics.map(m => m.completionTokens || 0);

    return {
      totalWords,
      totalTokens,
      avgWordsPerResponse: Math.round(totalWords / filteredMetrics.length),
      avgTokensPerResponse: Math.round(totalTokens / filteredMetrics.length),
      avgResponseTime: Math.round(totalLatency / filteredMetrics.length),
      totalResponses: filteredMetrics.length,
      longestResponse: Math.max(...responseLengths),
      shortestResponse: Math.min(...responseLengths),
      tokenEfficiency: totalTokens / (totalLatency / 1000) // tokens per second
    };
  }, [filteredMetrics]);

  // Calculate per-provider stats
  const providerStats: ProviderStats[] = useMemo(() => {
    const grouped: Record<string, { words: number; tokens: number; responses: number; latency: number }> = {};

    filteredMetrics.forEach(m => {
      if (!grouped[m.provider]) {
        grouped[m.provider] = { words: 0, tokens: 0, responses: 0, latency: 0 };
      }
      grouped[m.provider].tokens += m.completionTokens || 0;
      grouped[m.provider].words += Math.round((m.completionTokens || 0) * 0.75);
      grouped[m.provider].responses += 1;
      grouped[m.provider].latency += m.latency;
    });

    return Object.entries(grouped).map(([provider, data]) => ({
      provider,
      words: data.words,
      tokens: data.tokens,
      responses: data.responses,
      avgLatency: Math.round(data.latency / data.responses)
    })).sort((a, b) => b.tokens - a.tokens);
  }, [filteredMetrics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FileText className="w-8 h-8 text-matrix-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-matrix-primary flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Model Output Stats
        </h3>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm text-foreground"
        >
          <option value="1h">Last Hour</option>
          <option value="3h">Last 3 Hours</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 bg-black/50 rounded-lg border border-matrix-primary/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-matrix-primary" />
            <span className="text-xs text-foreground/60">Total Words</span>
          </div>
          <p className="text-2xl font-bold text-matrix-primary">
            {stats.totalWords.toLocaleString()}
          </p>
          <p className="text-xs text-foreground/50 mt-1">
            ~{stats.avgWordsPerResponse} per response
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 bg-black/50 rounded-lg border border-matrix-secondary/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-matrix-secondary" />
            <span className="text-xs text-foreground/60">Total Tokens</span>
          </div>
          <p className="text-2xl font-bold text-matrix-secondary">
            {stats.totalTokens.toLocaleString()}
          </p>
          <p className="text-xs text-foreground/50 mt-1">
            ~{stats.avgTokensPerResponse} per response
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 bg-black/50 rounded-lg border border-matrix-tertiary/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-matrix-tertiary" />
            <span className="text-xs text-foreground/60">Avg Response Time</span>
          </div>
          <p className="text-2xl font-bold text-matrix-tertiary">
            {stats.avgResponseTime}ms
          </p>
          <p className="text-xs text-foreground/50 mt-1">
            {stats.totalResponses} total responses
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 bg-black/50 rounded-lg border border-cyan-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-cyan-500" />
            <span className="text-xs text-foreground/60">Token Efficiency</span>
          </div>
          <p className="text-2xl font-bold text-cyan-500">
            {stats.tokenEfficiency.toFixed(1)}
          </p>
          <p className="text-xs text-foreground/50 mt-1">
            tokens per second
          </p>
        </motion.div>
      </div>

      {/* Response Length Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-black/30 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-foreground/70">Longest Response</span>
          </div>
          <p className="text-xl font-mono text-green-500">{stats.longestResponse} tokens</p>
          <p className="text-xs text-foreground/50">~{Math.round(stats.longestResponse * 0.75)} words</p>
        </div>
        <div className="p-4 bg-black/30 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-foreground/70">Shortest Response</span>
          </div>
          <p className="text-xl font-mono text-yellow-500">{stats.shortestResponse} tokens</p>
          <p className="text-xs text-foreground/50">~{Math.round(stats.shortestResponse * 0.75)} words</p>
        </div>
      </div>

      {/* Per-Provider Breakdown */}
      {providerStats.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground/70">Output by Provider</h4>
          <div className="space-y-2">
            {providerStats.map((ps) => {
              const percentage = stats.totalTokens > 0
                ? (ps.tokens / stats.totalTokens) * 100
                : 0;

              return (
                <div key={ps.provider} className="p-3 bg-black/30 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="px-2 py-0.5 text-xs rounded font-medium"
                      style={{
                        backgroundColor: `${providerColors[ps.provider] || '#666'}20`,
                        color: providerColors[ps.provider] || '#666'
                      }}
                    >
                      {ps.provider}
                    </span>
                    <span className="text-sm text-foreground/60">{ps.responses} responses</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-foreground/70">
                      <span className="font-mono text-foreground">{ps.tokens.toLocaleString()}</span> tokens
                    </span>
                    <span className="text-foreground/70">
                      <span className="font-mono text-foreground">{ps.words.toLocaleString()}</span> words
                    </span>
                    <span className="text-foreground/70">
                      <span className="font-mono text-foreground">{ps.avgLatency}</span>ms avg
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 bg-black/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: providerColors[ps.provider] || '#666' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
