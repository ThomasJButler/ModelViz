# ModelViz v2.0 - Real Data Integration Implementation Plan

## Executive Summary

Transform ModelViz from a demonstration tool with mock data into a fully functional analytics platform that captures, stores, and visualizes real API metrics from the playground.

**Timeline**: 4 weeks (100 hours)
**Complexity**: Medium
**Risk**: Low (incremental implementation)
**Impact**: High (transforms demo into professional tool)

---

## Phase 1: Foundation Infrastructure (Week 1)

### 1.1 Data Types & Schema

Create `/lib/types/metrics.ts`:

```typescript
export interface ApiCallMetric {
  id: string;                    // UUID
  timestamp: number;              // Date.now()
  provider: string;               // 'OpenAI', 'Anthropic', etc.
  model: string;                  // 'gpt-4', 'claude-3', etc.
  inputFormat: 'json' | 'text' | 'code';

  // Performance
  latency: number;                // milliseconds
  tokensUsed: number;             // total tokens
  promptTokens: number;           // input tokens
  completionTokens: number;       // output tokens

  // Status
  status: 'success' | 'error' | 'timeout';
  errorMessage?: string;

  // Cost (calculated)
  estimatedCost: number;          // USD

  // Context
  promptLength: number;           // characters
  responseLength: number;         // characters
  confidence?: number;            // 0-1
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

  // Token stats
  totalTokens: number;
  avgTokensPerCall: number;

  // Cost stats
  totalCost: number;
  avgCostPerCall: number;

  // By provider/model breakdowns
  byProvider: Record<string, ProviderStats>;
  byModel: Record<string, ModelStats>;

  // Time-based breakdowns
  hourlyStats: HourlyStats[];
  dailyStats: DailyStats[];
}
```

### 1.2 Storage Layer

Create `/lib/storage/metricsStorage.ts`:

```typescript
class LocalStorageAdapter {
  private readonly KEY = 'modelviz_metrics_recent';
  private readonly MAX_ENTRIES = 100;

  async save(metrics: ApiCallMetric[]): Promise<void> {
    const recent = metrics.slice(-this.MAX_ENTRIES);
    localStorage.setItem(this.KEY, JSON.stringify(recent));
  }

  async load(): Promise<ApiCallMetric[]> {
    const data = localStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : [];
  }
}

class IndexedDBAdapter {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'modelviz_metrics';
  private readonly STORE_NAME = 'metrics';

  async init(): Promise<void> {
    // Open IndexedDB connection
    // Create object store if needed
  }

  async saveMetric(metric: ApiCallMetric): Promise<void> {
    // Add to IndexedDB
  }

  async getMetricsInRange(start: number, end: number): Promise<ApiCallMetric[]> {
    // Query by timestamp range
  }

  async cleanupOldMetrics(olderThan: number): Promise<void> {
    // Delete metrics older than specified timestamp
  }
}
```

### 1.3 MetricsService

Create `/lib/services/MetricsService.ts`:

```typescript
export class MetricsService {
  private static instance: MetricsService;
  private localStorage: LocalStorageAdapter;
  private indexedDB: IndexedDBAdapter;
  private sessionMetrics: ApiCallMetric[] = [];

  static getInstance(): MetricsService {
    if (!this.instance) {
      this.instance = new MetricsService();
    }
    return this.instance;
  }

  async recordMetric(metric: Omit<ApiCallMetric, 'id'>): Promise<void> {
    const fullMetric: ApiCallMetric = {
      ...metric,
      id: crypto.randomUUID()
    };

    // Add to session cache
    this.sessionMetrics.push(fullMetric);

    // Persist to storage
    await Promise.all([
      this.localStorage.save([...this.sessionMetrics]),
      this.indexedDB.saveMetric(fullMetric)
    ]);

    // Emit event for real-time updates
    window.dispatchEvent(new CustomEvent('metrics-updated', {
      detail: fullMetric
    }));
  }

  async getAggregatedMetrics(range: 'today' | 'week' | 'month' | 'all'): Promise<AggregatedMetrics> {
    const metrics = await this.getMetricsForRange(range);
    return this.aggregateMetrics(metrics);
  }

  private aggregateMetrics(metrics: ApiCallMetric[]): AggregatedMetrics {
    // Calculate all aggregations
    // Group by provider, model, hour, day
    // Calculate percentiles, averages, totals
  }
}
```

