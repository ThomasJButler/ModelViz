/**
 * Storage adapters for persisting metrics data
 * Uses LocalStorage for recent data and IndexedDB for historical data
 */

import { ApiCallMetric } from '@/lib/types/metrics';

/**
 * LocalStorage adapter for quick access to recent metrics
 * Stores last N metrics for fast retrieval
 */
export class LocalStorageAdapter {
  private readonly KEY = 'modelviz_metrics_recent';
  private readonly BACKUP_KEY = 'modelviz_metrics_backup';
  private readonly MAX_ENTRIES = 100;
  private readonly COMPRESSION_THRESHOLD = 50; // Compress if over 50 entries

  /**
   * Save metrics to localStorage with comprehensive error handling
   */
  async save(metrics: ApiCallMetric[]): Promise<void> {
    try {
      const recent = metrics.slice(-this.MAX_ENTRIES);
      const data = JSON.stringify(recent);

      // Check storage quota
      if (data.length > 2000000) { // 2MB limit safety
        // Compress by keeping only essential fields
        const compressed = recent.map(m => ({
          id: m.id,
          timestamp: m.timestamp,
          provider: m.provider,
          model: m.model,
          latency: m.latency,
          tokensUsed: m.tokensUsed,
          status: m.status,
          estimatedCost: m.estimatedCost
        }));
        const compressedData = JSON.stringify(compressed);
        localStorage.setItem(this.KEY, compressedData);
      } else {
        localStorage.setItem(this.KEY, data);
      }

      // Keep a backup of the last successful save
      localStorage.setItem(this.BACKUP_KEY, data);
    } catch (error) {
      console.error('[LocalStorageAdapter] Save failed:', error);
      // Try to save minimal data
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearOldData();
        const minimal = metrics.slice(-10);
        try {
          localStorage.setItem(this.KEY, JSON.stringify(minimal));
        } catch (retryError) {
          throw retryError;
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Load metrics from localStorage
   */
  async load(): Promise<ApiCallMetric[]> {
    try {
      const data = localStorage.getItem(this.KEY);
      if (!data) {
        // Try backup
        const backup = localStorage.getItem(this.BACKUP_KEY);
        return backup ? JSON.parse(backup) : [];
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('LocalStorage load failed:', error);
      return [];
    }
  }

  /**
   * Clear old data to free up space
   */
  private clearOldData(): void {
    // Clear old cache keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('ai-showcase:') || key.startsWith('cache:'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Clear all metrics data
   */
  async clear(): Promise<void> {
    localStorage.removeItem(this.KEY);
    localStorage.removeItem(this.BACKUP_KEY);
  }
}

/**
 * IndexedDB adapter for storing historical metrics
 * Provides unlimited storage for long-term data
 */
export class IndexedDBAdapter {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'modelviz_metrics';
  private readonly STORE_NAME = 'metrics';
  private readonly VERSION = 1;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize IndexedDB connection with error handling
   */
  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      try {
        // Check if IndexedDB is available
        if (!indexedDB) {
          throw new Error('IndexedDB is not available in this browser');
        }

        const request = indexedDB.open(this.DB_NAME, this.VERSION);

        request.onerror = () => {
          const error = request.error || new Error('Unknown IndexedDB error');
          console.error('[IndexedDBAdapter] Initialization failed:', error);
          reject(error);
        };

        request.onsuccess = () => {
          this.db = request.result;
          resolve();
        };

        request.onupgradeneeded = (event) => {
          try {
            const db = (event.target as IDBOpenDBRequest).result;

            // Create metrics store if it doesn't exist
            if (!db.objectStoreNames.contains(this.STORE_NAME)) {
              const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });

              // Create indexes for efficient querying
              store.createIndex('timestamp', 'timestamp', { unique: false });
              store.createIndex('provider', 'provider', { unique: false });
              store.createIndex('model', 'model', { unique: false });
              store.createIndex('status', 'status', { unique: false });
              store.createIndex('provider_timestamp', ['provider', 'timestamp'], { unique: false });
            }
          } catch (error) {
            console.error('[IndexedDBAdapter] Error during upgrade:', error);
            reject(error);
          }
        };
      } catch (error) {
        console.error('[IndexedDBAdapter] Initialization error:', error);
        reject(error);
      }
    });

    return this.initPromise;
  }

