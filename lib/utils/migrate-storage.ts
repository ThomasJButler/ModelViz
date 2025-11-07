/**
 * @file migrate-storage.ts
 * @author Tom Butler
 * @date 2025-11-07
 * @description Utility to migrate localStorage data from old AI-Comparison-Showcase keys to new ModelViz keys
 */

/**
 * Migrates localStorage data from old keys to new keys
 * This ensures existing users don't lose their API configurations and cached data
 */
export function migrateLocalStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    // Migrate API configuration
    const oldApiConfig = localStorage.getItem('ai_comparison_api_config');
    if (oldApiConfig && !localStorage.getItem('modelviz_api_config')) {
      localStorage.setItem('modelviz_api_config', oldApiConfig);
      // Keep old key for one version for backward compatibility
      console.log('[Migration] Migrated API config to new key: modelviz_api_config');
    }

    // Migrate cache entries
    const keysToMigrate: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('ai-showcase:')) {
        keysToMigrate.push(key);
      }
    }

    // Perform migration
    keysToMigrate.forEach(oldKey => {
      const value = localStorage.getItem(oldKey);
      if (value) {
        const newKey = oldKey.replace('ai-showcase:', 'modelviz:');
        if (!localStorage.getItem(newKey)) {
          localStorage.setItem(newKey, value);
          console.log(`[Migration] Migrated cache key: ${oldKey} -> ${newKey}`);
        }
        // Keep old key for one version for backward compatibility
      }
    });

    // Set migration flag
    if (keysToMigrate.length > 0 || oldApiConfig) {
      localStorage.setItem('modelviz_migration_v2_complete', 'true');
      console.log('[Migration] Storage migration completed successfully');
    }

  } catch (error) {
    console.error('[Migration] Error during localStorage migration:', error);
  }
}

/**
 * Cleans up old localStorage keys after migration
 * Call this in v2.1 to remove backward compatibility
 */
export function cleanupOldKeys(): void {
  if (typeof window === 'undefined') return;

  try {
    // Only cleanup if migration was previously completed
    if (!localStorage.getItem('modelviz_migration_v2_complete')) {
      return;
    }

    // Remove old API config key
    localStorage.removeItem('ai_comparison_api_config');

    // Remove old cache keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('ai-showcase:')) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`[Cleanup] Removed old key: ${key}`);
    });

    if (keysToRemove.length > 0) {
      console.log('[Cleanup] Old storage keys cleaned up successfully');
    }

  } catch (error) {
    console.error('[Cleanup] Error during localStorage cleanup:', error);
  }
}