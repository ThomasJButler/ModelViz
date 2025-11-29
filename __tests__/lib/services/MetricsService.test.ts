import { MetricsService } from '@/lib/services/MetricsService';
import type { ApiCallMetric } from '@/lib/types/metrics';

// Mock the storage layer
jest.mock('@/lib/storage/metricsStorage', () => ({
  MetricsStorageManager: jest.fn().mockImplementation(() => ({
    init: jest.fn().mockResolvedValue(undefined),
    saveMetric: jest.fn().mockResolvedValue(undefined),
    getRecentMetrics: jest.fn().mockResolvedValue([]),
    getMetricsInRange: jest.fn().mockResolvedValue([]),
    getAllMetrics: jest.fn().mockResolvedValue([]),
    cleanupOldMetrics: jest.fn().mockResolvedValue(undefined),
    cleanupOldData: jest.fn().mockResolvedValue(undefined),
    clearAll: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('MetricsService', () => {
  let service: MetricsService;
  let mockStorage: any;

  const createMockMetric = (overrides?: Partial<ApiCallMetric>): Omit<ApiCallMetric, 'id'> => ({
    timestamp: Date.now(),
    provider: 'OpenAI',
    model: 'gpt-4',
    inputFormat: 'text' as const,
    latency: 150,
    tokensUsed: 100,
    promptTokens: 60,
    completionTokens: 40,
    status: 'success' as const,
    estimatedCost: 0.003,
    promptLength: 240,
    responseLength: 160,
    confidence: 0.95,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset service to get fresh instance
    (MetricsService as any).instance = undefined;
    service = MetricsService.getInstance();

    // Get the mocked storage instance (created by the MetricsService constructor)
    const { MetricsStorageManager } = require('@/lib/storage/metricsStorage');
    mockStorage = (MetricsStorageManager as jest.Mock).mock.results[
      (MetricsStorageManager as jest.Mock).mock.results.length - 1
    ].value;

    // Reset storage mocks
    mockStorage.getMetricsInRange.mockResolvedValue([]);
    mockStorage.getAllMetrics.mockResolvedValue([]);
  });

  describe('Singleton Pattern', () => {
    it('returns the same instance on multiple calls', () => {
      const instance1 = MetricsService.getInstance();
      const instance2 = MetricsService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('recordMetric', () => {
    it('records a metric successfully', async () => {
      const metric = createMockMetric();

      await service.recordMetric(metric);

      expect(mockStorage.saveMetric).toHaveBeenCalledWith(
        expect.objectContaining({
          ...metric,
          id: expect.any(String),
        })
      );
    });

    it('generates a unique UUID for each metric', async () => {
      const metric = createMockMetric();

      await service.recordMetric(metric);
      await service.recordMetric(metric);

      const calls = mockStorage.saveMetric.mock.calls;
      expect(calls[0][0].id).not.toBe(calls[1][0].id);
    });

    it('broadcasts metrics-updated event', async () => {
      const eventListener = jest.fn();
      window.addEventListener('metrics-updated', eventListener);

      const metric = createMockMetric();
      await service.recordMetric(metric);

      expect(eventListener).toHaveBeenCalled();

      window.removeEventListener('metrics-updated', eventListener);
    });

    it('handles error metrics correctly', async () => {
      const errorMetric = createMockMetric({
        status: 'error',
        errorMessage: 'API timeout',
        tokensUsed: 0,
        estimatedCost: 0,
        responseLength: 0,
      });

      await service.recordMetric(errorMetric);

      expect(mockStorage.saveMetric).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          errorMessage: 'API timeout',
        })
      );
    });
  });

  describe('getAggregatedMetrics', () => {
    it('returns empty aggregation when no metrics exist', async () => {
      mockStorage.getMetricsInRange.mockResolvedValue([]);

      const result = await service.getAggregatedMetrics('today');

      expect(result.totalCalls).toBe(0);
      expect(result.successfulCalls).toBe(0);
      expect(result.failedCalls).toBe(0);
      expect(result.successRate).toBe(0);
      expect(result.totalCost).toBe(0);
    });

    it('calculates basic statistics correctly', async () => {
      const metrics: ApiCallMetric[] = [
        { ...createMockMetric({ latency: 100, tokensUsed: 50, estimatedCost: 0.002 }), id: '1' },
        { ...createMockMetric({ latency: 200, tokensUsed: 100, estimatedCost: 0.004 }), id: '2' },
        { ...createMockMetric({ latency: 150, tokensUsed: 75, estimatedCost: 0.003 }), id: '3' },
      ];

      mockStorage.getMetricsInRange.mockResolvedValue(metrics);

      const result = await service.getAggregatedMetrics('today');

      expect(result.totalCalls).toBe(3);
      expect(result.successfulCalls).toBe(3);
      expect(result.failedCalls).toBe(0);
      expect(result.successRate).toBe(1);
      expect(result.avgLatency).toBe(150); // (100 + 200 + 150) / 3
      expect(result.totalTokens).toBe(225); // 50 + 100 + 75
      expect(result.avgTokensPerCall).toBe(75);
      expect(result.totalCost).toBeCloseTo(0.009, 5); // 0.002 + 0.004 + 0.003
    });

    it('calculates percentiles correctly', async () => {
      const metrics: ApiCallMetric[] = Array.from({ length: 100 }, (_, i) => ({
        ...createMockMetric({ latency: i + 1 }), // Latencies from 1 to 100
        id: `${i}`,
      }));

      mockStorage.getMetricsInRange.mockResolvedValue(metrics);

      const result = await service.getAggregatedMetrics('today');

      expect(result.p50Latency).toBeCloseTo(50, 0); // Median
      expect(result.p95Latency).toBeCloseTo(95, 0); // 95th percentile
      expect(result.p99Latency).toBeCloseTo(99, 0); // 99th percentile
    });

    it('handles failed calls in success rate calculation', async () => {
      const metrics: ApiCallMetric[] = [
        { ...createMockMetric({ status: 'success' }), id: '1' },
        { ...createMockMetric({ status: 'success' }), id: '2' },
        { ...createMockMetric({ status: 'error', errorMessage: 'Failed' }), id: '3' },
        { ...createMockMetric({ status: 'error', errorMessage: 'Failed' }), id: '4' },
      ];

      mockStorage.getMetricsInRange.mockResolvedValue(metrics);

      const result = await service.getAggregatedMetrics('today');

      expect(result.totalCalls).toBe(4);
      expect(result.successfulCalls).toBe(2);
      expect(result.failedCalls).toBe(2);
      expect(result.successRate).toBe(0.5);
    });

    it('groups metrics by provider correctly', async () => {
      const metrics: ApiCallMetric[] = [
        { ...createMockMetric({ provider: 'OpenAI', model: 'gpt-4', latency: 100, tokensUsed: 50, estimatedCost: 0.002 }), id: '1' },
        { ...createMockMetric({ provider: 'OpenAI', model: 'gpt-3.5', latency: 80, tokensUsed: 40, estimatedCost: 0.001 }), id: '2' },
        { ...createMockMetric({ provider: 'Anthropic', model: 'claude-3', latency: 120, tokensUsed: 60, estimatedCost: 0.003 }), id: '3' },
      ];

      mockStorage.getMetricsInRange.mockResolvedValue(metrics);

      const result = await service.getAggregatedMetrics('today');

      expect(result.byProvider['OpenAI'].totalCalls).toBe(2);
      expect(result.byProvider['OpenAI'].totalTokens).toBe(90);
      expect(result.byProvider['OpenAI'].totalCost).toBeCloseTo(0.003, 5);
      expect(result.byProvider['Anthropic'].totalCalls).toBe(1);
      expect(result.byProvider['Anthropic'].totalTokens).toBe(60);
    });

    it('groups metrics by model correctly', async () => {
      const metrics: ApiCallMetric[] = [
        { ...createMockMetric({ provider: 'OpenAI', model: 'gpt-4', latency: 100 }), id: '1' },
        { ...createMockMetric({ provider: 'OpenAI', model: 'gpt-4', latency: 120 }), id: '2' },
        { ...createMockMetric({ provider: 'OpenAI', model: 'gpt-3.5', latency: 80 }), id: '3' },
      ];

      mockStorage.getMetricsInRange.mockResolvedValue(metrics);

      const result = await service.getAggregatedMetrics('today');

      const gpt4Key = 'OpenAI:gpt-4';
      const gpt35Key = 'OpenAI:gpt-3.5';

      expect(result.byModel[gpt4Key].totalCalls).toBe(2);
      expect(result.byModel[gpt4Key].avgLatency).toBe(110);
      expect(result.byModel[gpt35Key].totalCalls).toBe(1);
    });

    it('generates hourly statistics correctly', async () => {
      const now = Date.now();
      const oneHourAgo = now - 3600000;
      const twoHoursAgo = now - 7200000;

      const metrics: ApiCallMetric[] = [
        { ...createMockMetric({ timestamp: now, tokensUsed: 100 }), id: '1' },
        { ...createMockMetric({ timestamp: now - 1000, tokensUsed: 50 }), id: '2' },
        { ...createMockMetric({ timestamp: oneHourAgo, tokensUsed: 75 }), id: '3' },
        { ...createMockMetric({ timestamp: twoHoursAgo, tokensUsed: 25 }), id: '4' },
      ];

      mockStorage.getMetricsInRange.mockResolvedValue(metrics);

      const result = await service.getAggregatedMetrics('today');

      expect(result.hourlyStats).toBeDefined();
      expect(result.hourlyStats.length).toBeGreaterThan(0);

      // Find the hour with the most recent metrics
      const currentHourStats = result.hourlyStats.find(stat => {
        const statHour = new Date(stat.timestamp).getHours();
        const currentHour = new Date(now).getHours();
        return statHour === currentHour;
      });

      expect(currentHourStats).toBeDefined();
      expect(currentHourStats!.tokens).toBe(150); // 100 + 50
    });

    it('generates daily statistics correctly', async () => {
      const today = new Date();
      today.setHours(12, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const metrics: ApiCallMetric[] = [
        { ...createMockMetric({ timestamp: today.getTime(), tokensUsed: 100, estimatedCost: 0.005 }), id: '1' },
        { ...createMockMetric({ timestamp: today.getTime(), tokensUsed: 50, estimatedCost: 0.002 }), id: '2' },
        { ...createMockMetric({ timestamp: yesterday.getTime(), tokensUsed: 75, estimatedCost: 0.003 }), id: '3' },
      ];

      mockStorage.getMetricsInRange.mockResolvedValue(metrics);

      const result = await service.getAggregatedMetrics('week');

      expect(result.dailyStats).toBeDefined();
      expect(result.dailyStats.length).toBeGreaterThan(0);

      // Find today's stats
      const todayStats = result.dailyStats.find(stat => {
        const statDay = new Date(stat.timestamp).toDateString();
        const currentDay = today.toDateString();
        return statDay === currentDay;
      });

      if (todayStats) {
        expect(todayStats.tokens).toBe(150);
        expect(todayStats.totalCost).toBeCloseTo(0.007, 5);
      }
    });
  });

  describe('getRecentMetrics', () => {
    it('returns requested number of recent metrics', async () => {
      const metrics: ApiCallMetric[] = Array.from({ length: 5 }, (_, i) => ({
        ...createMockMetric({ timestamp: Date.now() - i * 1000 }),
        id: `${i}`,
      }));

      mockStorage.getRecentMetrics.mockResolvedValue(metrics);

      const result = await service.getRecentMetrics(5);

      expect(result).toHaveLength(5);
    });

    it('returns all metrics if count is greater than available', async () => {
      const metrics: ApiCallMetric[] = Array.from({ length: 3 }, (_, i) => ({
        ...createMockMetric(),
        id: `${i}`,
      }));

      mockStorage.getRecentMetrics.mockResolvedValue(metrics);

      const result = await service.getRecentMetrics(10);

      expect(result).toHaveLength(3);
    });

    it('returns metrics in reverse chronological order', async () => {
      // Storage layer returns metrics already sorted
      const metrics: ApiCallMetric[] = [
        { ...createMockMetric({ timestamp: 3000 }), id: '3' },
        { ...createMockMetric({ timestamp: 2000 }), id: '2' },
        { ...createMockMetric({ timestamp: 1000 }), id: '1' },
      ];

      mockStorage.getRecentMetrics.mockResolvedValue(metrics);

      const result = await service.getRecentMetrics(10);

      expect(result[0].timestamp).toBe(3000);
      expect(result[1].timestamp).toBe(2000);
      expect(result[2].timestamp).toBe(1000);
    });
  });

  describe('Time Range Filtering', () => {
    it('requests correct time range for "hour"', async () => {
      await service.getAggregatedMetrics('hour');

      const [[start, end]] = mockStorage.getMetricsInRange.mock.calls;
      const hourInMs = 3600000;

      expect(end - start).toBeLessThanOrEqual(hourInMs + 1000); // Allow 1s tolerance
    });

    it('requests correct time range for "today"', async () => {
      await service.getAggregatedMetrics('today');

      const [[start]] = mockStorage.getMetricsInRange.mock.calls;
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      expect(start).toBeGreaterThanOrEqual(startOfToday.getTime());
    });

    it('requests correct time range for "week"', async () => {
      await service.getAggregatedMetrics('week');

      const [[start, end]] = mockStorage.getMetricsInRange.mock.calls;
      const weekInMs = 7 * 24 * 3600000;

      expect(end - start).toBeLessThanOrEqual(weekInMs + 86400000); // Allow 1 day tolerance
    });
  });

  describe('Edge Cases', () => {
    it('handles single metric correctly', async () => {
      const metrics: ApiCallMetric[] = [
        { ...createMockMetric({ latency: 100, tokensUsed: 50 }), id: '1' },
      ];

      mockStorage.getMetricsInRange.mockResolvedValue(metrics);

      const result = await service.getAggregatedMetrics('today');

      expect(result.totalCalls).toBe(1);
      expect(result.avgLatency).toBe(100);
      expect(result.p50Latency).toBe(100);
      expect(result.p95Latency).toBe(100);
    });

    it('handles metrics with zero tokens', async () => {
      const metrics: ApiCallMetric[] = [
        { ...createMockMetric({ tokensUsed: 0, promptTokens: 0, completionTokens: 0 }), id: '1' },
      ];

      mockStorage.getMetricsInRange.mockResolvedValue(metrics);

      const result = await service.getAggregatedMetrics('today');

      expect(result.totalTokens).toBe(0);
      expect(result.avgTokensPerCall).toBe(0);
    });

    it('handles metrics with missing optional fields', async () => {
      const metrics: ApiCallMetric[] = [
        {
          id: '1',
          timestamp: Date.now(),
          provider: 'OpenAI',
          model: 'gpt-4',
          inputFormat: 'text',
          latency: 100,
          tokensUsed: 50,
          promptTokens: 30,
          completionTokens: 20,
          status: 'success',
          estimatedCost: 0.002,
          promptLength: 120,
          responseLength: 80,
          // confidence is optional
        },
      ];

      mockStorage.getMetricsInRange.mockResolvedValue(metrics);

      const result = await service.getAggregatedMetrics('today');

      expect(result.totalCalls).toBe(1);
    });
  });
});
