/**
 * @author Tom Butler
 * @date 2025-01-24
 * @description Perplexity API client with support for web-grounded responses and search
 */

import { ApiClient } from '../apiClient';
import * as PerplexityTypes from '../types/perplexity';

export class PerplexityClient extends ApiClient {
  private apiKey: string;

  constructor(apiKey: string) {
    // Use local API route proxy to avoid CORS issues
    super('/api/perplexity', {
      'Content-Type': 'application/json'
    });
    this.apiKey = apiKey;
  }

  /**
   * Override request to inject API key into headers for proxy route
   */
  async request<T>(endpoint: string, options: any = {}): Promise<T> {
    const mergedOptions = {
      ...options,
      headers: {
        ...options.headers,
        'x-api-key': this.apiKey,
      }
    };
    return super.request<T>(endpoint, mergedOptions);
  }
  
  /**
   * Lists available Perplexity models
   * Returns a static list as Perplexity doesn't provide a models endpoint
   * @return Array of available models
   */
  async listModels(): Promise<PerplexityTypes.ModelObject[]> {
    return [
      {
        id: 'sonar',
        name: 'Sonar',
        description: 'Fast model with real-time web search capabilities',
        capabilities: ['Web Search', 'Text Generation', 'Current Information'],
        context_length: 128000
      },
      {
        id: 'sonar-pro',
        name: 'Sonar Pro',
        description: 'Advanced model with enhanced reasoning and web search',
        capabilities: ['Web Search', 'Advanced Reasoning', 'Text Generation', 'Current Information'],
        context_length: 128000
      },
      {
        id: 'sonar-reasoning',
        name: 'Sonar Pro Reasoning',
        description: 'Most capable model with deep reasoning and comprehensive search',
        capabilities: ['Web Search', 'Deep Reasoning', 'Text Generation', 'Current Information', 'Analysis'],
        context_length: 128000
      }
    ];
  }
  
  /**
   * Creates a chat completion using Perplexity models
   * @param request - Chat completion request parameters
   * @return Generated completion response
   */
  async createChatCompletion(
    request: PerplexityTypes.ChatCompletionRequest
  ): Promise<PerplexityTypes.ChatCompletionResponse> {
    return this.post<PerplexityTypes.ChatCompletionResponse>('chat/completions', request);
  }

  /**
   * Simplified method for generating text from a single prompt
   * @param prompt - User prompt text
   * @param systemPrompt - System instructions for the model
   * @param model - Model ID to use
   * @param options - Additional completion options
   * @return Generated text response
   */
  async generateText(
    prompt: string,
    systemPrompt: string = "",
    model: string = "sonar",
    options: Partial<PerplexityTypes.ChatCompletionRequest> = {}
  ): Promise<string> {
    // Build messages array
    const messages: PerplexityTypes.Message[] = [];
    
    // Add system message if provided
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }
    
    // Add user message
    messages.push({
      role: 'user',
      content: prompt
    });
    
    // Create completion
    const response = await this.createChatCompletion({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
      ...options
    });
    
    // Return the text content
    return response.choices[0]?.message.content || '';
  }
  
  /**
   * Generate a completion with usage metrics (matches interface of other providers)
   * @param prompt - User prompt text
   * @param model - Model ID to use
   * @param maxTokens - Maximum tokens to generate
   * @param temperature - Sampling temperature
   * @return Generated content and usage metrics
   */
  async generateCompletion(
    prompt: string,
    model: string = "sonar",
    maxTokens?: number,
    temperature?: number
  ): Promise<{ content: string; usage?: { total_tokens: number } }> {
    const response = await this.createChatCompletion({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens || 1024,
      temperature: temperature !== undefined ? temperature : 0.7
    });

    return {
      content: response.choices[0]?.message.content || '',
      usage: response.usage ? {
        total_tokens: response.usage.total_tokens
      } : undefined
    };
  }

  /**
   * Tests the API connection by making a minimal request
   * @return True if connection is successful
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try a minimal API call to validate the key
      const response = await this.createChatCompletion({
        model: 'sonar',
        messages: [{ role: 'user', content: 'Hello!' }],
        max_tokens: 10
      });

      return response.id !== undefined;
    } catch (error) {
      console.error('Perplexity API connection test failed:', error);
      return false;
    }
  }
}
