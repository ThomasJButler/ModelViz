'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, X, AlertCircle, Trash2 } from 'lucide-react';
import type { Provider } from '@/lib/storage/apiKeyStorage';
import {
  saveApiKey,
  getApiKey,
  getMaskedApiKey,
  deleteApiKey,
  validateApiKeyFormat,
  hasApiKey,
} from '@/lib/storage/apiKeyStorage';

interface ApiKeyFormProps {
  provider: Provider;
  onSave?: () => void;
  onDelete?: () => void;
}

export default function ApiKeyForm({ provider, onSave, onDelete }: ApiKeyFormProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Check if API key is already configured
    const configured = hasApiKey(provider);
    setIsConfigured(configured);

    if (configured) {
      const masked = getMaskedApiKey(provider);
      setApiKey(masked || '');
    }
  }, [provider]);

  const handleSave = () => {
    // If showing masked key, user hasn't changed it
    if (isConfigured && !showKey && apiKey.includes('****')) {
      setMessage('No changes to save');
      setStatus('idle');
      return;
    }

    // Validate format
    const validation = validateApiKeyFormat(provider, apiKey);
    if (!validation.valid) {
      setStatus('error');
      setMessage(validation.error || 'Invalid API key format');
      return;
    }

    try {
      saveApiKey(provider, apiKey);
      setStatus('success');
      setMessage('API key saved successfully');
      setIsConfigured(true);
      setShowKey(false);

      // Show masked version
      const masked = getMaskedApiKey(provider);
      setApiKey(masked || '');

      // Dispatch event for real-time updates across all pages
      window.dispatchEvent(new CustomEvent('api-keys-updated', {
        detail: { provider, action: 'saved' }
      }));

      if (onSave) {
        onSave();
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Failed to save API key');
    }
  };

  const handleDelete = () => {
    if (!window.confirm(`Are you sure you want to delete the ${provider} API key?`)) {
      return;
    }

    try {
      deleteApiKey(provider);
      setApiKey('');
      setIsConfigured(false);
      setStatus('success');
      setMessage('API key deleted successfully');
      setShowKey(false);

      // Dispatch event for real-time updates across all pages
      window.dispatchEvent(new CustomEvent('api-keys-updated', {
        detail: { provider, action: 'deleted' }
      }));

      if (onDelete) {
        onDelete();
      }

      // Clear message after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage('Failed to delete API key');
    }
  };

  const handleEdit = () => {
    // Clear the masked value and allow editing
    setApiKey('');
    setShowKey(true);
  };

  const handleTest = async () => {
    if (!isConfigured && !apiKey) {
      setStatus('error');
      setMessage('Please enter an API key first');
      return;
    }

    setStatus('testing');
    setMessage('Testing connection...');

    // For now, just validate format
    // In a real implementation, you'd make a test API call
    setTimeout(() => {
      const validation = validateApiKeyFormat(provider, isConfigured ? getApiKey(provider) || '' : apiKey);

      if (validation.valid) {
        setStatus('success');
        setMessage('API key format is valid');
      } else {
        setStatus('error');
        setMessage(validation.error || 'Invalid API key format');
      }

      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    }, 1000);
  };

  const getProviderInfo = (provider: Provider) => {
    const info: Record<Provider, { url: string; keyPrefix: string; description: string }> = {
      OpenAI: {
        url: 'https://platform.openai.com/api-keys',
        keyPrefix: 'sk-',
        description: 'Get your API key from OpenAI Platform',
      },
      Anthropic: {
        url: 'https://console.anthropic.com/settings/keys',
        keyPrefix: 'sk-ant-',
        description: 'Get your API key from Anthropic Console',
      },
      Perplexity: {
        url: 'https://www.perplexity.ai/settings/api',
        keyPrefix: 'pplx-',
        description: 'Get your API key from Perplexity Settings',
      },
      Google: {
        url: 'https://makersuite.google.com/app/apikey',
        keyPrefix: '',
        description: 'Get your API key from Google AI Studio',
      },
    };

    return info[provider];
  };

  const providerInfo = getProviderInfo(provider);

  return (
    <div className="space-y-4 p-6 bg-black/20 border border-matrix-secondary/20 rounded-lg">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-matrix-primary">{provider}</h3>
          <p className="text-sm text-matrix-tertiary mt-1">{providerInfo.description}</p>
          <a
            href={providerInfo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-matrix-secondary hover:text-matrix-primary transition-colors mt-1 inline-block"
          >
            Get API Key →
          </a>
        </div>
        {isConfigured && (
          <div className="flex items-center gap-2 text-matrix-secondary">
            <Check className="w-4 h-4" />
            <span className="text-sm">Configured</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={`Enter your ${provider} API key`}
            className="w-full px-4 py-3 bg-black/40 border border-matrix-secondary/30 rounded-lg
                     text-matrix-primary placeholder-matrix-tertiary/50
                     focus:outline-none focus:border-matrix-secondary focus:ring-1 focus:ring-matrix-secondary
                     font-mono text-sm"
            disabled={isConfigured && !showKey}
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-matrix-tertiary hover:text-matrix-primary
                     transition-colors"
            type="button"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {message && (
          <div
            className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
              status === 'success'
                ? 'bg-matrix-secondary/10 text-matrix-secondary border border-matrix-secondary/20'
                : status === 'error'
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            }`}
          >
            {status === 'success' ? (
              <Check className="w-4 h-4" />
            ) : status === 'error' ? (
              <X className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{message}</span>
          </div>
        )}

        <div className="flex gap-3">
          {!isConfigured || showKey ? (
            <button
              onClick={handleSave}
              disabled={status === 'testing' || !apiKey}
              className="flex-1 px-4 py-2 bg-matrix-secondary text-black font-semibold rounded-lg
                       hover:bg-matrix-primary transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save API Key
            </button>
          ) : (
            <button
              onClick={handleEdit}
              className="flex-1 px-4 py-2 bg-matrix-secondary/20 text-matrix-secondary font-semibold rounded-lg
                       hover:bg-matrix-secondary/30 transition-colors border border-matrix-secondary/30"
            >
              Edit
            </button>
          )}

          <button
            onClick={handleTest}
            disabled={status === 'testing'}
            className="px-4 py-2 bg-black/40 text-matrix-primary font-semibold rounded-lg
                     hover:bg-black/60 transition-colors border border-matrix-secondary/30
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'testing' ? 'Testing...' : 'Test'}
          </button>

          {isConfigured && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500/10 text-red-400 font-semibold rounded-lg
                       hover:bg-red-500/20 transition-colors border border-red-500/30"
              title="Delete API key"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {providerInfo.keyPrefix && (
        <p className="text-xs text-matrix-tertiary">
          API keys should start with: <code className="font-mono bg-black/40 px-2 py-1 rounded">{providerInfo.keyPrefix}</code>
        </p>
      )}
    </div>
  );
}
