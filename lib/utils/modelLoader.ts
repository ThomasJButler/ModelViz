/**
 * Model Loader Utility
 *
 * Centralized logic for loading available models based on configured API keys.
 * This ensures consistent model availability across all features (Playground, Model Builder, Compare).
 */

import { ApiService } from '@/lib/api';
import { getConfiguredProviders, getApiKey } from '@/lib/storage/apiKeyStorage';

export interface SimpleModel {
  id: string;
  provider: string;
  name: string;
}

/**
 * Get a simplified list of available models for dropdowns and selection UIs
 * This checks both storage systems and returns only models from configured providers
 */
export async function getAvailableModelsSimple(): Promise<SimpleModel[]> {
  const models: SimpleModel[] = [];

  // Check which providers have API keys configured
  const configuredProviders = getConfiguredProviders();

  // Check the playground config (synced from /settings page)
  let apiConfig: any = {};
  if (typeof window !== 'undefined') {
    const savedConfig = localStorage.getItem('modelviz_playground_config');
    if (savedConfig) {
      try {
        apiConfig = JSON.parse(savedConfig);
      } catch (error) {
        console.error('Error parsing API config:', error);
      }
    }
  }

  // Try to initialize ApiService if not already initialized
  try {
    ApiService.getInstance();
  } catch {
    // Not initialized yet, try to initialize from localStorage
    if (Object.keys(apiConfig).length > 0) {
      try {
        ApiService.getInstance(apiConfig);
      } catch (error) {
        console.error('Error initializing ApiService:', error);
      }
    }
  }

  // Check for OpenAI models
  const hasOpenAI = configuredProviders.includes('OpenAI') ||
                    getApiKey('OpenAI') !== null ||
                    apiConfig.openai?.apiKey;

  if (hasOpenAI) {
    try {
      const apiService = ApiService.getInstance();
      // Only try to get models if the client method exists and key is configured
      if (apiService.getOpenAI && apiConfig.openai?.apiKey) {
        const openAiResponse = await apiService.getOpenAI().listModels();
        const openAiModels = openAiResponse.data || [];

        openAiModels
          .filter((model: { id: string }) => {
            const id = model.id.toLowerCase();

            // Only allow exact base models - no dated variants
            // Working models: gpt-3.5-turbo, gpt-4o, gpt-4o-mini
            const allowedModels = [
              'gpt-3.5-turbo',
              'gpt-4o',
              'gpt-4o-mini'
            ];

            return allowedModels.includes(id);
          })
          .forEach((model: { id: string }) => {
            models.push({
              id: model.id,
              provider: 'openai',
              name: formatModelName(model.id, 'OpenAI')
            });
          });
      }
    } catch (error) {
      console.error('Error loading OpenAI models:', error);
      // Add working OpenAI models as fallback
      models.push(
        { id: 'gpt-3.5-turbo', provider: 'openai', name: 'GPT-3.5 Turbo' },
        { id: 'gpt-4o', provider: 'openai', name: 'GPT-4o' },
        { id: 'gpt-4o-mini', provider: 'openai', name: 'GPT-4o Mini' }
      );
    }
  }

  // Check for Anthropic models
  const hasAnthropic = configuredProviders.includes('Anthropic') ||
                       getApiKey('Anthropic') !== null ||
                       apiConfig.anthropic?.apiKey;

  if (hasAnthropic) {
    // Only allow tested working models - exclude Opus 4.5 (doesn't work)
    const allowedAnthropicModels = [
      'claude-sonnet-4-5-20250514',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022'
    ];

    try {
      const apiService = ApiService.getInstance();
      // Only try to get models if the client method exists and key is configured
      if (apiService.getAnthropic && apiConfig.anthropic?.apiKey) {
        const anthropicModels = await apiService.getAnthropic().listModels();

        anthropicModels
          .filter((model: any) => allowedAnthropicModels.includes(model.name))
          .forEach((model: any) => {
            models.push({
              id: model.name,
              provider: 'anthropic',
              name: formatModelName(model.name, 'Anthropic')
            });
          });
      }
    } catch (error) {
      console.error('Error loading Anthropic models:', error);
      // Add working Anthropic models as fallback
      models.push(
        { id: 'claude-sonnet-4-5-20250514', provider: 'anthropic', name: 'Claude 4.5 Sonnet' },
        { id: 'claude-3-5-sonnet-20241022', provider: 'anthropic', name: 'Claude 3.5 Sonnet' },
        { id: 'claude-3-5-haiku-20241022', provider: 'anthropic', name: 'Claude 3.5 Haiku' }
      );
    }
  }

  // Check for Google models
  const hasGoogle = configuredProviders.includes('Google') ||
                    getApiKey('Google') !== null ||
                    apiConfig.google?.apiKey;

  if (hasGoogle) {
    // Only allow tested working model - all others failed or produced no output
    const allowedGoogleModels = ['gemini-2.0-flash'];

    try {
      const apiService = ApiService.getInstance();
      // Only try to get models if the client method exists and key is configured
      if (apiService.getGoogle && apiConfig.google?.apiKey) {
        const googleModels = await apiService.getGoogle().listModels();

        googleModels
          .filter((model: any) => allowedGoogleModels.includes(model.name))
          .forEach((model: any) => {
            models.push({
              id: model.name,
              provider: 'google',
              name: formatModelName(model.name, 'Google')
            });
          });
      }
    } catch (error) {
      console.error('Error loading Google models:', error);
      // Add only working Google model as fallback
      models.push(
        { id: 'gemini-2.0-flash', provider: 'google', name: 'Gemini 2.0 Flash' }
      );
    }
  }

  // Check for Perplexity models
  const hasPerplexity = configuredProviders.includes('Perplexity') ||
                        getApiKey('Perplexity') !== null ||
                        apiConfig.perplexity?.apiKey;

  if (hasPerplexity) {
    try {
      const apiService = ApiService.getInstance();
      // Only try to get models if the client method exists and key is configured
      if (apiService.getPerplexity && apiConfig.perplexity?.apiKey) {
        const perplexityModels = await apiService.getPerplexity().listModels();

        perplexityModels.forEach((model: any) => {
          models.push({
            id: model.id,
            provider: 'perplexity',
            name: formatModelName(model.name || model.id, 'Perplexity')
          });
        });
      }
    } catch (error) {
      console.error('Error loading Perplexity models:', error);
      // Add latest Perplexity models as fallback
      models.push(
        { id: 'sonar', provider: 'perplexity', name: 'Sonar' },
        { id: 'sonar-pro', provider: 'perplexity', name: 'Sonar Pro' },
        { id: 'sonar-reasoning', provider: 'perplexity', name: 'Sonar Pro Reasoning' }
      );
    }
  }

  // If no providers configured, return demo models
  if (models.length === 0) {
    return [
      { id: 'gpt-4-demo', provider: 'demo', name: 'GPT-4 (Demo)' },
      { id: 'claude-3-demo', provider: 'demo', name: 'Claude 3 (Demo)' },
    ];
  }

  return models;
}