### 1.4 Cost Calculator

Create `/lib/utils/costCalculator.ts`:

```typescript
// Pricing as of Jan 2025
const PRICING_TABLE = {
  'OpenAI': {
    'gpt-4-turbo': { input: 0.01, output: 0.03 }, // per 1K tokens
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  },
  'Anthropic': {
    'claude-3-opus': { input: 0.015, output: 0.075 },
    'claude-3-sonnet': { input: 0.003, output: 0.015 },
    'claude-3-haiku': { input: 0.00025, output: 0.00125 },
  },
  'DeepSeek': {
    'deepseek-chat': { input: 0.0001, output: 0.0002 },
    'deepseek-coder': { input: 0.0001, output: 0.0002 },
  },
  'Perplexity': {
    'pplx-7b': { input: 0.0002, output: 0.0002 },
    'pplx-70b': { input: 0.001, output: 0.001 },
  }
};

export function calculateCost(
  provider: string,
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const pricing = PRICING_TABLE[provider]?.[model];
  if (!pricing) return 0;

  const inputCost = (promptTokens / 1000) * pricing.input;
  const outputCost = (completionTokens / 1000) * pricing.output;

  return Number((inputCost + outputCost).toFixed(6));
}
```

---

## Phase 2: Playground Integration (Week 1-2)

### 2.1 Update Playground API

Modify `/lib/playground/api.ts`:

```typescript
// Add after line 242 (successful response):
import { MetricsService } from '@/lib/services/MetricsService';
import { calculateCost } from '@/lib/utils/costCalculator';

// Inside generatePlaygroundResponse function, after successful response:
const metricsService = MetricsService.getInstance();

// Estimate tokens (rough calculation)
const promptTokens = Math.ceil(prompt.length / 4);
const completionTokens = tokensUsed - promptTokens;

await metricsService.recordMetric({
  timestamp: Date.now(),
  provider: request.provider,
  model: request.modelId,
  inputFormat: request.inputFormat,
  latency: endTime - startTime,
  tokensUsed: tokensUsed,
  promptTokens: promptTokens,
  completionTokens: completionTokens,
  status: 'success',
  estimatedCost: calculateCost(
    request.provider,
    request.modelId,
    promptTokens,
    completionTokens
  ),
  promptLength: prompt.length,
  responseLength: response.length,
  confidence: 0.92 + (Math.random() * 0.08)
});

// Also add error tracking in catch block:
await metricsService.recordMetric({
  timestamp: Date.now(),
  provider: request.provider,
  model: request.modelId,
  inputFormat: request.inputFormat,
  latency: Date.now() - startTime,
  tokensUsed: 0,
  promptTokens: Math.ceil(prompt.length / 4),
  completionTokens: 0,
  status: 'error',
  errorMessage: error.message,
  estimatedCost: 0,
  promptLength: prompt.length,
  responseLength: 0
});
```

### 2.2 Update Playground Page

Modify `/app/playground/page.tsx`:

```typescript
// Add real-time metrics listener
useEffect(() => {
  const handleMetricsUpdate = async () => {
    const service = MetricsService.getInstance();
    const aggregated = await service.getAggregatedMetrics('today');

    setMetrics({
      requestCount: aggregated.totalCalls,
      avgLatency: Math.round(aggregated.avgLatency),
      successRate: aggregated.successRate,
      totalCost: aggregated.totalCost
    });
  };

  window.addEventListener('metrics-updated', handleMetricsUpdate);
  handleMetricsUpdate(); // Load initial data

  return () => {
    window.removeEventListener('metrics-updated', handleMetricsUpdate);
  };
}, []);

// Add link to analytics
<Link href="/analytics" className="...">
  <LineChart className="w-4 h-4" />
  View Real Analytics
</Link>
```

---

## Phase 3: Visualization Integration (Week 2-3)

### 3.1 Usage Patterns Component

Update `/components/analytics/usage-patterns.tsx`:

```typescript
useEffect(() => {
  const loadRealData = async () => {
    const service = MetricsService.getInstance();
    const aggregated = await service.getAggregatedMetrics('week');

    // Transform to chart format
    const chartData = aggregated.dailyStats.map((stat, index) => ({
      date: format(subDays(new Date(), 6 - index), 'MMM dd'),
      tokens: stat.tokens,
      requests: stat.calls,
      avgLatency: stat.avgLatency
    }));

    setUsageData(chartData);
    setLoading(false);
  };

  loadRealData();

  // Listen for real-time updates
  const handleUpdate = () => loadRealData();
  window.addEventListener('metrics-updated', handleUpdate);

  return () => {
    window.removeEventListener('metrics-updated', handleUpdate);
  };
}, []);
```

### 3.2 Token Usage Heatmap

Update `/components/analytics/token-usage-heatmap.tsx`:

```typescript
const generateRealHeatmapData = async (): Promise<HeatmapData> => {
  const service = MetricsService.getInstance();
  const aggregated = await service.getAggregatedMetrics('week');

  // Create 7x24 grid from hourly stats
  const data: HeatmapCell[] = [];
  const maxTokens = Math.max(...aggregated.hourlyStats.map(s => s.tokens));

  aggregated.hourlyStats.forEach(stat => {
    const dayOfWeek = new Date(stat.timestamp).getDay();
    const hour = new Date(stat.timestamp).getHours();

    data.push({
      day: dayOfWeek,
      hour: hour,
      value: stat.tokens / maxTokens, // Normalize 0-1
      tokens: stat.tokens
    });
  });

  return { data, maxValue: maxTokens };
};
```

### 3.3 Model Performance

Update `/components/analytics/model-performance.tsx`:

```typescript
const loadRealPerformance = async () => {
  const service = MetricsService.getInstance();
  const aggregated = await service.getAggregatedMetrics('month');

  const performanceData: Record<string, PerformanceMetric[]> = {};

  Object.entries(aggregated.byModel).forEach(([model, stats]) => {
    performanceData[model] = [
      { metric: 'Latency', value: normalizeLatency(stats.avgLatency) },
      { metric: 'Success Rate', value: stats.successRate },
      { metric: 'Token Efficiency', value: calculateEfficiency(stats) },
      { metric: 'Cost Efficiency', value: calculateCostEfficiency(stats) },
      { metric: 'Throughput', value: calculateThroughput(stats) }
    ];
  });

  setData(performanceData);
};
```

### 3.4 Cost Analysis

Update `/components/analytics/cost-analysis.tsx`:

```typescript
const loadRealCosts = async () => {
  const service = MetricsService.getInstance();
  const aggregated = await service.getAggregatedMetrics('month');

  // Daily cost breakdown
  const costData = aggregated.dailyStats.map(stat => ({
    date: format(new Date(stat.timestamp), 'MMM dd'),
    total: stat.totalCost,
    ...Object.entries(stat.costByProvider).reduce((acc, [provider, cost]) => ({
      ...acc,
      [provider]: cost
    }), {})
  }));

  setCostData(costData);

  // Calculate totals
  const totalSpend = aggregated.totalCost;
  const projectedMonthly = (totalSpend / aggregated.dailyStats.length) * 30;

  setTotals({
    current: totalSpend,
    projected: projectedMonthly
  });
};
```

### 3.5 API Gateway Metrics

Update `/components/analytics/api-gateway.tsx`:

```typescript
const loadRealApiMetrics = async () => {
  const service = MetricsService.getInstance();
  const recent = await service.getRecentMetrics(100);

  // Group by provider
  const providerMetrics = recent.reduce((acc, metric) => {
    if (!acc[metric.provider]) {
      acc[metric.provider] = {
        requests: 0,
        avgLatency: 0,
        errors: 0,
        totalLatency: 0
      };
    }

    acc[metric.provider].requests++;
    acc[metric.provider].totalLatency += metric.latency;
    if (metric.status === 'error') acc[metric.provider].errors++;

    return acc;
  }, {} as Record<string, ProviderMetrics>);

  // Calculate averages
  Object.values(providerMetrics).forEach(metrics => {
    metrics.avgLatency = metrics.totalLatency / metrics.requests;
  });

  setApiMetrics(providerMetrics);
};
```

