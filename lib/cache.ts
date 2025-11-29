/**
 * Caching utilities for API responses and expensive computations
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private timers = new Map<string, NodeJS.Timeout>();

  set<T>(key: string, data: T, ttl: number = 60000): void {
    // Clear existing timer if any
    this.clearTimer(key);

    // Set new cache entry
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    // Set cleanup timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl);
    this.timers.set(key, timer);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry is still valid
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.cache.has(key) && this.get(key) !== null;
  }

  delete(key: string): void {
    this.clearTimer(key);
    this.cache.delete(key);
  }

  clear(): void {
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.cache.clear();
  }

  private clearTimer(key: string): void {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }

  size(): number {
    return this.cache.size;
  }
}

// Create singleton instance
export const apiCache = new MemoryCache();

// Cache decorator for async functions
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    ttl?: number;
    keyGenerator?: (...args: Parameters<T>) => string;
  } = {}
): T {
  const { ttl = 60000, keyGenerator = (...args) => JSON.stringify(args) } = options;

  return (async (...args: Parameters<T>) => {
    const key = `${fn.name}:${keyGenerator(...args)}`;
    
    // Check cache first
    const cached = apiCache.get(key);
    if (cached !== null) {
      console.log(`[Cache] Hit for ${fn.name}`);
      return cached;
    }

    // Execute function and cache result
    console.log(`[Cache] Miss for ${fn.name}`);
    const result = await fn(...args);
    apiCache.set(key, result, ttl);
    
    return result;
  }) as T;
}

// Specific cache strategies
export const CacheStrategies = {
  // Short-lived cache for frequently changing data
  SHORT: 30000, // 30 seconds
  
  // Medium cache for moderately changing data
  MEDIUM: 300000, // 5 minutes
  
  // Long cache for rarely changing data
  LONG: 3600000, // 1 hour
  
  // Session cache
  SESSION: 86400000, // 24 hours
};

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>();

export function dedupRequest<T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> {
  // Check if request is already pending
  const pending = pendingRequests.get(key);
  if (pending) {
    console.log(`[Dedup] Reusing pending request for ${key}`);
    return pending;
  }

  // Create new request
  const request = requestFn()
    .then(result => {
      pendingRequests.delete(key);
      return result;
    })
    .catch(error => {
      pendingRequests.delete(key);
      throw error;
    });

  pendingRequests.set(key, request);
  return request;
}

// Batch request utility
export class BatchProcessor<T, R> {
  private batch: T[] = [];
  private timeout: NodeJS.Timeout | null = null;
  private promises: Array<{
    item: T;
    resolve: (value: R) => void;
    reject: (error: any) => void;
  }> = [];

  constructor(
    private processBatch: (items: T[]) => Promise<R[]>,
    private options: {
      maxBatchSize?: number;
      maxWaitTime?: number;
    } = {}
  ) {
    this.options.maxBatchSize = options.maxBatchSize || 10;
    this.options.maxWaitTime = options.maxWaitTime || 100;
  }

  async add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.promises.push({ item, resolve, reject });
      this.batch.push(item);

      if (this.batch.length >= this.options.maxBatchSize!) {
        this.flush();
      } else if (!this.timeout) {
        this.timeout = setTimeout(() => this.flush(), this.options.maxWaitTime);
      }
    });
  }

  private async flush() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (this.batch.length === 0) return;

    const currentBatch = this.batch.slice();
    const currentPromises = this.promises.slice();
    this.batch = [];
    this.promises = [];

    try {
      const results = await this.processBatch(currentBatch);
      currentPromises.forEach((promise, index) => {
        promise.resolve(results[index]);
      });
    } catch (error) {
      currentPromises.forEach(promise => {
        promise.reject(error);
      });
    }
  }
}

// LocalStorage cache for persistent data
export class LocalStorageCache {
  private prefix: string;

  constructor(prefix: string = 'modelviz') {
    this.prefix = prefix;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    if (typeof window === 'undefined') return;

    const fullKey = `${this.prefix}:${key}`;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || CacheStrategies.SESSION
    };

    try {
      localStorage.setItem(fullKey, JSON.stringify(entry));
    } catch (e) {
      console.error('[LocalStorage] Failed to save:', e);
      // Clear old entries if storage is full
      this.cleanup();
    }
  }

  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    const fullKey = `${this.prefix}:${key}`;
    try {
      const item = localStorage.getItem(fullKey);
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      
      // Check if entry is expired
      if (Date.now() - entry.timestamp > entry.ttl) {
        localStorage.removeItem(fullKey);
        return null;
      }

      return entry.data;
    } catch (e) {
      console.error('[LocalStorage] Failed to get:', e);
      return null;
    }
  }

  delete(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`${this.prefix}:${key}`);
  }

  cleanup(): void {
    if (typeof window === 'undefined') return;

    const now = Date.now();
    const keysToRemove: string[] = [];

    // Find expired entries
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const entry = JSON.parse(item);
            if (now - entry.timestamp > entry.ttl) {
              keysToRemove.push(key);
            }
          }
        } catch (e) {
          // Invalid entry, remove it
          keysToRemove.push(key);
        }
      }
    }

    // Remove expired entries
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

export const persistentCache = new LocalStorageCache();