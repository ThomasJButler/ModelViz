/**
 * @file blendedModelsStorage.ts
 * @description Storage layer for blended model configurations
 * @author Assistant
 * @date 2024-11-23
 */

import { BlendedModelConfig, BlendPerformanceStats } from '@/lib/types/modelBuilder';

const STORAGE_KEY = 'modelviz-blended-models';
const STATS_KEY_PREFIX = 'blend-stats-';
const MAX_BLENDS = 50; // Maximum number of saved blends

export class BlendedModelsStorage {
  private static instance: BlendedModelsStorage | null = null;

  private constructor() {}

  static getInstance(): BlendedModelsStorage {
    if (!BlendedModelsStorage.instance) {
      BlendedModelsStorage.instance = new BlendedModelsStorage();
    }
    return BlendedModelsStorage.instance;
  }

  /**
   * Save a blended model configuration
   */
  async saveBlend(config: BlendedModelConfig): Promise<void> {
    try {
      const blends = await this.getAllBlends();

      // Check if blend already exists
      const existingIndex = blends.findIndex(b => b.id === config.id);

      if (existingIndex >= 0) {
        // Update existing blend
        blends[existingIndex] = {
          ...config,
          metadata: {
            ...config.metadata,
            lastUsed: new Date(),
          },
        };
      } else {
        // Add new blend
        blends.push({
          ...config,
          metadata: {
            ...config.metadata,
            created: new Date(),
            totalCalls: 0,
          },
        });

        // Enforce maximum blend limit
        if (blends.length > MAX_BLENDS) {
          // Remove oldest unused blends
          blends.sort((a, b) => {
            const aTime = a.metadata.lastUsed?.getTime() || a.metadata.created.getTime();
            const bTime = b.metadata.lastUsed?.getTime() || b.metadata.created.getTime();
            return bTime - aTime;
          });
          blends.splice(MAX_BLENDS);
        }
      }

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(blends));

      // Dispatch event for UI updates
      window.dispatchEvent(new CustomEvent('blends-updated', {
        detail: { action: 'save', blendId: config.id }
      }));

      console.log(`[BlendedModelsStorage] Saved blend: ${config.name}`);
    } catch (error) {
      console.error('[BlendedModelsStorage] Failed to save blend:', error);
      throw error;
    }
  }

  /**
   * Load a specific blended model configuration
   */
  async getBlend(id: string): Promise<BlendedModelConfig | null> {
    try {
      const blends = await this.getAllBlends();
      const blend = blends.find(b => b.id === id);

      if (blend) {
        // Convert date strings back to Date objects
        return {
          ...blend,
          metadata: {
            ...blend.metadata,
            created: new Date(blend.metadata.created),
            lastUsed: blend.metadata.lastUsed ? new Date(blend.metadata.lastUsed) : undefined,
          },
        };
      }

      return null;
    } catch (error) {
      console.error(`[BlendedModelsStorage] Failed to load blend ${id}:`, error);
      return null;
    }
  }

  /**
   * Get all saved blended model configurations
   */
  async getAllBlends(): Promise<BlendedModelConfig[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        return [];
      }

      const blends = JSON.parse(stored);

      // Convert date strings back to Date objects
      return blends.map((blend: any) => ({
        ...blend,
        metadata: {
          ...blend.metadata,
          created: new Date(blend.metadata.created),
          lastUsed: blend.metadata.lastUsed ? new Date(blend.metadata.lastUsed) : undefined,
        },
      }));
    } catch (error) {
      console.error('[BlendedModelsStorage] Failed to load blends:', error);
      return [];
    }
  }

  /**
   * Delete a blended model configuration
   */
  async deleteBlend(id: string): Promise<boolean> {
    try {
      const blends = await this.getAllBlends();
      const filteredBlends = blends.filter(b => b.id !== id);

      if (filteredBlends.length < blends.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredBlends));

        // Also delete associated stats
        localStorage.removeItem(`${STATS_KEY_PREFIX}${id}`);

        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('blends-updated', {
          detail: { action: 'delete', blendId: id }
        }));

        console.log(`[BlendedModelsStorage] Deleted blend: ${id}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`[BlendedModelsStorage] Failed to delete blend ${id}:`, error);
      return false;
    }
  }

  /**
   * Update blend usage statistics
   */
  async updateBlendUsage(id: string): Promise<void> {
    try {
      const blends = await this.getAllBlends();
      const blend = blends.find(b => b.id === id);

      if (blend) {
        blend.metadata.lastUsed = new Date();
        blend.metadata.totalCalls += 1;

        // Update stats from performance metrics
        const stats = await this.getBlendStats(id);
        if (stats) {
          blend.metadata.avgLatency = stats.avgLatency;
          blend.metadata.avgCost = stats.avgCost;
        }

        await this.saveBlend(blend);
      }
    } catch (error) {
      console.error(`[BlendedModelsStorage] Failed to update usage for ${id}:`, error);
    }
  }

  /**
   * Get performance statistics for a blend
   */
  async getBlendStats(id: string): Promise<BlendPerformanceStats | null> {
    try {
      const statsKey = `${STATS_KEY_PREFIX}${id}`;
      const stored = localStorage.getItem(statsKey);

      if (!stored) {
        return null;
      }

      const stats = JSON.parse(stored);
      return {
        ...stats,
        lastUpdated: new Date(stats.lastUpdated),
      };
    } catch (error) {
      console.error(`[BlendedModelsStorage] Failed to load stats for ${id}:`, error);
      return null;
    }
  }

  /**
   * Export blend configurations
   */
  async exportBlends(ids?: string[]): Promise<string> {
    try {
      const allBlends = await this.getAllBlends();
      const blendsToExport = ids
        ? allBlends.filter(b => ids.includes(b.id))
        : allBlends;

      return JSON.stringify({
        version: '1.0',
        exported: new Date().toISOString(),
        blends: blendsToExport,
      }, null, 2);
    } catch (error) {
      console.error('[BlendedModelsStorage] Failed to export blends:', error);
      throw error;
    }
  }

  /**
   * Import blend configurations
   */
  async importBlends(jsonData: string): Promise<number> {
    try {
      const data = JSON.parse(jsonData);

      if (!data.blends || !Array.isArray(data.blends)) {
        throw new Error('Invalid import format');
      }

      const currentBlends = await this.getAllBlends();
      const blendMap = new Map(currentBlends.map(b => [b.id, b]));

      let importedCount = 0;

      for (const blend of data.blends) {
        // Generate new ID if blend already exists
        if (blendMap.has(blend.id)) {
          blend.id = `${blend.id}-imported-${Date.now()}`;
        }

        await this.saveBlend(blend);
        importedCount++;
      }

      return importedCount;
    } catch (error) {
      console.error('[BlendedModelsStorage] Failed to import blends:', error);
      throw error;
    }
  }

  /**
   * Search blends by name or description
   */
  async searchBlends(query: string): Promise<BlendedModelConfig[]> {
    try {
      const blends = await this.getAllBlends();
      const lowerQuery = query.toLowerCase();

      return blends.filter(blend =>
        blend.name.toLowerCase().includes(lowerQuery) ||
        blend.description?.toLowerCase().includes(lowerQuery) ||
        blend.models.some(m => m.modelId.toLowerCase().includes(lowerQuery))
      );
    } catch (error) {
      console.error('[BlendedModelsStorage] Failed to search blends:', error);
      return [];
    }
  }

  /**
   * Get recently used blends
   */
  async getRecentBlends(limit: number = 5): Promise<BlendedModelConfig[]> {
    try {
      const blends = await this.getAllBlends();

      return blends
        .filter(b => b.metadata.lastUsed)
        .sort((a, b) => {
          const aTime = a.metadata.lastUsed?.getTime() || 0;
          const bTime = b.metadata.lastUsed?.getTime() || 0;
          return bTime - aTime;
        })
        .slice(0, limit);
    } catch (error) {
      console.error('[BlendedModelsStorage] Failed to get recent blends:', error);
      return [];
    }
  }

  /**
   * Clear all blend data
   */
  async clearAll(): Promise<void> {
    try {
      // Remove all blends
      localStorage.removeItem(STORAGE_KEY);

      // Remove all stats
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(STATS_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });

      // Dispatch event for UI updates
      window.dispatchEvent(new CustomEvent('blends-updated', {
        detail: { action: 'clear' }
      }));

      console.log('[BlendedModelsStorage] Cleared all blend data');
    } catch (error) {
      console.error('[BlendedModelsStorage] Failed to clear data:', error);
      throw error;
    }
  }
}