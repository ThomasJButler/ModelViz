/**
 * Metrics types for ModelViz v2.0
 * These types define the structure for tracking real API call metrics
 */

export interface ApiCallMetric {
  id: string;                       // UUID
  timestamp: number;                 // Date.now()
  provider: string;                  // 'OpenAI', 'Anthropic', 'DeepSeek', 'Perplexity'
  model: string;                     // 'gpt-4', 'claude-3', etc.
  inputFormat: 'json' | 'text' | 'code';

  // Performance
  latency: number;                   // milliseconds
  tokensUsed: number;                // total tokens
  promptTokens: number;              // input tokens
  completionTokens: number;          // output tokens

  // Status
  status: 'success' | 'error' | 'timeout';
  errorMessage?: string;

  // Cost (calculated)
  estimatedCost: number;             // USD

  // Context
  promptLength: number;              // characters
  responseLength: number;            // characters
  confidence?: number;               // 0-1
}

export interface ProviderStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  successRate: number;
  totalTokens: number;
  totalCost: number;
  avgLatency: number;
  avgTokensPerCall: number;
  avgCostPerCall: number;
}

export interface ModelStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  successRate: number;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  totalCost: number;
  avgLatency: number;
  avgTokensPerCall: number;
  avgCostPerCall: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
}

export interface HourlyStats {
  timestamp: number;
  hour: number;                     // 0-23
  calls: number;
  tokens: number;
  avgLatency: number;
  totalCost: number;
  successRate: number;
}

export interface DailyStats {
  timestamp: number;
  date: string;                      // 'YYYY-MM-DD'
  calls: number;
  tokens: number;
  avgLatency: number;
  totalCost: number;
  successRate: number;
  costByProvider: Record<string, number>;
  tokensByProvider: Record<string, number>;
}

export interface AggregatedMetrics {
  timeRange: { start: number; end: number; };

  // Usage stats
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  successRate: number;

  // Performance stats
  avgLatency: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  minLatency: number;
  maxLatency: number;

  // Token stats
  totalTokens: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  avgTokensPerCall: number;

  // Cost stats
  totalCost: number;
  avgCostPerCall: number;
  costByProvider: Record<string, number>;

  // By provider/model breakdowns
  byProvider: Record<string, ProviderStats>;
  byModel: Record<string, ModelStats>;

  // Time-based breakdowns
  hourlyStats: HourlyStats[];
  dailyStats: DailyStats[];
}

export interface MetricsFilter {
  providers?: string[];
  models?: string[];
  status?: ('success' | 'error' | 'timeout')[];
  startDate?: Date;
  endDate?: Date;
  minLatency?: number;
  maxLatency?: number;
  minCost?: number;
  maxCost?: number;
}

export interface PerformanceMetric {
  metric: string;
  value: number;
}

export interface SystemHealthMetric {
  timestamp: number;
  latency: number;
  tokens: number;
  success: boolean;
  provider: string;
  errorRate?: number;
  throughput?: number;
}

export type TimeRange = 'hour' | 'today' | 'week' | 'month' | 'year' | 'all' | 'custom';

export interface ChartDataPoint {
  date: string;
  tokens: number;
  requests: number;
  avgLatency: number;
  cost?: number;
}

export interface HeatmapCell {
  day: number;      // 0-6 (Sunday to Saturday)
  hour: number;     // 0-23
  value: number;    // Normalized 0-1
  tokens: number;   // Actual token count
}

export interface HeatmapData {
  data: HeatmapCell[];
  maxValue: number;
}