/**
 * Check if any API keys are configured
 */
export function hasAnyApiKeys(): boolean {
  const configuredProviders = getConfiguredProviders();

  if (configuredProviders.length > 0) {
    return true;
  }

  // Also check playground config
  if (typeof window !== 'undefined') {
    const savedConfig = localStorage.getItem('modelviz_playground_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        return Object.keys(config).length > 0;
      } catch {
        return false;
      }
    }
  }

  return false;
}

/**
 * Get list of configured provider names
 */
export function getConfiguredProviderNames(): string[] {
  const providers = getConfiguredProviders();

  // Also check playground config
  if (typeof window !== 'undefined') {
    const savedConfig = localStorage.getItem('modelviz_playground_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        const configProviders = Object.keys(config).map(key =>
          key.charAt(0).toUpperCase() + key.slice(1)
        );
        // Merge and deduplicate
        return Array.from(new Set([...providers, ...configProviders]));
      } catch {
        return providers;
      }
    }
  }

  return providers;
}

// Helper function to format model names nicely
function formatModelName(modelId: string, provider: string): string {
  if (provider === 'OpenAI') {
    return modelId
      .replace('gpt-3.5-turbo', 'GPT-3.5 Turbo')
      .replace('gpt-4o-mini', 'GPT-4o Mini')
      .replace('gpt-4o', 'GPT-4o')
      .replace('gpt-4-turbo', 'GPT-4 Turbo')
      .replace('gpt-4', 'GPT-4')
      .replace(/-(\d{8})/, '')
      .replace(/-preview/, ' Preview');
  } else if (provider === 'Anthropic') {
    return modelId
      .replace('claude-sonnet-4-5', 'Claude 4.5 Sonnet')
      .replace('claude-4-5-sonnet', 'Claude 4.5 Sonnet')
      .replace('claude-3-5-sonnet', 'Claude 3.5 Sonnet')
      .replace('claude-3-5-haiku', 'Claude 3.5 Haiku')
      .replace('claude-3-5-opus', 'Claude 3.5 Opus')
      .replace('claude-3-opus', 'Claude 3 Opus')
      .replace('claude-3-sonnet', 'Claude 3 Sonnet')
      .replace('claude-3-haiku', 'Claude 3 Haiku')
      .replace(/-(\d{8})/, '');
  } else if (provider === 'DeepSeek') {
    return modelId
      .replace('deepseek-chat', 'DeepSeek Chat')
      .replace('deepseek-coder', 'DeepSeek Coder')
      .replace('deepseek-v3', 'DeepSeek V3')
      .replace('deepseek-r1', 'DeepSeek R1');
  } else if (provider === 'Google') {
    return modelId
      .replace('gemini-3-pro-preview', 'Gemini 3 Pro')
      .replace('gemini-2.5-pro', 'Gemini 2.5 Pro')
      .replace('gemini-2.5-flash', 'Gemini 2.5 Flash')
      .replace('gemini-2.0-pro-exp', 'Gemini 2.0 Pro (Experimental)')
      .replace('gemini-2.0-flash-exp', 'Gemini 2.0 Flash (Experimental)')
      .replace('gemini-2.0-flash', 'Gemini 2.0 Flash')
      .replace('gemini-1.5-pro', 'Gemini 1.5 Pro')
      .replace('gemini-1.5-flash', 'Gemini 1.5 Flash')
      .replace('gemini-pro', 'Gemini Pro')
      .replace('gemini-', 'Gemini ');
  } else if (provider === 'Perplexity') {
    return modelId
      .replace('sonar-reasoning', 'Sonar Pro Reasoning')
      .replace('sonar-pro', 'Sonar Pro')
      .replace('sonar', 'Sonar')
      .replace('pplx-', 'Perplexity ');
  }

  // Default formatting
  return modelId
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
