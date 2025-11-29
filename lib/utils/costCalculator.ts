/**
 * Cost Calculator for AI API usage
 * Calculates estimated costs based on token usage and provider pricing
 * Pricing as of January 2025
 */

interface ModelPricing {
  input: number;   // Cost per 1K input tokens (USD)
  output: number;  // Cost per 1K output tokens (USD)
}

interface ProviderPricing {
  [model: string]: ModelPricing;
}

/**
 * Pricing table for major AI providers
 * Updated: January 2025
 */
const PRICING_TABLE: Record<string, ProviderPricing> = {
  'OpenAI': {
    // Latest models (2025)
    'gpt-5': { input: 0.02, output: 0.08 },
    'gpt-5-nano': { input: 0.001, output: 0.004 },
    'gpt-5.1': { input: 0.025, output: 0.10 },
    'gpt-5.1-chat-latest': { input: 0.025, output: 0.10 },
    'o3': { input: 0.02, output: 0.08 },
    'o3-mini': { input: 0.004, output: 0.016 },
    'o4-mini': { input: 0.003, output: 0.012 },
    'gpt-4.1': { input: 0.015, output: 0.045 },
    'gpt-4.1-mini': { input: 0.0005, output: 0.002 },
    'gpt-4.1-nano': { input: 0.0002, output: 0.0008 },
    // Existing models
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-32k': { input: 0.06, output: 0.12 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    'gpt-3.5-turbo-16k': { input: 0.001, output: 0.002 },
    'gpt-4o': { input: 0.005, output: 0.015 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'o1': { input: 0.015, output: 0.06 },
    'o1-mini': { input: 0.003, output: 0.012 },
  },
  'Anthropic': {
    // Claude 4 models (2025)
    'claude-opus-4-5-20250514': { input: 0.015, output: 0.075 },
    'claude-opus-4-5': { input: 0.015, output: 0.075 },
    'claude-sonnet-4-5-20250929': { input: 0.004, output: 0.020 },
    'claude-opus-4-1-20250805': { input: 0.020, output: 0.100 },
    'claude-opus-4-20250514': { input: 0.018, output: 0.090 },
    'claude-sonnet-4-20250514': { input: 0.004, output: 0.020 },
    // Claude 3.5 and 3.7 models
    'claude-3-7-sonnet-20250219': { input: 0.003, output: 0.015 },
    'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
    'claude-3-5-haiku-20241022': { input: 0.0008, output: 0.004 },
    'claude-3.5-sonnet': { input: 0.003, output: 0.015 },
    'claude-3-5-sonnet-20240620': { input: 0.003, output: 0.015 },
    // Claude 3 Opus
    'claude-3-opus': { input: 0.015, output: 0.075 },
    'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
    // Claude 3 Sonnet
    'claude-3-sonnet': { input: 0.003, output: 0.015 },
    'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
    // Claude 3 Haiku
    'claude-3-haiku': { input: 0.00025, output: 0.00125 },
    'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
    // Legacy models
    'claude-2.1': { input: 0.008, output: 0.024 },
    'claude-2': { input: 0.008, output: 0.024 },
    'claude-instant-1.2': { input: 0.0008, output: 0.0024 },
  },
  'Perplexity': {
    // Current Sonar models (January 2025)
    'sonar': { input: 0.0002, output: 0.0002 },
    'sonar-pro': { input: 0.001, output: 0.001 },
    'sonar-reasoning': { input: 0.001, output: 0.001 },
    // Legacy models (kept for backwards compatibility)
    'pplx-7b-online': { input: 0.0002, output: 0.0002 },
    'pplx-70b-online': { input: 0.001, output: 0.001 },
    'sonar-small-chat': { input: 0.0002, output: 0.0002 },
    'sonar-medium-chat': { input: 0.0006, output: 0.0006 },
    'sonar-small-online': { input: 0.0002, output: 0.0002 },
    'sonar-medium-online': { input: 0.0006, output: 0.0006 },
  },
  'Google': {
    // Gemini 3 series
    'gemini-3-pro-preview': { input: 0.005, output: 0.015 },
    // Gemini 2.5 series
    'gemini-2.5-pro': { input: 0.004, output: 0.012 },
    'gemini-2.5-flash': { input: 0.00015, output: 0.0006 },
    'gemini-2.5-flash-lite-preview-06-17': { input: 0.0001, output: 0.0004 },
    // Gemini 2.0 series
    'gemini-2.0-pro-exp': { input: 0.0035, output: 0.0105 },
    'gemini-2.0-pro-exp-02-05': { input: 0.0035, output: 0.0105 },
    'gemini-2.0-flash': { input: 0.0001, output: 0.0004 },
    'gemini-2.0-flash-001': { input: 0.0001, output: 0.0004 },
    'gemini-2.0-flash-exp': { input: 0.0001, output: 0.0004 },
    'gemini-2.0-flash-lite-preview-02-05': { input: 0.00005, output: 0.0002 },
    'gemini-2.0-flash-thinking-exp-01-21': { input: 0.0001, output: 0.0004 },
    'gemini-2.0-flash-thinking-exp-1219': { input: 0.0001, output: 0.0004 },
    // Gemini 1.5 series
    'gemini-1.5-pro': { input: 0.0035, output: 0.0105 },
    'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
    // Legacy models
    'gemini-pro': { input: 0.00025, output: 0.0005 },
    'gemini-pro-vision': { input: 0.00025, output: 0.0005 },
  },
  'Mistral': {
    'mistral-tiny': { input: 0.00014, output: 0.00042 },
    'mistral-small': { input: 0.0006, output: 0.0018 },
    'mistral-medium': { input: 0.0027, output: 0.0081 },
    'mistral-large': { input: 0.004, output: 0.012 },
  },
  'Cohere': {
    'command': { input: 0.001, output: 0.002 },
    'command-light': { input: 0.0003, output: 0.0006 },
    'command-r': { input: 0.0005, output: 0.0015 },
    'command-r-plus': { input: 0.003, output: 0.015 },
  }
};

/**
 * Calculate the cost of an API call based on token usage
 *
 * @param provider - The AI provider (e.g., 'OpenAI', 'Anthropic')
 * @param model - The specific model (e.g., 'gpt-4', 'claude-3-opus')
 * @param promptTokens - Number of input tokens
 * @param completionTokens - Number of output tokens
 * @returns Estimated cost in USD
 */
export function calculateCost(
  provider: string,
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  // Normalize provider name (case-insensitive)
  const normalizedProvider = Object.keys(PRICING_TABLE).find(
    p => p.toLowerCase() === provider.toLowerCase()
  ) || provider;

  // Get pricing for this provider/model
  const providerPricing = PRICING_TABLE[normalizedProvider];
  if (!providerPricing) {
    console.warn(`No pricing found for provider: ${provider}`);
    return 0;
  }

  // Find model pricing (exact match or partial match)
  let pricing = providerPricing[model];

  if (!pricing) {
    // Try to find a partial match
    const modelKey = Object.keys(providerPricing).find(
      m => model.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(model.toLowerCase())
    );

    if (modelKey) {
      pricing = providerPricing[modelKey];
    } else {
      console.warn(`No pricing found for model: ${model} (provider: ${provider})`);
      return 0;
    }
  }

  // Calculate costs
  const inputCost = (promptTokens / 1000) * pricing.input;
  const outputCost = (completionTokens / 1000) * pricing.output;
  const totalCost = inputCost + outputCost;

  // Round to 6 decimal places (microdollars)
  return Number(totalCost.toFixed(6));
}

/**
 * Estimate token count from text (rough approximation)
 * Average English text: ~4 characters per token
 *
 * @param text - The text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokens(text: string): number {
  // Simple heuristic: ~4 characters per token
  return Math.ceil(text.length / 4);
}

/**
 * Get pricing information for a specific model
 *
 * @param provider - The AI provider
 * @param model - The specific model
 * @returns Pricing information or null if not found
 */
export function getModelPricing(provider: string, model: string): ModelPricing | null {
  const normalizedProvider = Object.keys(PRICING_TABLE).find(
    p => p.toLowerCase() === provider.toLowerCase()
  ) || provider;

  const providerPricing = PRICING_TABLE[normalizedProvider];
  if (!providerPricing) return null;

  return providerPricing[model] || null;
}

/**
 * Get all available providers
 */
export function getAvailableProviders(): string[] {
  return Object.keys(PRICING_TABLE);
}

/**
 * Get all models for a specific provider
 *
 * @param provider - The AI provider
 * @returns Array of model names
 */
export function getProviderModels(provider: string): string[] {
  const normalizedProvider = Object.keys(PRICING_TABLE).find(
    p => p.toLowerCase() === provider.toLowerCase()
  ) || provider;

  const providerPricing = PRICING_TABLE[normalizedProvider];
  return providerPricing ? Object.keys(providerPricing) : [];
}

/**
 * Format cost for display
 *
 * @param cost - Cost in USD
 * @returns Formatted cost string
 */
export function formatCost(cost: number): string {
  if (cost === 0) return '$0.00';
  if (cost < 0.000001) return '<$0.000001';
  if (cost < 0.01) return `$${cost.toFixed(6)}`;
  return `$${cost.toFixed(4)}`;
}

/**
 * Calculate cost savings between two models
 *
 * @param costA - Cost of first option
 * @param costB - Cost of second option
 * @returns Percentage savings (positive if A is cheaper, negative if B is cheaper)
 */
export function calculateSavings(costA: number, costB: number): number {
  if (costB === 0) return 0;
  return ((costB - costA) / costB) * 100;
}

/**
 * Project monthly cost based on current usage
 *
 * @param totalCost - Total cost so far
 * @param daysElapsed - Number of days in the measurement period
 * @returns Projected monthly cost
 */
export function projectMonthlyCost(totalCost: number, daysElapsed: number): number {
  if (daysElapsed === 0) return 0;
  const dailyAverage = totalCost / daysElapsed;
  return dailyAverage * 30;
}

/**
 * Export pricing table for external use
 */
export { PRICING_TABLE };
