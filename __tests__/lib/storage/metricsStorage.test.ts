import {
  LocalStorageAdapter,
  IndexedDBAdapter,
  MetricsStorageManager
} from '@/lib/storage/metricsStorage';
import type { ApiCallMetric } from '@/lib/types/metrics';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      // Simulate QuotaExceededError for very large values
      if (value.length > 5000000) {
        const error = new DOMException('QuotaExceededError', 'QuotaExceededError');
        throw error;
      }
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock IndexedDB
class FakeIDBDatabase {
  objectStoreNames: DOMStringList = {
    contains: jest.fn((name: string) => false),
    item: jest.fn(),
    length: 0,
    [Symbol.iterator]: jest.fn()
  } as DOMStringList;

  createObjectStore = jest.fn((name: string, options?: any) => {
    return {
      createIndex: jest.fn(),
      add: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      get: jest.fn(),
      getAll: jest.fn(),
      count: jest.fn(),
      openCursor: jest.fn()
    };
  });

  transaction = jest.fn((storeNames: string | string[], mode?: IDBTransactionMode) => {
    return {
      objectStore: jest.fn((name: string) => {
        return {
          put: jest.fn(() => ({ onsuccess: null, onerror: null })),
          get: jest.fn(() => ({ onsuccess: null, onerror: null })),
          getAll: jest.fn(() => ({ onsuccess: null, onerror: null })),
          count: jest.fn(() => ({ onsuccess: null, onerror: null })),
          clear: jest.fn(() => ({ onsuccess: null, onerror: null })),
          index: jest.fn((indexName: string) => ({
            getAll: jest.fn(() => ({ onsuccess: null, onerror: null })),
            openCursor: jest.fn(() => ({ onsuccess: null, onerror: null }))
          }))
        };
      })
    };
  });

  close = jest.fn();
}

