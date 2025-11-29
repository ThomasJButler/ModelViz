/**
 * MetricsService - Singleton service for recording and aggregating API metrics
 * Handles real-time metric collection, storage, and aggregation
 */

import {
  ApiCallMetric,
  AggregatedMetrics,
  ProviderStats,
  ModelStats,
  HourlyStats,
  DailyStats,
  TimeRange,
  MetricsFilter
} from '@/lib/types/metrics';
import { MetricsStorageManager } from '@/lib/storage/metricsStorage';

export class MetricsService {
  private static instance: MetricsService;
  private storage: MetricsStorageManager;
  private sessionMetrics: ApiCallMetric[] = [];
  private initialized: boolean = false;
  private initializing: boolean = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {
    this.storage = new MetricsStorageManager();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): MetricsService {
    if (!this.instance) {
      this.instance = new MetricsService();
    }
    return this.instance;
  }

  /**
   * Initialize the service with proper synchronization
   */
  async init(): Promise<void> {
    // If already initialized, return immediately
    if (this.initialized) return;

    // If currently initializing, return the pending promise to avoid race conditions
    if (this.initializing && this.initPromise) {
      return this.initPromise;
    }

    // Mark as initializing and create the initialization promise
    this.initializing = true;
    this.initPromise = this._performInit();

    try {
      await this.initPromise;
    } finally {
      this.initializing = false;
    }
  }

  /**
   * Perform actual initialization
   */
  private async _performInit(): Promise<void> {
    try {
      await this.storage.init();

      // Load recent metrics into session cache
      this.sessionMetrics = await this.storage.getRecentMetrics(100);

      this.initialized = true;

      // Schedule cleanup job (runs daily)
      this.scheduleCleanup();
    } catch (error) {
      console.error('[MetricsService] Initialization failed:', error);
      // Continue anyway but mark initialized to prevent infinite retries
      this.initialized = true;
    }
  }