  /**
   * Save a single metric to IndexedDB
   */
  async saveMetric(metric: ApiCallMetric): Promise<void> {
    await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        const error = new Error('IndexedDB not initialized');
        console.error('[IndexedDBAdapter] Failed to save metric:', error);
        reject(error);
        return;
      }

      try {
        const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.put(metric);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          const error = request.error || new Error('Unknown IndexedDB error');
          console.error('[IndexedDBAdapter] Failed to save metric:', {
            error,
            metric: { id: metric.id, provider: metric.provider }
          });
          reject(error);
        };

        transaction.onerror = () => {
          const error = transaction.error || new Error('Transaction error');
          console.error('[IndexedDBAdapter] Transaction error:', error);
          reject(error);
        };
      } catch (error) {
        console.error('[IndexedDBAdapter] Error during saveMetric:', error);
        reject(error);
      }
    });
  }

  /**
   * Save multiple metrics in a batch
   */
  async saveMetricsBatch(metrics: ApiCallMetric[]): Promise<void> {
    await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      let savedCount = 0;
      const totalCount = metrics.length;

      metrics.forEach(metric => {
        const request = store.put(metric);
        request.onsuccess = () => {
          savedCount++;
          if (savedCount === totalCount) {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });

      if (metrics.length === 0) {
        resolve();
      }
    });
  }

  /**
   * Get metrics within a timestamp range
   */
  async getMetricsInRange(start: number, end: number): Promise<ApiCallMetric[]> {
    await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('timestamp');
      const range = IDBKeyRange.bound(start, end);
      const request = index.getAll(range);

      request.onsuccess = () => {
        resolve(request.result as ApiCallMetric[]);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get metrics by provider
   */
  async getMetricsByProvider(provider: string, limit?: number): Promise<ApiCallMetric[]> {
    await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('provider');
      const request = limit ? index.getAll(provider, limit) : index.getAll(provider);

      request.onsuccess = () => {
        resolve(request.result as ApiCallMetric[]);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all metrics (use with caution for large datasets)
   */
  async getAllMetrics(): Promise<ApiCallMetric[]> {
    await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as ApiCallMetric[]);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get metrics count
   */
  async getCount(): Promise<number> {
    await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.count();

      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clean up metrics older than specified timestamp
   */
  async cleanupOldMetrics(olderThan: number): Promise<number> {
    await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('timestamp');
      const range = IDBKeyRange.upperBound(olderThan);
      const request = index.openCursor(range);

      let deletedCount = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          resolve(deletedCount);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all data
   */
  async clear(): Promise<void> {
    await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

/**
 * Storage manager that coordinates between LocalStorage and IndexedDB
 */
export class MetricsStorageManager {
  private localAdapter: LocalStorageAdapter;
  private indexedAdapter: IndexedDBAdapter;

  constructor() {
    this.localAdapter = new LocalStorageAdapter();
    this.indexedAdapter = new IndexedDBAdapter();
  }

  /**
   * Initialize storage
   */
  async init(): Promise<void> {
    await this.indexedAdapter.init();
  }

  /**
   * Save a metric to both storage systems
   */
  async saveMetric(metric: ApiCallMetric): Promise<void> {
    // Save to IndexedDB for long-term storage
    try {
      await this.indexedAdapter.saveMetric(metric);
    } catch {
      // Continue to save to LocalStorage as fallback
    }

    // Update recent metrics in LocalStorage
    const recent = await this.localAdapter.load();
    recent.push(metric);
    await this.localAdapter.save(recent);
  }

  /**
   * Get recent metrics from LocalStorage
   */
  async getRecentMetrics(limit: number = 100): Promise<ApiCallMetric[]> {
    const metrics = await this.localAdapter.load();
    return metrics.slice(-limit);
  }

  /**
   * Get metrics in a time range from IndexedDB
   */
  async getMetricsInRange(start: number, end: number): Promise<ApiCallMetric[]> {
    return this.indexedAdapter.getMetricsInRange(start, end);
  }

  /**
   * Get all metrics from IndexedDB
   */
  async getAllMetrics(): Promise<ApiCallMetric[]> {
    return this.indexedAdapter.getAllMetrics();
  }

  /**
   * Clean up old data (90-day retention policy)
   */
  async cleanupOldData(): Promise<void> {
    const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
    await this.indexedAdapter.cleanupOldMetrics(ninetyDaysAgo);
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    await Promise.all([
      this.localAdapter.clear(),
      this.indexedAdapter.clear()
    ]);
  }
}