const createMockMetric = (overrides?: Partial<ApiCallMetric>): ApiCallMetric => ({
  id: Math.random().toString(36).substring(7),
  timestamp: Date.now(),
  provider: 'OpenAI',
  model: 'gpt-4',
  inputFormat: 'text',
  latency: 150,
  tokensUsed: 100,
  promptTokens: 60,
  completionTokens: 40,
  status: 'success',
  estimatedCost: 0.003,
  promptLength: 240,
  responseLength: 160,
  confidence: 0.95,
  ...overrides
});

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    adapter = new LocalStorageAdapter();
  });

  describe('save', () => {
    it('saves metrics to localStorage', async () => {
      const metrics = [createMockMetric(), createMockMetric()];

      await adapter.save(metrics);

      expect(localStorageMock.setItem).toHaveBeenCalled();
      const savedKey = (localStorageMock.setItem as jest.Mock).mock.calls[0][0];
      expect(savedKey).toContain('modelviz_metrics');
    });

    it('limits saved metrics to MAX_ENTRIES (100)', async () => {
      const metrics = Array.from({ length: 150 }, () => createMockMetric());

      await adapter.save(metrics);

      const savedData = (localStorageMock.setItem as jest.Mock).mock.calls[0][1];
      const parsed = JSON.parse(savedData);
      expect(parsed.length).toBe(100);
    });

    it('keeps most recent metrics when limiting', async () => {
      const metrics = Array.from({ length: 150 }, (_, i) =>
        createMockMetric({ timestamp: i })
      );

      await adapter.save(metrics);

      const savedData = (localStorageMock.setItem as jest.Mock).mock.calls[0][1];
      const parsed = JSON.parse(savedData);

      // Should keep last 100
      expect(parsed[0].timestamp).toBe(50);
      expect(parsed[99].timestamp).toBe(149);
    });

    it('creates a backup copy', async () => {
      const metrics = [createMockMetric()];

      await adapter.save(metrics);

      const calls = (localStorageMock.setItem as jest.Mock).mock.calls;
      const backupCall = calls.find(call => call[0].includes('backup'));
      expect(backupCall).toBeDefined();
    });

    it('compresses large data', async () => {
      // Create many metrics to exceed 2MB threshold
      const largeMetrics = Array.from({ length: 100 }, () => ({
        ...createMockMetric(),
        // Add a large string to simulate big data
        largeField: 'x'.repeat(25000)
      } as ApiCallMetric));

      await adapter.save(largeMetrics);

      // Should still save successfully (compression handles it)
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('handles QuotaExceededError gracefully', async () => {
      // Create metrics that will trigger QuotaExceededError
      const hugeMetrics = Array.from({ length: 100 }, () => ({
        ...createMockMetric(),
        largeField: 'x'.repeat(100000)
      } as ApiCallMetric));

      // Should not throw
      await expect(adapter.save(hugeMetrics)).resolves.not.toThrow();

      // Should save minimal data (last 10)
      const lastCall = (localStorageMock.setItem as jest.Mock).mock.calls[
        (localStorageMock.setItem as jest.Mock).mock.calls.length - 1
      ];
      const parsed = JSON.parse(lastCall[1]);
      expect(parsed.length).toBeLessThanOrEqual(10);
    });
  });

  describe('load', () => {
    it('loads metrics from localStorage', async () => {
      const metrics = [createMockMetric(), createMockMetric()];
      (localStorageMock.getItem as jest.Mock).mockReturnValue(JSON.stringify(metrics));

      const loaded = await adapter.load();

      expect(loaded).toHaveLength(2);
      expect(loaded[0]).toMatchObject({
        provider: 'OpenAI',
        model: 'gpt-4'
      });
    });

    it('returns empty array when no data exists', async () => {
      (localStorageMock.getItem as jest.Mock).mockReturnValue(null);

      const loaded = await adapter.load();

      expect(loaded).toEqual([]);
    });

    it('falls back to backup on corrupted main data', async () => {
      const metrics = [createMockMetric()];

      (localStorageMock.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key.includes('backup')) {
          return JSON.stringify(metrics);
        }
        return null;
      });

      const loaded = await adapter.load();

      expect(loaded).toHaveLength(1);
    });

    it('handles corrupted JSON gracefully', async () => {
      (localStorageMock.getItem as jest.Mock).mockReturnValue('invalid-json{');

      const loaded = await adapter.load();

      expect(loaded).toEqual([]);
    });
  });

  describe('clear', () => {
    it('removes main and backup keys', async () => {
      await adapter.clear();

      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(2);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        expect.stringContaining('modelviz_metrics_recent')
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        expect.stringContaining('modelviz_metrics_backup')
      );
    });
  });
});

