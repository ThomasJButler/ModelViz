/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Cached Playground API that adds a performance-optimised caching layer to reduce redundant API calls
 */

import { withCache, CacheStrategies, dedupRequest, apiCache } from '@/lib/cache';
import { generatePlaygroundResponse as originalGeneratePlaygroundResponse, PlaygroundRequest, PlaygroundResponse } from './api';

/**
 * Creates a unique cache key from a playground request
 * @param request - Playground request to generate key for
 * @return Cache key string
 */
const createCacheKey = (request: PlaygroundRequest): string => {
  return `${request.provider}-${request.modelId}-${request.input.substring(0, 100)}-${request.temperature}-${request.maxTokens}`;
};

/**
 * Generates a playground response with caching and deduplication
 * Prevents multiple identical concurrent requests from hitting the API
 */
export const generatePlaygroundResponse = withCache(
  async (request: PlaygroundRequest): Promise<PlaygroundResponse> => {
    // Use deduplication for identical concurrent requests
    const dedupKey = `playground:${createCacheKey(request)}`;
    
    return dedupRequest(dedupKey, () => 
      originalGeneratePlaygroundResponse(request)
    );
  },
  {
    ttl: CacheStrategies.SHORT, // 30 seconds cache for API responses
    keyGenerator: (request) => createCacheKey(request)
  }
);

/**
 * Playground cache management utilities
 */
export const playgroundCache = {
  /**
   * Clears all cached playground responses
   */
  clear: () => {
    apiCache.clear();
  },

  /**
   * Gets the current cache size
   * @return Number of cached entries
   */
  size: () => {
    return apiCache.size();
  },

  /**
   * Preloads common responses into cache to improve initial load times
   * @param requests - Array of requests to preload
   */
  preload: async (requests: PlaygroundRequest[]) => {
    const promises = requests.map(request => 
      generatePlaygroundResponse(request).catch(err => 
        console.error('Preload error:', err)
      )
    );
    
    await Promise.all(promises);
  }
};

// Export everything from original API
export * from './api';