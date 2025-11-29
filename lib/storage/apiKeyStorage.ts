/**
 * API Key Storage Manager
 * Securely stores and retrieves API keys in browser localStorage
 * Keys are stored per-provider and never sent to any server
 */

export type Provider =
  | 'OpenAI'
  | 'Anthropic'
  | 'Perplexity'
  | 'Google';

interface ApiKeyConfig {
  key: string;
  createdAt: number;
  lastUsed?: number;
}

const STORAGE_PREFIX = 'modelviz_api_key_';
const CONFIG_KEY = 'modelviz_api_config';
const PLAYGROUND_CONFIG_KEY = 'modelviz_playground_config';

/**
 * Simple encryption/obfuscation (Base64)
 * Note: This is NOT cryptographically secure, just prevents casual viewing
 */
function obfuscate(text: string): string {
  try {
    return btoa(text);
  } catch {
    return text;
  }
}

function deobfuscate(text: string): string {
  try {
    return atob(text);
  } catch {
    return text;
  }
}

/**
 * Get storage key for a provider
 */
function getStorageKey(provider: Provider): string {
  return `${STORAGE_PREFIX}${provider.toLowerCase()}`;
}

/**
 * Sync all API keys to playground format
 * This ensures the playground can read keys saved from /settings
 */
function syncToPlaygroundFormat(): void {
  const providers = getConfiguredProviders();
  const config: Record<string, { apiKey: string }> = {};

  providers.forEach(provider => {
    const key = getApiKey(provider);
    if (key) {
      config[provider.toLowerCase()] = { apiKey: key };
    }
  });

  localStorage.setItem(PLAYGROUND_CONFIG_KEY, JSON.stringify(config));
}

/**
 * Save an API key for a specific provider
 */
export function saveApiKey(provider: Provider, apiKey: string): void {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('API key cannot be empty');
  }

  const config: ApiKeyConfig = {
    key: obfuscate(apiKey.trim()),
    createdAt: Date.now(),
  };

  const key = getStorageKey(provider);
  localStorage.setItem(key, JSON.stringify(config));

  // Update the list of configured providers
  updateConfiguredProviders(provider, true);

  // Sync to playground format so playground can read the keys
  syncToPlaygroundFormat();
}

/**
 * Get an API key for a specific provider
 */
export function getApiKey(provider: Provider): string | null {
  const key = getStorageKey(provider);
  const stored = localStorage.getItem(key);

  if (!stored) {
    return null;
  }

  try {
    const config: ApiKeyConfig = JSON.parse(stored);
    return deobfuscate(config.key);
  } catch {
    return null;
  }
}

/**
 * Delete an API key for a specific provider
 */
export function deleteApiKey(provider: Provider): void {
  const key = getStorageKey(provider);
  localStorage.removeItem(key);
  updateConfiguredProviders(provider, false);

  // Sync to playground format
  syncToPlaygroundFormat();
}

/**
 * Check if an API key exists for a provider
 */
export function hasApiKey(provider: Provider): boolean {
  return getApiKey(provider) !== null;
}

/**
 * Get a masked version of the API key for display
 * e.g., "sk-proj-...****...xyz"
 */
export function getMaskedApiKey(provider: Provider): string | null {
  const key = getApiKey(provider);

  if (!key) {
    return null;
  }

  if (key.length <= 10) {
    return '****';
  }

  const start = key.substring(0, 8);
  const end = key.substring(key.length - 4);
  return `${start}...****...${end}`;
}

/**
 * Update the last used timestamp for an API key
 */
export function updateLastUsed(provider: Provider): void {
  const key = getStorageKey(provider);
  const stored = localStorage.getItem(key);

  if (!stored) {
    return;
  }

  try {
    const config: ApiKeyConfig = JSON.parse(stored);
    config.lastUsed = Date.now();
    localStorage.setItem(key, JSON.stringify(config));
  } catch {
    // Ignore errors
  }
}

/**
 * Get all providers that have API keys configured
 */
export function getConfiguredProviders(): Provider[] {
  const stored = localStorage.getItem(CONFIG_KEY);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as Provider[];
  } catch {
    return [];
  }
}

/**
 * Update the list of configured providers
 */
function updateConfiguredProviders(provider: Provider, add: boolean): void {
  let providers = getConfiguredProviders();

  if (add) {
    if (!providers.includes(provider)) {
      providers.push(provider);
    }
  } else {
    providers = providers.filter(p => p !== provider);
  }

  localStorage.setItem(CONFIG_KEY, JSON.stringify(providers));
}

/**
 * Clear all API keys (use with caution!)
 */
export function clearAllApiKeys(): void {
  const providers = getConfiguredProviders();

  providers.forEach(provider => {
    deleteApiKey(provider);
  });

  localStorage.removeItem(CONFIG_KEY);
}

/**
 * Validate API key format for a provider
 */
export function validateApiKeyFormat(provider: Provider, apiKey: string): { valid: boolean; error?: string } {
  if (!apiKey || apiKey.trim() === '') {
    return { valid: false, error: 'API key cannot be empty' };
  }

  const key = apiKey.trim();

  switch (provider) {
    case 'OpenAI':
      if (!key.startsWith('sk-')) {
        return { valid: false, error: 'OpenAI API keys should start with "sk-"' };
      }
      if (key.length < 20) {
        return { valid: false, error: 'OpenAI API key appears too short' };
      }
      break;

    case 'Anthropic':
      if (!key.startsWith('sk-ant-')) {
        return { valid: false, error: 'Anthropic API keys should start with "sk-ant-"' };
      }
      break;

    case 'Perplexity':
      if (!key.startsWith('pplx-')) {
        return { valid: false, error: 'Perplexity API keys should start with "pplx-"' };
      }
      break;

    case 'Google':
      // Google API keys have various formats
      if (key.length < 20) {
        return { valid: false, error: 'Google API key appears too short' };
      }
      break;
  }

  return { valid: true };
}

/**
 * Export all API keys as JSON (for backup)
 */
export function exportApiKeys(): string {
  const providers = getConfiguredProviders();
  const keys: Record<string, string> = {};

  providers.forEach(provider => {
    const key = getApiKey(provider);
    if (key) {
      keys[provider] = key;
    }
  });

  return JSON.stringify(keys, null, 2);
}

/**
 * Import API keys from JSON (for restore)
 */
export function importApiKeys(json: string): { success: boolean; imported: number; error?: string } {
  try {
    const keys = JSON.parse(json);
    let imported = 0;

    for (const [provider, key] of Object.entries(keys)) {
      if (typeof key === 'string') {
        saveApiKey(provider as Provider, key);
        imported++;
      }
    }

    return { success: true, imported };
  } catch (error) {
    return { success: false, imported: 0, error: 'Invalid JSON format' };
  }
}
