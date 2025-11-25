/**
 * Playground API
 *
 * Handles the connection between the playground UI and the various API providers.
 * This service abstracts away the differences between the APIs and provides a
 * consistent interface for the playground to use.
 */

import { ApiService, OpenAITypes, type ApiConfig } from '@/lib/api';
import { MetricsService } from '@/lib/services/MetricsService';
import { calculateCost, estimateTokens } from '@/lib/utils/costCalculator';
import { getApiKey, hasApiKey, updateLastUsed, type Provider } from '@/lib/storage/apiKeyStorage';

export interface PlaygroundRequest {
  modelId: string;
  provider: string;
  input: string;
  inputFormat: 'json' | 'text' | 'code';
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface PlaygroundResponse {
  content: string;
  metadata?: {
    tokens_used: number;
    processing_time: string;
    model: string;
    confidence: number;
  };
  error?: string;
}

/**
 * Initialize ApiService with user-provided API keys from storage
 */
function initializeApiService(): ApiService {
  const config: ApiConfig = {};

  // Load API keys from storage for each provider
  const providers: Array<{ name: Provider; configKey: keyof ApiConfig }> = [
    { name: 'OpenAI', configKey: 'openai' },
    { name: 'Anthropic', configKey: 'anthropic' },
    { name: 'Perplexity', configKey: 'perplexity' },
    { name: 'Google', configKey: 'google' },
  ];

  providers.forEach(({ name, configKey }) => {
    const apiKey = getApiKey(name);
    if (apiKey) {
      config[configKey] = { apiKey };
    }
  });

  // Initialize or update the ApiService instance
  try {
    const service = ApiService.getInstance(config);
    service.updateConfig(config);
    return service;
  } catch {
    // First initialization
    return ApiService.getInstance(config);
  }
}

export async function generatePlaygroundResponse(request: PlaygroundRequest): Promise<PlaygroundResponse> {
  const startTime = performance.now();

  try {
    // Check if API key is configured for this provider (skip check for demo mode)
    if (request.provider !== 'Demo') {
      const provider = request.provider as Provider;
      const hasKey = hasApiKey(provider);

      if (!hasKey) {
        throw new Error(`No API key configured for ${provider}. Please configure your API key in Settings.`);
      }

      // Update last used timestamp for this provider
      updateLastUsed(provider);
    }

    // Initialize API service with user keys
    const apiService = initializeApiService();

    let response = '';
    let tokensUsed = 0;

    // Determine the appropriate temperature (default to 0.7 if not specified)
    const temperature = request.temperature !== undefined ? request.temperature : 0.7;

    // Determine the appropriate max tokens (default to 1024 if not specified)
    const maxTokens = request.maxTokens !== undefined ? request.maxTokens : 1024;

    // Handle the input format
    let prompt = request.input;
    let systemPrompt = '';

    // Setup system prompts based on input format
    if (request.inputFormat === 'json') {
      try {
        const jsonInput = JSON.parse(prompt);
        if (jsonInput.system) {
          systemPrompt = jsonInput.system;
        }
        if (jsonInput.input) {
          prompt = jsonInput.input;
        }
        // If input contains other parameters, keep using the full JSON
      } catch (e) {
        // If not valid JSON, use as-is
      }
    } else if (request.inputFormat === 'code') {
      systemPrompt = "You are a code analyst. Analyze the following code and provide insights, improvements, and potential issues.";
    }
    
    // Handle different providers
    switch (request.provider) {
      case 'OpenAI':
        try {
          // OpenAI API call
          const completion = await apiService.getOpenAI().generateCompletion(
            prompt,
            request.modelId,
            maxTokens,
            temperature
          );

          response = completion.content;
          tokensUsed = completion.usage?.total_tokens || 0;
        } catch (error: any) {
          console.error('OpenAI API error:', error);
          throw new Error(`OpenAI API error: ${error.message || 'Unknown error'}`);
        }
        break;
        
      case 'Anthropic':
        try {
          // Anthropic API call
          const completion = await apiService.getAnthropic().generateCompletion(
            prompt,
            request.modelId,
            maxTokens,
            temperature
          );

          response = completion.content;
          // Anthropic returns accurate token counts in usage
          tokensUsed = completion.usage?.total_tokens || 0;
        } catch (error: any) {
          console.error('Anthropic API error:', error);
          throw new Error(`Anthropic API error: ${error.message || 'Unknown error'}`);
        }
        break;

      case 'Perplexity':
        try {
          // Perplexity API call
          const completion = await apiService.getPerplexity().generateCompletion(
            prompt,
            request.modelId,
            maxTokens,
            temperature
          );

          response = completion.content;
          // Perplexity returns token counts in usage
          tokensUsed = completion.usage?.total_tokens || 0;
        } catch (error: any) {
          console.error('Perplexity API error:', error);
          throw new Error(`Perplexity API error: ${error.message || 'Unknown error'}`);
        }
        break;

      case 'Google':
        try {
          // Google Gemini API call
          const completion = await apiService.getGoogle().generateCompletion(
            prompt,
            request.modelId,
            maxTokens,
            temperature
          );

          response = completion.content;
          // Google returns accurate token counts in usage_metadata
          tokensUsed = completion.usage?.total_tokens || 0;
        } catch (error: any) {
          console.error('Google API error:', error);
          throw new Error(`Google API error: ${error.message || 'Unknown error'}`);
        }
        break;

      case 'Demo':
        // Simulate API call for demo models
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (request.inputFormat === 'json') {
          response = "This is a simulated response from a demo model. In a real implementation, this would be generated by an actual AI model API. The response would be tailored to the input JSON parameters and would provide relevant information or analysis.";
        } else if (request.inputFormat === 'code') {
          response = "Code Analysis Results:\n\n1. Structure: The code appears well-structured with clear function definitions.\n2. Best practices: Following standard naming conventions and patterns.\n3. Potential improvements:\n   - Consider adding more error handling\n   - Add documentation for complex logic\n   - Optimize performance in the main loop\n\nOverall, the code is well-written but could benefit from these minor improvements.";
        } else {
          response = "This is a simulated response from a demo model. In a real implementation, this would be generated by an actual AI model based on your text input. For now, this is just placeholder text to demonstrate how the interface would work with real API connections.";
        }
        
        tokensUsed = prompt.length + response.length;
        break;
        
      default:
        throw new Error(`Unknown provider: ${request.provider}`);
    }
    
    // Calculate processing time
    const endTime = performance.now();
    const processingTime = ((endTime - startTime) / 1000).toFixed(3);
    const latency = endTime - startTime; // milliseconds

    // Estimate token breakdown
    const promptTokens = estimateTokens(prompt);
    const completionTokens = tokensUsed - promptTokens;
    const confidence = 0.92 + (Math.random() * 0.08); // Simulate confidence between 0.92 and 1.0

    // Calculate cost
    const estimatedCost = calculateCost(
      request.provider,
      request.modelId,
      promptTokens,
      completionTokens
    );

    // Record metrics
    const metricsService = MetricsService.getInstance();
    const metricData = {
      timestamp: Date.now(),
      provider: request.provider,
      model: request.modelId,
      inputFormat: request.inputFormat,
      latency: latency,
      tokensUsed: tokensUsed,
      promptTokens: promptTokens,
      completionTokens: completionTokens,
      status: 'success' as const,
      estimatedCost: estimatedCost,
      promptLength: prompt.length,
      responseLength: response.length,
      confidence: confidence
    };

    console.log('[API] Recording success metric:', {
      provider: metricData.provider,
      model: metricData.model,
      latency: `${metricData.latency.toFixed(0)}ms`,
      cost: `$${metricData.estimatedCost.toFixed(4)}`,
      tokens: metricData.tokensUsed
    });

    try {
      await metricsService.recordMetric(metricData);
      console.log('[API] Metric recorded successfully');
    } catch (error) {
      console.error('[API] Failed to record metric:', error);
      throw error;
    }

    // Return formatted response
    return {
      content: response,
      metadata: {
        tokens_used: tokensUsed,
        processing_time: `${processingTime}s`,
        model: request.modelId,
        confidence: confidence
      }
    };
  } catch (error: any) {
    console.error('Error generating playground response:', error);

    // Calculate processing time even for errors
    const endTime = performance.now();
    const processingTime = ((endTime - startTime) / 1000).toFixed(3);
    const latency = endTime - startTime; // milliseconds

    // Record error metric
    const metricsService = MetricsService.getInstance();
    const promptTokens = estimateTokens(request.input);

    const errorMetricData = {
      timestamp: Date.now(),
      provider: request.provider,
      model: request.modelId,
      inputFormat: request.inputFormat,
      latency: latency,
      tokensUsed: 0,
      promptTokens: promptTokens,
      completionTokens: 0,
      status: 'error' as const,
      errorMessage: error.message || 'An unknown error occurred',
      estimatedCost: 0,
      promptLength: request.input.length,
      responseLength: 0
    };

    console.log('[API] Recording error metric:', {
      provider: errorMetricData.provider,
      model: errorMetricData.model,
      error: errorMetricData.errorMessage
    });

    try {
      await metricsService.recordMetric(errorMetricData);
      console.log('[API] Error metric recorded successfully');
    } catch (recordError) {
      console.error('[API] Failed to record error metric:', recordError);
    }

    return {
      content: '',
      error: `Failed to generate response: ${error.message || 'An unknown error occurred'}`,
      metadata: {
        tokens_used: 0,
        processing_time: `${processingTime}s`,
        model: request.modelId,
        confidence: 0
      }
    };
  }
}