describe('IndexedDBAdapter', () => {
  let adapter: IndexedDBAdapter;
  let mockDB: FakeIDBDatabase;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new IndexedDBAdapter();
    mockDB = new FakeIDBDatabase();

    // Mock indexedDB.open
    global.indexedDB = {
      open: jest.fn(() => {
        const request = {
          onsuccess: null as any,
          onerror: null as any,
          onupgradeneeded: null as any,
          result: mockDB
        };

        // Simulate successful open
        setTimeout(() => {
          if (request.onsuccess) {
            request.onsuccess();
          }
        }, 0);

        return request as any;
      })
    } as any;
  });

  describe('init', () => {
    it('initializes IndexedDB connection', async () => {
      await adapter.init();

      expect(global.indexedDB.open).toHaveBeenCalledWith('modelviz_metrics', 1);
    });

    it('only initializes once', async () => {
      await adapter.init();
      await adapter.init();
      await adapter.init();

      expect(global.indexedDB.open).toHaveBeenCalledTimes(1);
    });

    it('creates object store on upgrade', async () => {
      const upgradeRequest = {
        onsuccess: null as any,
        onerror: null as any,
        onupgradeneeded: null as any,
        result: mockDB
      };

      (global.indexedDB.open as jest.Mock).mockReturnValue(upgradeRequest);

      const initPromise = adapter.init();

      // Trigger upgrade event
      if (upgradeRequest.onupgradeneeded) {
        upgradeRequest.onupgradeneeded({ target: upgradeRequest } as any);
      }

      // Trigger success event
      if (upgradeRequest.onsuccess) {
        upgradeRequest.onsuccess();
      }

      await initPromise;

      expect(mockDB.createObjectStore).toHaveBeenCalledWith('metrics', { keyPath: 'id' });
    });
  });

  describe('saveMetric', () => {
    it('saves a metric to IndexedDB', async () => {
      await adapter.init();

      const metric = createMockMetric();
      const putRequest = { onsuccess: null as any, onerror: null as any };

      const mockStore = {
        put: jest.fn(() => {
          // Auto-trigger success after event loop
          setTimeout(() => {
            if (putRequest.onsuccess) {
              putRequest.onsuccess();
            }
          }, 0);
          return putRequest;
        })
      };

      (mockDB.transaction as jest.Mock).mockReturnValue({
        objectStore: jest.fn(() => mockStore)
      });

      await adapter.saveMetric(metric);

      expect(mockStore.put).toHaveBeenCalledWith(metric);
    });

    it('rejects if IndexedDB initialization fails', async () => {
      // Create adapter that will fail to initialize
      const failingAdapter = new IndexedDBAdapter();
      const metric = createMockMetric();

      // Override global indexedDB to simulate failure
      const originalIndexedDB = global.indexedDB;
      global.indexedDB = {
        open: jest.fn(() => {
          const request = {
            onsuccess: null as any,
            onerror: null as any,
            onupgradeneeded: null as any,
            error: new Error('IndexedDB open failed'),
            result: null
          };

          // Trigger error immediately
          setTimeout(() => {
            if (request.onerror) {
              request.onerror({ target: request } as any);
            }
          }, 0);

          return request as any;
        })
      } as any;

      // Should reject because init fails
      await expect(failingAdapter.saveMetric(metric)).rejects.toThrow();

      // Restore original mock
      global.indexedDB = originalIndexedDB;
    });
  });

  describe('saveMetricsBatch', () => {
    it('saves multiple metrics in batch', async () => {
      await adapter.init();

      const metrics = [createMockMetric(), createMockMetric(), createMockMetric()];
      const requests = metrics.map(() => ({
        onsuccess: null as any,
        onerror: null as any
      }));

      let requestIndex = 0;
      const mockStore = {
        put: jest.fn(() => {
          const req = requests[requestIndex++];
          // Auto-trigger success after event loop
          setTimeout(() => {
            if (req.onsuccess) {
              req.onsuccess();
            }
          }, 0);
          return req;
        })
      };

      (mockDB.transaction as jest.Mock).mockReturnValue({
        objectStore: jest.fn(() => mockStore)
      });

      await adapter.saveMetricsBatch(metrics);

      expect(mockStore.put).toHaveBeenCalledTimes(3);
    });

    it('resolves immediately for empty array', async () => {
      await adapter.init();

      await expect(adapter.saveMetricsBatch([])).resolves.not.toThrow();
    });
  });

  describe('getMetricsInRange', () => {
    it('queries metrics by timestamp range', async () => {
      await adapter.init();

      const start = Date.now() - 86400000; // 1 day ago
      const end = Date.now();

      const getAllRequest = {
        onsuccess: null as any,
        onerror: null as any,
        result: [createMockMetric(), createMockMetric()]
      };

      const mockIndex = {
        getAll: jest.fn(() => {
          // Auto-trigger success after event loop
          setTimeout(() => {
            if (getAllRequest.onsuccess) {
              getAllRequest.onsuccess();
            }
          }, 0);
          return getAllRequest;
        })
      };

      const mockStore = {
        index: jest.fn(() => mockIndex)
      };

      (mockDB.transaction as jest.Mock).mockReturnValue({
        objectStore: jest.fn(() => mockStore)
      });

      const results = await adapter.getMetricsInRange(start, end);

      expect(mockStore.index).toHaveBeenCalledWith('timestamp');
      expect(results).toHaveLength(2);
    });
  });

  describe('getMetricsByProvider', () => {
    it('queries metrics by provider', async () => {
      await adapter.init();

      const getAllRequest = {
        onsuccess: null as any,
        onerror: null as any,
        result: [createMockMetric({ provider: 'OpenAI' })]
      };

      const mockIndex = {
        getAll: jest.fn(() => {
          // Auto-trigger success after event loop
          setTimeout(() => {
            if (getAllRequest.onsuccess) {
              getAllRequest.onsuccess();
            }
          }, 0);
          return getAllRequest;
        })
      };

      const mockStore = {
        index: jest.fn(() => mockIndex)
      };

      (mockDB.transaction as jest.Mock).mockReturnValue({
        objectStore: jest.fn(() => mockStore)
      });

      const results = await adapter.getMetricsByProvider('OpenAI');

      expect(mockStore.index).toHaveBeenCalledWith('provider');
      expect(results).toHaveLength(1);
    });

    it('respects limit parameter', async () => {
      await adapter.init();

      const getAllRequest = {
        onsuccess: null as any,
        onerror: null as any,
        result: []
      };

      const mockIndex = {
        getAll: jest.fn(() => {
          // Auto-trigger success after event loop
          setTimeout(() => {
            if (getAllRequest.onsuccess) {
              getAllRequest.onsuccess();
            }
          }, 0);
          return getAllRequest;
        })
      };

      const mockStore = {
        index: jest.fn(() => mockIndex)
      };

      (mockDB.transaction as jest.Mock).mockReturnValue({
        objectStore: jest.fn(() => mockStore)
      });

      await adapter.getMetricsByProvider('OpenAI', 10);

      expect(mockIndex.getAll).toHaveBeenCalledWith('OpenAI', 10);
    });
  });

  describe('getAllMetrics', () => {
    it('retrieves all metrics', async () => {
      await adapter.init();

      const getAllRequest = {
        onsuccess: null as any,
        onerror: null as any,
        result: [createMockMetric(), createMockMetric(), createMockMetric()]
      };

      const mockStore = {
        getAll: jest.fn(() => {
          // Auto-trigger success after event loop
          setTimeout(() => {
            if (getAllRequest.onsuccess) {
              getAllRequest.onsuccess();
            }
          }, 0);
          return getAllRequest;
        })
      };

      (mockDB.transaction as jest.Mock).mockReturnValue({
        objectStore: jest.fn(() => mockStore)
      });

      const results = await adapter.getAllMetrics();

      expect(results).toHaveLength(3);
    });
  });

  describe('getCount', () => {
    it('returns metric count', async () => {
      await adapter.init();

      const countRequest = {
        onsuccess: null as any,
        onerror: null as any,
        result: 42
      };

      const mockStore = {
        count: jest.fn(() => {
          // Auto-trigger success after event loop
          setTimeout(() => {
            if (countRequest.onsuccess) {
              countRequest.onsuccess();
            }
          }, 0);
          return countRequest;
        })
      };

      (mockDB.transaction as jest.Mock).mockReturnValue({
        objectStore: jest.fn(() => mockStore)
      });

      const count = await adapter.getCount();

      expect(count).toBe(42);
    });
  });

  describe('cleanupOldMetrics', () => {
    it('deletes metrics older than threshold', async () => {
      await adapter.init();

      const olderThan = Date.now() - 90 * 24 * 60 * 60 * 1000; // 90 days ago
      let deletedCount = 0;

      const cursorRequest = {
        onsuccess: null as any,
        onerror: null as any,
        result: null
      };

      // Simulate cursor with 3 items
      let cursorCallCount = 0;
      const mockCursors = [
        { delete: jest.fn(() => deletedCount++), continue: jest.fn() },
        { delete: jest.fn(() => deletedCount++), continue: jest.fn() },
        { delete: jest.fn(() => deletedCount++), continue: jest.fn() },
        null // End of cursor
      ];

      cursorRequest.result = mockCursors[cursorCallCount];

      const mockIndex = {
        openCursor: jest.fn(() => {
          const req = {
            onsuccess: (event: any) => {
              cursorCallCount++;
              cursorRequest.result = mockCursors[cursorCallCount];
            },
            onerror: null as any,
            result: mockCursors[0]
          };

          // Auto-advance cursor
          setTimeout(() => {
            if (req.onsuccess) {
              for (let i = 0; i < mockCursors.length; i++) {
                req.result = mockCursors[i];
                req.onsuccess({ target: req });
                if (!mockCursors[i]) break;
                mockCursors[i]?.continue();
              }
            }
          }, 0);

          return req;
        })
      };

      const mockStore = {
        index: jest.fn(() => mockIndex)
      };

      (mockDB.transaction as jest.Mock).mockReturnValue({
        objectStore: jest.fn(() => mockStore)
      });

      const count = await adapter.cleanupOldMetrics(olderThan);

      expect(count).toBe(3);
    });
  });

  describe('clear', () => {
    it('clears all data from object store', async () => {
      await adapter.init();

      const clearRequest = {
        onsuccess: null as any,
        onerror: null as any
      };

      const mockStore = {
        clear: jest.fn(() => {
          // Auto-trigger success after event loop
          setTimeout(() => {
            if (clearRequest.onsuccess) {
              clearRequest.onsuccess();
            }
          }, 0);
          return clearRequest;
        })
      };

      (mockDB.transaction as jest.Mock).mockReturnValue({
        objectStore: jest.fn(() => mockStore)
      });

      await adapter.clear();

      expect(mockStore.clear).toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('closes database connection', async () => {
      await adapter.init();

      adapter.close();

      expect(mockDB.close).toHaveBeenCalled();
    });

    it('handles closing when not initialized', () => {
      expect(() => adapter.close()).not.toThrow();
    });
  });
});