### 3.6 System Health

Update `/components/analytics/system-health.tsx`:

```typescript
const [realtimeMetrics, setRealtimeMetrics] = useState<SystemMetrics[]>([]);

useEffect(() => {
  const updateHealth = async () => {
    const service = MetricsService.getInstance();
    const recent = await service.getRecentMetrics(1);

    if (recent.length > 0) {
      const latest = recent[0];

      setRealtimeMetrics(prev => [...prev.slice(-59), {
        timestamp: latest.timestamp,
        latency: latest.latency,
        tokens: latest.tokensUsed,
        success: latest.status === 'success',
        provider: latest.provider
      }]);
    }
  };

  // Update every time a new metric is recorded
  window.addEventListener('metrics-updated', updateHealth);

  // Also update periodically for smooth animation
  const interval = setInterval(updateHealth, 1000);

  return () => {
    window.removeEventListener('metrics-updated', updateHealth);
    clearInterval(interval);
  };
}, []);
```

---

## Phase 4: Remaining Components (Week 3)

### 4.1 Predictive Trends

```typescript
// Use time series forecasting on historical data
const forecast = await forecastNextWeek(historicalMetrics);
```

### 4.2 Security Insights

```typescript
// Track error patterns and anomalies
const anomalies = detectAnomalies(metrics);
const errorPatterns = analyzeErrors(failedCalls);
```

### 4.3 AI Scorecard

```typescript
// Calculate F1 scores from success rates
const f1Score = calculateF1(truePositives, falsePositives, falseNegatives);
```

### 4.4 Neural Activity Map

```typescript
// Real-time 3D visualization of API activity
const activityPulses = metrics.map(m => ({
  position: mapProviderToPosition(m.provider),
  intensity: m.tokensUsed / maxTokens,
  timestamp: m.timestamp
}));
```

---

## Phase 5: Additional Features

### 5.1 Export Functionality

Create `/components/analytics/MetricsExport.tsx`:

```typescript
const exportMetrics = async (format: 'json' | 'csv') => {
  const service = MetricsService.getInstance();
  const allMetrics = await service.getAllMetrics();

  if (format === 'json') {
    const blob = new Blob([JSON.stringify(allMetrics, null, 2)], {
      type: 'application/json'
    });
    downloadBlob(blob, 'modelviz-metrics.json');
  } else {
    const csv = convertToCSV(allMetrics);
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadBlob(blob, 'modelviz-metrics.csv');
  }
};
```

### 5.2 Date Range Picker

Create `/components/analytics/DateRangePicker.tsx`:

```typescript
interface DateRangePickerProps {
  onRangeChange: (start: Date, end: Date) => void;
}

export function DateRangePicker({ onRangeChange }: DateRangePickerProps) {
  // Calendar component for selecting custom date ranges
  // Quick presets: Today, Week, Month, Year, All Time
}
```

### 5.3 Data Migration

Add to `/app/layout.tsx`:

```typescript
// Run migration on app load
useEffect(() => {
  const migrateOldData = () => {
    // Migrate old localStorage keys
    const oldConfig = localStorage.getItem('ai_comparison_api_config');
    if (oldConfig && !localStorage.getItem('modelviz_api_config')) {
      localStorage.setItem('modelviz_api_config', oldConfig);
      console.log('Migrated API config to new key');
    }

    // Migrate cache entries
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('ai-showcase:')) {
        const value = localStorage.getItem(key);
        const newKey = key.replace('ai-showcase:', 'modelviz:');
        localStorage.setItem(newKey, value!);
        localStorage.removeItem(key);
        console.log(`Migrated cache key: ${key} -> ${newKey}`);
      }
    }
  };

  migrateOldData();
}, []);
```

---

## Phase 6: Testing Strategy

### 6.1 Unit Tests

```typescript
// /tests/lib/services/MetricsService.test.ts
describe('MetricsService', () => {
  it('should record metrics to storage', async () => {
    const service = MetricsService.getInstance();
    await service.recordMetric(mockMetric);
    const recent = await service.getRecentMetrics(1);
    expect(recent[0]).toMatchObject(mockMetric);
  });

  it('should aggregate metrics correctly', async () => {
    // Test aggregation logic
  });

  it('should handle storage errors gracefully', async () => {
    // Test error handling
  });
});
```

