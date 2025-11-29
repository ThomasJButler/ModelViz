import {
  saveApiKey,
  getApiKey,
  deleteApiKey,
  hasApiKey,
  getMaskedApiKey,
  updateLastUsed,
  getConfiguredProviders,
  clearAllApiKeys,
  validateApiKeyFormat,
  exportApiKeys,
  importApiKeys,
  type Provider
} from '@/lib/storage/apiKeyStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock btoa and atob for Node environment
global.btoa = (str: string) => Buffer.from(str).toString('base64');
global.atob = (str: string) => Buffer.from(str, 'base64').toString('ascii');

describe('API Key Storage', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('saveApiKey', () => {
    it('saves an API key successfully', () => {
      const apiKey = 'sk-test-key-123456789';
      saveApiKey('OpenAI', apiKey);

      const retrieved = getApiKey('OpenAI');
      expect(retrieved).toBe(apiKey);
    });

    it('trims whitespace from API keys', () => {
      const apiKey = '  sk-test-key-123456789  ';
      saveApiKey('OpenAI', apiKey);

      const retrieved = getApiKey('OpenAI');
      expect(retrieved).toBe(apiKey.trim());
    });

    it('throws error for empty API key', () => {
      expect(() => saveApiKey('OpenAI', '')).toThrow('API key cannot be empty');
      expect(() => saveApiKey('OpenAI', '   ')).toThrow('API key cannot be empty');
    });

    it('stores API key in obfuscated format', () => {
      const apiKey = 'sk-test-key-123456789';
      saveApiKey('OpenAI', apiKey);

      const storageKey = 'modelviz_api_key_openai';
      const stored = localStorageMock.getItem(storageKey);
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      // The stored key should be base64 encoded, not plain text
      expect(parsed.key).not.toBe(apiKey);
      expect(parsed.key).toBe(btoa(apiKey));
    });

    it('sets createdAt timestamp', () => {
      const before = Date.now();
      saveApiKey('OpenAI', 'sk-test-key-123456789');
      const after = Date.now();

      const storageKey = 'modelviz_api_key_openai';
      const stored = localStorageMock.getItem(storageKey);
      const parsed = JSON.parse(stored!);

      expect(parsed.createdAt).toBeGreaterThanOrEqual(before);
      expect(parsed.createdAt).toBeLessThanOrEqual(after);
    });

    it('updates configured providers list', () => {
      saveApiKey('OpenAI', 'sk-test-key-1');
      expect(getConfiguredProviders()).toContain('OpenAI');

      saveApiKey('Anthropic', 'sk-ant-test-key-2');
      const providers = getConfiguredProviders();
      expect(providers).toContain('OpenAI');
      expect(providers).toContain('Anthropic');
    });

    it('handles multiple providers independently', () => {
      saveApiKey('OpenAI', 'sk-openai-key');
      saveApiKey('Anthropic', 'sk-ant-anthropic-key');
      saveApiKey('Google', 'AIzaSyA-google-test-key');

      expect(getApiKey('OpenAI')).toBe('sk-openai-key');
      expect(getApiKey('Anthropic')).toBe('sk-ant-anthropic-key');
      expect(getApiKey('Google')).toBe('AIzaSyA-google-test-key');
    });
  });

  describe('getApiKey', () => {
    it('returns null for non-existent key', () => {
      expect(getApiKey('OpenAI')).toBeNull();
    });

    it('retrieves saved API key', () => {
      const apiKey = 'sk-test-key-123456789';
      saveApiKey('OpenAI', apiKey);

      expect(getApiKey('OpenAI')).toBe(apiKey);
    });

    it('handles corrupted localStorage data', () => {
      const storageKey = 'modelviz_api_key_openai';
      localStorageMock.setItem(storageKey, 'invalid-json{');

      expect(getApiKey('OpenAI')).toBeNull();
    });

    it('deobfuscates stored keys', () => {
      const apiKey = 'sk-test-key-123456789';
      const obfuscated = btoa(apiKey);

      const storageKey = 'modelviz_api_key_openai';
      localStorageMock.setItem(storageKey, JSON.stringify({
        key: obfuscated,
        createdAt: Date.now()
      }));

      expect(getApiKey('OpenAI')).toBe(apiKey);
    });
  });

  describe('deleteApiKey', () => {
    it('removes an API key', () => {
      saveApiKey('OpenAI', 'sk-test-key-123456789');
      expect(hasApiKey('OpenAI')).toBe(true);

      deleteApiKey('OpenAI');
      expect(hasApiKey('OpenAI')).toBe(false);
      expect(getApiKey('OpenAI')).toBeNull();
    });

    it('updates configured providers list', () => {
      saveApiKey('OpenAI', 'sk-test-key-1');
      saveApiKey('Anthropic', 'sk-ant-test-key-2');

      deleteApiKey('OpenAI');

      const providers = getConfiguredProviders();
      expect(providers).not.toContain('OpenAI');
      expect(providers).toContain('Anthropic');
    });

    it('handles deleting non-existent key', () => {
      expect(() => deleteApiKey('OpenAI')).not.toThrow();
      expect(getApiKey('OpenAI')).toBeNull();
    });
  });

  describe('hasApiKey', () => {
    it('returns false for non-existent key', () => {
      expect(hasApiKey('OpenAI')).toBe(false);
    });

    it('returns true for existing key', () => {
      saveApiKey('OpenAI', 'sk-test-key-123456789');
      expect(hasApiKey('OpenAI')).toBe(true);
    });

    it('returns false after deletion', () => {
      saveApiKey('OpenAI', 'sk-test-key-123456789');
      deleteApiKey('OpenAI');
      expect(hasApiKey('OpenAI')).toBe(false);
    });
  });

  describe('getMaskedApiKey', () => {
    it('returns null for non-existent key', () => {
      expect(getMaskedApiKey('OpenAI')).toBeNull();
    });

    it('masks API key correctly for long keys', () => {
      const apiKey = 'sk-proj-abcdefghijklmnopqrstuvwxyz123456789';
      saveApiKey('OpenAI', apiKey);

      const masked = getMaskedApiKey('OpenAI');
      expect(masked).toBe('sk-proj-...****...6789');
    });

    it('returns **** for short keys', () => {
      const apiKey = 'shortkey';
      saveApiKey('OpenAI', apiKey);

      const masked = getMaskedApiKey('OpenAI');
      expect(masked).toBe('****');
    });

    it('masks different lengths correctly', () => {
      const apiKey = 'sk-test-key-1234567890';
      saveApiKey('Anthropic', apiKey);

      const masked = getMaskedApiKey('Anthropic');
      expect(masked).toMatch(/^sk-test-\.\.\..*\.\.\.7890$/);
    });
  });

  describe('updateLastUsed', () => {
    it('updates lastUsed timestamp', () => {
      saveApiKey('OpenAI', 'sk-test-key-123456789');

      const before = Date.now();
      updateLastUsed('OpenAI');
      const after = Date.now();

      const storageKey = 'modelviz_api_key_openai';
      const stored = localStorageMock.getItem(storageKey);
      const parsed = JSON.parse(stored!);

      expect(parsed.lastUsed).toBeGreaterThanOrEqual(before);
      expect(parsed.lastUsed).toBeLessThanOrEqual(after);
    });

    it('does not throw for non-existent key', () => {
      expect(() => updateLastUsed('OpenAI')).not.toThrow();
    });

    it('handles corrupted data gracefully', () => {
      const storageKey = 'modelviz_api_key_openai';
      localStorageMock.setItem(storageKey, 'invalid-json{');

      expect(() => updateLastUsed('OpenAI')).not.toThrow();
    });
  });

  describe('getConfiguredProviders', () => {
    it('returns empty array when no providers configured', () => {
      expect(getConfiguredProviders()).toEqual([]);
    });

    it('returns list of configured providers', () => {
      saveApiKey('OpenAI', 'sk-test-1');
      saveApiKey('Anthropic', 'sk-ant-test-2');

      const providers = getConfiguredProviders();
      expect(providers).toHaveLength(2);
      expect(providers).toContain('OpenAI');
      expect(providers).toContain('Anthropic');
    });

    it('handles corrupted config data', () => {
      localStorageMock.setItem('modelviz_api_config', 'invalid-json{');
      expect(getConfiguredProviders()).toEqual([]);
    });

    it('does not include deleted providers', () => {
      saveApiKey('OpenAI', 'sk-test-1');
      saveApiKey('Anthropic', 'sk-ant-test-2');
      deleteApiKey('OpenAI');

      const providers = getConfiguredProviders();
      expect(providers).not.toContain('OpenAI');
      expect(providers).toContain('Anthropic');
    });
  });

  describe('clearAllApiKeys', () => {
    it('removes all API keys', () => {
      saveApiKey('OpenAI', 'sk-test-1');
      saveApiKey('Anthropic', 'sk-ant-test-2');
      saveApiKey('Google', 'AIzaSyA-google-test-3');

      clearAllApiKeys();

      expect(hasApiKey('OpenAI')).toBe(false);
      expect(hasApiKey('Anthropic')).toBe(false);
      expect(hasApiKey('Google')).toBe(false);
      expect(getConfiguredProviders()).toEqual([]);
    });

    it('handles clearing when no keys exist', () => {
      expect(() => clearAllApiKeys()).not.toThrow();
      expect(getConfiguredProviders()).toEqual([]);
    });
  });

  describe('validateApiKeyFormat', () => {
    describe('Empty key validation', () => {
      it('rejects empty keys', () => {
        const result = validateApiKeyFormat('OpenAI', '');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('API key cannot be empty');
      });

      it('rejects whitespace-only keys', () => {
        const result = validateApiKeyFormat('OpenAI', '   ');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('API key cannot be empty');
      });
    });

    describe('OpenAI validation', () => {
      it('accepts valid OpenAI key', () => {
        const result = validateApiKeyFormat('OpenAI', 'sk-proj-abcdefghijklmnopqrstuvwxyz');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('rejects keys not starting with sk-', () => {
        const result = validateApiKeyFormat('OpenAI', 'invalid-key-format');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('should start with "sk-"');
      });

      it('rejects keys that are too short', () => {
        const result = validateApiKeyFormat('OpenAI', 'sk-short');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('appears too short');
      });
    });

    describe('Anthropic validation', () => {
      it('accepts valid Anthropic key', () => {
        const result = validateApiKeyFormat('Anthropic', 'sk-ant-api03-abcdefghijklmnopqrstuvwxyz');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('rejects keys not starting with sk-ant-', () => {
        const result = validateApiKeyFormat('Anthropic', 'sk-invalid-key-format');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('should start with "sk-ant-"');
      });
    });

    describe('Google validation', () => {
      it('accepts valid Google key', () => {
        const result = validateApiKeyFormat('Google', 'AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz123456789');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('rejects keys that are too short', () => {
        const result = validateApiKeyFormat('Google', 'AIza-short');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('appears too short');
      });
    });

    describe('Other providers validation', () => {
      it('accepts valid Perplexity key', () => {
        const result = validateApiKeyFormat('Perplexity', 'pplx-abcdefghijklmnopqrstuvwxyz');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('accepts valid Mistral key', () => {
        const result = validateApiKeyFormat('Mistral', 'mistral-abcdefghijklmnopqrstuvwxyz');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('accepts valid Cohere key', () => {
        const result = validateApiKeyFormat('Cohere', 'cohere-abcdefghijklmnopqrstuvwxyz');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('rejects invalid prefix for Perplexity', () => {
        // Perplexity validates prefix (pplx-), so 'short' should fail
        expect(validateApiKeyFormat('Perplexity', 'short').valid).toBe(false);
      });

      it('accepts any format for Mistral and Cohere (no strict validation)', () => {
        // Mistral and Cohere don't have strict format validation
        expect(validateApiKeyFormat('Mistral', 'any-key').valid).toBe(true);
        expect(validateApiKeyFormat('Cohere', 'any-key').valid).toBe(true);
      });
    });
  });

  describe('exportApiKeys', () => {
    it('exports empty object when no keys configured', () => {
      const exported = exportApiKeys();
      expect(JSON.parse(exported)).toEqual({});
    });

    it('exports all configured API keys', () => {
      saveApiKey('OpenAI', 'sk-openai-key-123');
      saveApiKey('Anthropic', 'sk-ant-anthropic-key-456');
      saveApiKey('Google', 'AIzaSyA-google-key-789');

      const exported = exportApiKeys();
      const parsed = JSON.parse(exported);

      expect(parsed.OpenAI).toBe('sk-openai-key-123');
      expect(parsed.Anthropic).toBe('sk-ant-anthropic-key-456');
      expect(parsed.Google).toBe('AIzaSyA-google-key-789');
    });

    it('exports valid JSON format', () => {
      saveApiKey('OpenAI', 'sk-test-key');

      const exported = exportApiKeys();
      expect(() => JSON.parse(exported)).not.toThrow();
    });

    it('includes only providers with keys', () => {
      saveApiKey('OpenAI', 'sk-test-key');
      deleteApiKey('Anthropic'); // Make sure it doesn't exist

      const exported = exportApiKeys();
      const parsed = JSON.parse(exported);

      expect(Object.keys(parsed)).toHaveLength(1);
      expect(parsed.OpenAI).toBeDefined();
      expect(parsed.Anthropic).toBeUndefined();
    });
  });

  describe('importApiKeys', () => {
    it('imports valid API keys', () => {
      const keysJson = JSON.stringify({
        OpenAI: 'sk-openai-key-123',
        Anthropic: 'sk-ant-anthropic-key-456'
      });

      const result = importApiKeys(keysJson);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(2);
      expect(getApiKey('OpenAI')).toBe('sk-openai-key-123');
      expect(getApiKey('Anthropic')).toBe('sk-ant-anthropic-key-456');
    });

    it('rejects invalid JSON', () => {
      const result = importApiKeys('invalid-json{');

      expect(result.success).toBe(false);
      expect(result.imported).toBe(0);
      expect(result.error).toBe('Invalid JSON format');
    });

    it('skips non-string values', () => {
      const keysJson = JSON.stringify({
        OpenAI: 'sk-openai-key-123',
        Anthropic: 12345, // Invalid: number instead of string
        Google: 'AIzaSyA-google-key-789'
      });

      const result = importApiKeys(keysJson);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(2); // Only 2 valid imports
      expect(hasApiKey('OpenAI')).toBe(true);
      expect(hasApiKey('Anthropic')).toBe(false);
      expect(hasApiKey('Google')).toBe(true);
    });

    it('overwrites existing keys on import', () => {
      saveApiKey('OpenAI', 'sk-old-key');

      const keysJson = JSON.stringify({
        OpenAI: 'sk-new-key'
      });

      importApiKeys(keysJson);

      expect(getApiKey('OpenAI')).toBe('sk-new-key');
    });

    it('handles empty JSON object', () => {
      const result = importApiKeys('{}');

      expect(result.success).toBe(true);
      expect(result.imported).toBe(0);
    });
  });

  describe('Edge Cases and Integration', () => {
    it('handles complete workflow: save, update, export, clear, import', () => {
      // Save initial keys
      saveApiKey('OpenAI', 'sk-openai-key');
      saveApiKey('Anthropic', 'sk-ant-anthropic-key');

      // Update usage
      updateLastUsed('OpenAI');

      // Export
      const exported = exportApiKeys();

      // Clear all
      clearAllApiKeys();
      expect(getConfiguredProviders()).toEqual([]);

      // Import back
      const result = importApiKeys(exported);
      expect(result.success).toBe(true);
      expect(result.imported).toBe(2);

      // Verify restored
      expect(getApiKey('OpenAI')).toBe('sk-openai-key');
      expect(getApiKey('Anthropic')).toBe('sk-ant-anthropic-key');
    });

    it('handles all supported providers', () => {
      const providers: Provider[] = [
        'OpenAI',
        'Anthropic',
        'Perplexity',
        'Google',
        'Mistral',
        'Cohere'
      ];

      providers.forEach((provider, index) => {
        saveApiKey(provider, `key-${provider}-${index}`);
      });

      const configured = getConfiguredProviders();
      expect(configured).toHaveLength(providers.length);

      providers.forEach(provider => {
        expect(hasApiKey(provider)).toBe(true);
        expect(getMaskedApiKey(provider)).toBeTruthy();
      });
    });
  });
});