describe('MetricsStorageManager', () => {
  let manager: MetricsStorageManager;
  let mockDB: FakeIDBDatabase;

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    manager = new MetricsStorageManager();
    mockDB = new FakeIDBDatabase();

    // Mock indexedDB.open
    global.indexedDB = {
      open: jest.fn(() => {
        const request = {
          onsuccess: null as any,
          onerror: null as any,
          onupgradeneeded: null as any,
          result: mockDB
        };

        setTimeout(() => {
          if (request.onsuccess) {
            request.onsuccess();
          }
        }, 0);

        return request as any;
      })
    } as any;
  });

  describe('init', () => {
    it('initializes storage systems', async () => {
      await manager.init();

      expect(global.indexedDB.open).toHaveBeenCalled();
    });
  });

  describe('saveMetric', () => {
    it('saves to both LocalStorage and IndexedDB', async () => {
      await manager.init();

      const metric = createMockMetric();

      // Mock IndexedDB save
      const putRequest = { onsuccess: null as any, onerror: null as any };
      const mockStore = {
        put: jest.fn(() => {
          // Auto-trigger success after event loop
          setTimeout(() => {
            if (putRequest.onsuccess) {
              putRequest.onsuccess();
            }
          }, 0);
          return putRequest;
        })
      };
      (mockDB.transaction as jest.Mock).mockReturnValue({
        objectStore: jest.fn(() => mockStore)
      });

      await manager.saveMetric(metric);

      // Verify IndexedDB save
      expect(mockStore.put).toHaveBeenCalledWith(metric);

      // Verify LocalStorage save
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('getRecentMetrics', () => {
    it('retrieves recent metrics from LocalStorage', async () => {
      const metrics = Array.from({ length: 50 }, () => createMockMetric());
      (localStorageMock.getItem as jest.Mock).mockReturnValue(JSON.stringify(metrics));

      const recent = await manager.getRecentMetrics(20);

      expect(recent).toHaveLength(20);
    });

    it('returns all metrics if fewer than limit', async () => {
      const metrics = [createMockMetric(), createMockMetric()];
      (localStorageMock.getItem as jest.Mock).mockReturnValue(JSON.stringify(metrics));

      const recent = await manager.getRecentMetrics(100);

      expect(recent).toHaveLength(2);
    });
  });

  describe('getMetricsInRange', () => {
    it('retrieves metrics from IndexedDB by range', async () => {
      await manager.init();

      const start = Date.now() - 86400000;
      const end = Date.now();

      const getAllRequest = {
        onsuccess: null as any,
        onerror: null as any,
        result: [createMockMetric()]
      };

      const mockIndex = {
        getAll: jest.fn(() => {
          // Auto-trigger success after event loop
          setTimeout(() => {
            if (getAllRequest.onsuccess) {
              getAllRequest.onsuccess();
            }
          }, 0);
          return getAllRequest;
        })
      };

      const mockStore = {
        index: jest.fn(() => mockIndex)
      };

      (mockDB.transaction as jest.Mock).mockReturnValue({
        objectStore: jest.fn(() => mockStore)
      });

      const results = await manager.getMetricsInRange(start, end);

      expect(results).toHaveLength(1);
    });
  });

  describe('getAllMetrics', () => {
    it('retrieves all metrics from IndexedDB', async () => {
      await manager.init();

      const getAllRequest = {
        onsuccess: null as any,
        onerror: null as any,
        result: [createMockMetric(), createMockMetric()]
      };

      const mockStore = {
        getAll: jest.fn(() => {
          // Auto-trigger success after event loop
          setTimeout(() => {
            if (getAllRequest.onsuccess) {
              getAllRequest.onsuccess();
            }
          }, 0);
          return getAllRequest;
        })
      };

      (mockDB.transaction as jest.Mock).mockReturnValue({
        objectStore: jest.fn(() => mockStore)
      });

      const results = await manager.getAllMetrics();

      expect(results).toHaveLength(2);
    });
  });

  describe('cleanupOldData', () => {
    it('removes metrics older than 90 days', async () => {
      await manager.init();

      const cursorRequest = {
        onsuccess: null as any,
        onerror: null as any,
        result: null
      };

      const mockIndex = {
        openCursor: jest.fn(() => {
          const req = {
            onsuccess: null as any,
            onerror: null as any,
            result: null
          };

          setTimeout(() => {
            if (req.onsuccess) {
              req.onsuccess({ target: req });
            }
          }, 0);

          return req;
        })
      };

      const mockStore = {
        index: jest.fn(() => mockIndex)
      };

      (mockDB.transaction as jest.Mock).mockReturnValue({
        objectStore: jest.fn(() => mockStore)
      });

      await manager.cleanupOldData();

      expect(mockStore.index).toHaveBeenCalledWith('timestamp');
    });
  });

  describe('clearAll', () => {
    it('clears both LocalStorage and IndexedDB', async () => {
      await manager.init();

      const clearRequest = {
        onsuccess: null as any,
        onerror: null as any
      };

      const mockStore = {
        clear: jest.fn(() => {
          // Auto-trigger success after event loop
          setTimeout(() => {
            if (clearRequest.onsuccess) {
              clearRequest.onsuccess();
            }
          }, 0);
          return clearRequest;
        })
      };

      (mockDB.transaction as jest.Mock).mockReturnValue({
        objectStore: jest.fn(() => mockStore)
      });

      await manager.clearAll();

      // Verify both were cleared
      expect(localStorageMock.removeItem).toHaveBeenCalled();
      expect(mockStore.clear).toHaveBeenCalled();
    });
  });
});