### 6.2 Integration Tests

```typescript
// Test playground -> metrics flow
it('should record metrics when API call is made', async () => {
  // Simulate playground API call
  // Verify metric is recorded
  // Check analytics update
});
```

### 6.3 Performance Tests

```typescript
// Test with large datasets
it('should handle 10000+ metrics efficiently', async () => {
  // Generate large dataset
  // Test query performance
  // Check memory usage
});
```

---

## Phase 7: Deployment Checklist

### Pre-Deploy
- [ ] All tests passing
- [ ] Build successful
- [ ] Bundle size < 500KB increase
- [ ] Lighthouse scores > 90
- [ ] No console errors
- [ ] Migration tested

### Deploy
- [ ] Deploy to staging
- [ ] Test data persistence
- [ ] Verify IndexedDB in all browsers
- [ ] Test mobile responsiveness
- [ ] Check analytics tracking

### Post-Deploy
- [ ] Monitor error rates
- [ ] Check storage usage
- [ ] Gather user feedback
- [ ] Plan hotfixes if needed

---

## Technical Decisions

### Why LocalStorage + IndexedDB?
- **LocalStorage**: Fast access for recent data (last 100 calls)
- **IndexedDB**: Unlimited storage for historical data
- **No backend needed**: Privacy-first, works offline
- **Browser-based**: No infrastructure costs

### Why Custom MetricsService?
- **Real-time updates**: Event-driven architecture
- **Flexible aggregation**: Custom queries for each viz
- **Performance**: In-memory caching for session data
- **Extensible**: Easy to add new metrics/visualizations

### Why 90-day retention?
- **Storage limits**: Prevent unbounded growth
- **Performance**: Keep queries fast
- **Relevance**: Older data less useful for trends
- **Export option**: Users can export before deletion

---

## Risk Mitigation

### Storage Quota Exceeded
- Auto-cleanup of old data
- Compression for large datasets
- Graceful degradation to LocalStorage-only

### Browser Compatibility
- Feature detection for IndexedDB
- Polyfills for older browsers
- Progressive enhancement approach

### Performance Issues
- Virtualization for large lists
- Pagination for data queries
- Web Workers for heavy computation

---

## Success Metrics

### Technical
- [ ] 95%+ API calls recorded
- [ ] <50ms storage write time
- [ ] <100ms query time
- [ ] <2s visualization load
- [ ] <50MB memory usage

### User Experience
- [ ] Real data in all visualizations
- [ ] Smooth animations
- [ ] Clear empty states
- [ ] Helpful error messages
- [ ] Export working

### Business Value
- [ ] Cost tracking accurate
- [ ] Performance insights actionable
- [ ] Usage patterns visible
- [ ] Model comparison meaningful

---

## Future Enhancements (v2.1+)

### Cloud Sync (v2.1)
- Optional backend (Firebase/Supabase)
- Cross-device synchronization
- Team collaboration

### Advanced Analytics (v2.2)
- A/B testing framework
- Anomaly detection
- Automated insights
- Custom metrics

### Integrations (v2.3)
- Slack/Discord webhooks
- CSV import
- API for external tools
- Scheduled reports

### Enterprise Features (v2.4)
- Multi-user support
- Role-based access
- Audit logging
- SSO integration

---

## Resources & References

### Documentation
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [LocalStorage Guide](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)

### Libraries
- [Dexie.js](https://dexie.org/) - IndexedDB wrapper (optional)
- [date-fns](https://date-fns.org/) - Date utilities
- [Recharts](https://recharts.org/) - Chart library (already used)

### Pricing References
- [OpenAI Pricing](https://openai.com/pricing)
- [Anthropic Pricing](https://www.anthropic.com/api#pricing)
- [DeepSeek API](https://platform.deepseek.com/api-docs/pricing)
- [Perplexity API](https://docs.perplexity.ai/pricing)

---

## Questions & Support

For questions about implementation:
1. Check this plan document
2. Review the code examples
3. Test in development first
4. Consider edge cases

Ready to implement? Start with Phase 1: Foundation Infrastructure!