  /**
   * Record a new API call metric
   */
  async recordMetric(metric: Omit<ApiCallMetric, 'id'>): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }

    const fullMetric: ApiCallMetric = {
      ...metric,
      id: crypto.randomUUID()
    };

    // Add to session cache (synchronous)
    this.sessionMetrics.push(fullMetric);

    // Persist to storage (asynchronous)
    try {
      await this.storage.saveMetric(fullMetric);

      // Emit event for real-time updates only after storage completes
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('metrics-updated', {
          detail: fullMetric
        }));
      }
    } catch (error) {
      console.error('[MetricsService] Failed to save metric to storage:', error);
      // Still dispatch event so UI knows about session metrics, but log the error
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('metrics-update-failed', {
          detail: { metric: fullMetric, error }
        }));
      }
    }
  }

  /**
   * Get aggregated metrics for a time range
   */
  async getAggregatedMetrics(range: TimeRange = 'today'): Promise<AggregatedMetrics> {
    if (!this.initialized) {
      await this.init();
    }

    const metrics = await this.getMetricsForRange(range);
    return this.aggregateMetrics(metrics);
  }

  /**
   * Get recent metrics
   */
  async getRecentMetrics(limit: number = 100): Promise<ApiCallMetric[]> {
    if (!this.initialized) {
      await this.init();
    }

    return this.storage.getRecentMetrics(limit);
  }

  /**
   * Get all metrics (use with caution)
   */
  async getAllMetrics(): Promise<ApiCallMetric[]> {
    if (!this.initialized) {
      await this.init();
    }

    return this.storage.getAllMetrics();
  }

  /**
   * Get metrics for a specific time range
   */
  private async getMetricsForRange(range: TimeRange): Promise<ApiCallMetric[]> {
    const now = Date.now();
    let start: number;
    let end: number = now;

    switch (range) {
      case 'hour':
        start = now - (60 * 60 * 1000);
        break;
      case 'today':
        start = new Date().setHours(0, 0, 0, 0);
        break;
      case 'week':
        start = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = now - (30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        start = now - (365 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        return this.storage.getAllMetrics();
      default:
        start = new Date().setHours(0, 0, 0, 0);
    }

    return this.storage.getMetricsInRange(start, end);
  }

  /**
   * Aggregate metrics into statistics
   */
  private aggregateMetrics(metrics: ApiCallMetric[]): AggregatedMetrics {
    if (metrics.length === 0) {
      return this.getEmptyAggregation();
    }

    const timestamps = metrics.map(m => m.timestamp);
    const timeRange = {
      start: Math.min(...timestamps),
      end: Math.max(...timestamps)
    };

    // Basic stats
    const totalCalls = metrics.length;
    const successfulCalls = metrics.filter(m => m.status === 'success').length;
    const failedCalls = totalCalls - successfulCalls;
    const successRate = totalCalls > 0 ? successfulCalls / totalCalls : 0;

    // Latency stats
    const latencies = metrics.map(m => m.latency).sort((a, b) => a - b);
    const avgLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
    const p50Latency = this.calculatePercentile(latencies, 0.50);
    const p95Latency = this.calculatePercentile(latencies, 0.95);
    const p99Latency = this.calculatePercentile(latencies, 0.99);
    const minLatency = latencies[0] || 0;
    const maxLatency = latencies[latencies.length - 1] || 0;

    // Token stats
    const totalTokens = metrics.reduce((sum, m) => sum + m.tokensUsed, 0);
    const totalPromptTokens = metrics.reduce((sum, m) => sum + m.promptTokens, 0);
    const totalCompletionTokens = metrics.reduce((sum, m) => sum + m.completionTokens, 0);
    const avgTokensPerCall = totalTokens / totalCalls;

    // Cost stats
    const totalCost = metrics.reduce((sum, m) => sum + m.estimatedCost, 0);
    const avgCostPerCall = totalCost / totalCalls;

    // Group by provider
    const byProvider = this.groupByProvider(metrics);
    const costByProvider = Object.entries(byProvider).reduce((acc, [provider, stats]) => {
      acc[provider] = stats.totalCost;
      return acc;
    }, {} as Record<string, number>);

    // Group by model
    const byModel = this.groupByModel(metrics);

    // Time-based breakdowns
    const hourlyStats = this.calculateHourlyStats(metrics);
    const dailyStats = this.calculateDailyStats(metrics);

    return {
      timeRange,
      totalCalls,
      successfulCalls,
      failedCalls,
      successRate,
      avgLatency,
      p50Latency,
      p95Latency,
      p99Latency,
      minLatency,
      maxLatency,
      totalTokens,
      totalPromptTokens,
      totalCompletionTokens,
      avgTokensPerCall,
      totalCost,
      avgCostPerCall,
      costByProvider,
      byProvider,
      byModel,
      hourlyStats,
      dailyStats
    };
  }

  /**
   * Calculate percentile from sorted array
   */
  private calculatePercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;
    const index = Math.ceil(sortedArray.length * percentile) - 1;
    return sortedArray[Math.max(0, index)];
  }

  /**
   * Group metrics by provider
   */
  private groupByProvider(metrics: ApiCallMetric[]): Record<string, ProviderStats> {
    const grouped: Record<string, ApiCallMetric[]> = {};

    metrics.forEach(metric => {
      if (!grouped[metric.provider]) {
        grouped[metric.provider] = [];
      }
      grouped[metric.provider].push(metric);
    });

    const stats: Record<string, ProviderStats> = {};

    Object.entries(grouped).forEach(([provider, providerMetrics]) => {
      const totalCalls = providerMetrics.length;
      const successfulCalls = providerMetrics.filter(m => m.status === 'success').length;
      const failedCalls = totalCalls - successfulCalls;
      const totalTokens = providerMetrics.reduce((sum, m) => sum + m.tokensUsed, 0);
      const totalCost = providerMetrics.reduce((sum, m) => sum + m.estimatedCost, 0);
      const totalLatency = providerMetrics.reduce((sum, m) => sum + m.latency, 0);

      stats[provider] = {
        totalCalls,
        successfulCalls,
        failedCalls,
        successRate: successfulCalls / totalCalls,
        totalTokens,
        totalCost,
        avgLatency: totalLatency / totalCalls,
        avgTokensPerCall: totalTokens / totalCalls,
        avgCostPerCall: totalCost / totalCalls
      };
    });

    return stats;
  }

  /**
   * Group metrics by model
   */
  private groupByModel(metrics: ApiCallMetric[]): Record<string, ModelStats> {
    const grouped: Record<string, ApiCallMetric[]> = {};

    metrics.forEach(metric => {
      const key = `${metric.provider}:${metric.model}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(metric);
    });

    const stats: Record<string, ModelStats> = {};

    Object.entries(grouped).forEach(([model, modelMetrics]) => {
      const totalCalls = modelMetrics.length;
      const successfulCalls = modelMetrics.filter(m => m.status === 'success').length;
      const failedCalls = totalCalls - successfulCalls;
      const totalTokens = modelMetrics.reduce((sum, m) => sum + m.tokensUsed, 0);
      const promptTokens = modelMetrics.reduce((sum, m) => sum + m.promptTokens, 0);
      const completionTokens = modelMetrics.reduce((sum, m) => sum + m.completionTokens, 0);
      const totalCost = modelMetrics.reduce((sum, m) => sum + m.estimatedCost, 0);
      const totalLatency = modelMetrics.reduce((sum, m) => sum + m.latency, 0);

      const latencies = modelMetrics.map(m => m.latency).sort((a, b) => a - b);

      stats[model] = {
        totalCalls,
        successfulCalls,
        failedCalls,
        successRate: successfulCalls / totalCalls,
        totalTokens,
        promptTokens,
        completionTokens,
        totalCost,
        avgLatency: totalLatency / totalCalls,
        avgTokensPerCall: totalTokens / totalCalls,
        avgCostPerCall: totalCost / totalCalls,
        p50Latency: this.calculatePercentile(latencies, 0.50),
        p95Latency: this.calculatePercentile(latencies, 0.95),
        p99Latency: this.calculatePercentile(latencies, 0.99)
      };
    });

    return stats;
  }

  /**
   * Calculate hourly statistics
   */
  private calculateHourlyStats(metrics: ApiCallMetric[]): HourlyStats[] {
    const hourlyMap: Record<string, ApiCallMetric[]> = {};

    metrics.forEach(metric => {
      const date = new Date(metric.timestamp);
      const hourKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;

      if (!hourlyMap[hourKey]) {
        hourlyMap[hourKey] = [];
      }
      hourlyMap[hourKey].push(metric);
    });

    return Object.entries(hourlyMap).map(([key, hourMetrics]) => {
      const timestamp = hourMetrics[0].timestamp;
      const hour = new Date(timestamp).getHours();
      const calls = hourMetrics.length;
      const successfulCalls = hourMetrics.filter(m => m.status === 'success').length;
      const tokens = hourMetrics.reduce((sum, m) => sum + m.tokensUsed, 0);
      const latency = hourMetrics.reduce((sum, m) => sum + m.latency, 0) / calls;
      const totalCost = hourMetrics.reduce((sum, m) => sum + m.estimatedCost, 0);

      return {
        timestamp,
        hour,
        calls,
        tokens,
        avgLatency: latency,
        totalCost,
        successRate: successfulCalls / calls
      };
    }).sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Calculate daily statistics
   */
  private calculateDailyStats(metrics: ApiCallMetric[]): DailyStats[] {
    const dailyMap: Record<string, ApiCallMetric[]> = {};

    metrics.forEach(metric => {
      const date = new Date(metric.timestamp);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = [];
      }
      dailyMap[dateKey].push(metric);
    });

    return Object.entries(dailyMap).map(([dateKey, dayMetrics]) => {
      const timestamp = dayMetrics[0].timestamp;
      const calls = dayMetrics.length;
      const successfulCalls = dayMetrics.filter(m => m.status === 'success').length;
      const tokens = dayMetrics.reduce((sum, m) => sum + m.tokensUsed, 0);
      const latency = dayMetrics.reduce((sum, m) => sum + m.latency, 0) / calls;
      const totalCost = dayMetrics.reduce((sum, m) => sum + m.estimatedCost, 0);

      // Cost by provider
      const costByProvider: Record<string, number> = {};
      const tokensByProvider: Record<string, number> = {};

      dayMetrics.forEach(metric => {
        if (!costByProvider[metric.provider]) {
          costByProvider[metric.provider] = 0;
          tokensByProvider[metric.provider] = 0;
        }
        costByProvider[metric.provider] += metric.estimatedCost;
        tokensByProvider[metric.provider] += metric.tokensUsed;
      });

      return {
        timestamp,
        date: dateKey,
        calls,
        tokens,
        avgLatency: latency,
        totalCost,
        successRate: successfulCalls / calls,
        costByProvider,
        tokensByProvider
      };
    }).sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get empty aggregation structure
   */
  private getEmptyAggregation(): AggregatedMetrics {
    return {
      timeRange: { start: 0, end: 0 },
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      successRate: 0,
      avgLatency: 0,
      p50Latency: 0,
      p95Latency: 0,
      p99Latency: 0,
      minLatency: 0,
      maxLatency: 0,
      totalTokens: 0,
      totalPromptTokens: 0,
      totalCompletionTokens: 0,
      avgTokensPerCall: 0,
      totalCost: 0,
      avgCostPerCall: 0,
      costByProvider: {},
      byProvider: {},
      byModel: {},
      hourlyStats: [],
      dailyStats: []
    };
  }

  /**
   * Schedule daily cleanup job
   */
  private scheduleCleanup(): void {
    // Run cleanup every 24 hours
    const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

    setInterval(async () => {
      try {
        await this.storage.cleanupOldData();
      } catch (error) {
        console.error('Metrics cleanup failed:', error);
      }
    }, CLEANUP_INTERVAL);

    // Run initial cleanup
    this.storage.cleanupOldData().catch(error => {
      console.error('Initial cleanup failed:', error);
    });
  }

  /**
   * Clear all metrics data
   */
  async clearAllMetrics(): Promise<void> {
    await this.storage.clearAll();
    this.sessionMetrics = [];

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('metrics-cleared'));
    }
  }
}

// Export singleton instance
export const metricsService = MetricsService.getInstance();
