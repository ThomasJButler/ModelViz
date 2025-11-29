/**
 * @author Tom Butler
 * @date 2025-01-23
 * @description Google Gemini API client for accessing Gemini 2.0 models with multimodal capabilities
 */

import { ApiClient } from '../apiClient';
import * as GoogleTypes from '../types/google';

export class GoogleClient extends ApiClient {
  private apiKey: string;

  constructor(apiKey: string) {
    // Use local API route proxy to avoid CORS issues
    super('/api/google', {
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
   * Lists available Gemini models
   * Returns a static list of current Gemini models
   * @return Array of available Gemini models with capabilities
   */
  async listModels(): Promise<GoogleTypes.ModelObject[]> {
    return [
      {
        name: 'gemini-3-pro-preview',
        display_name: 'Gemini 3 Pro',
        description: 'Next-generation flagship model with advanced capabilities',
        input_token_limit: 2000000,
        output_token_limit: 8192,
        supported_generation_methods: ['generateContent', 'streamGenerateContent']
      },
      {
        name: 'gemini-2.5-pro',
        display_name: 'Gemini 2.5 Pro',
        description: 'Enhanced Pro model with improved reasoning and performance',
        input_token_limit: 2000000,
        output_token_limit: 8192,
        supported_generation_methods: ['generateContent', 'streamGenerateContent']
      },
      {
        name: 'gemini-2.5-flash',
        display_name: 'Gemini 2.5 Flash',
        description: 'Upgraded Flash model with better speed and accuracy',
        input_token_limit: 1000000,
        output_token_limit: 8192,
        supported_generation_methods: ['generateContent', 'streamGenerateContent']
      },
      {
        name: 'gemini-2.0-pro-exp',
        display_name: 'Gemini 2.0 Pro (Experimental)',
        description: 'Experimental Pro version with cutting-edge features',
        input_token_limit: 2000000,
        output_token_limit: 8192,
        supported_generation_methods: ['generateContent', 'streamGenerateContent']
      },
      {
        name: 'gemini-2.0-flash',
        display_name: 'Gemini 2.0 Flash',
        description: 'Latest, fastest multimodal model with improved reasoning',
        input_token_limit: 1000000,
        output_token_limit: 8192,
        supported_generation_methods: ['generateContent', 'streamGenerateContent']
      },
      {
        name: 'gemini-2.0-flash-exp',
        display_name: 'Gemini 2.0 Flash (Experimental)',
        description: 'Experimental version with latest features',
        input_token_limit: 1000000,
        output_token_limit: 8192,
        supported_generation_methods: ['generateContent', 'streamGenerateContent']
      },
      {
        name: 'gemini-1.5-pro',
        display_name: 'Gemini 1.5 Pro',
        description: 'Most capable model with 2M token context window',
        input_token_limit: 2000000,
        output_token_limit: 8192,
        supported_generation_methods: ['generateContent', 'streamGenerateContent']
      },
      {
        name: 'gemini-1.5-flash',
        display_name: 'Gemini 1.5 Flash',
        description: 'Fast and versatile model for diverse tasks',
        input_token_limit: 1000000,
        output_token_limit: 8192,
        supported_generation_methods: ['generateContent', 'streamGenerateContent']
      }
    ];
  }

  /**
   * Generates content using Gemini models
   * @param model - Model name (e.g., 'gemini-2.0-flash')
   * @param request - Generate content request with contents and configuration
   * @return Generated content response with candidates
   */
  async generateContent(
    model: string,
    request: GoogleTypes.GenerateContentRequest
  ): Promise<GoogleTypes.GenerateContentResponse> {
    return this.post<GoogleTypes.GenerateContentResponse>(
      `models/${model}:generateContent`,
      request
    );
  }

  /**
   * Simplified method for generating text from a single prompt
   * @param prompt - User prompt text
   * @param systemPrompt - System instructions (prepended to prompt)
   * @param model - Gemini model to use
   * @param options - Additional generation options
   * @return Generated text response
   */
  async generateText(
    prompt: string,
    systemPrompt: string = "You are a helpful assistant.",
    model: string = "gemini-2.0-flash",
    options: Partial<GoogleTypes.GenerationConfig> = {}
  ): Promise<string> {
    const fullPrompt = systemPrompt
      ? `${systemPrompt}\n\n${prompt}`
      : prompt;

    const response = await this.generateContent(model, {
      contents: [{
        parts: [{ text: fullPrompt }]
      }],
      generation_config: {
        temperature: 0.7,
        max_output_tokens: 1000,
        ...options
      }
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  /**
   * Generates a completion with usage statistics for cross-provider compatibility
   * @param prompt - Text prompt to complete
   * @param model - Model name to use
   * @param maxTokens - Maximum tokens to generate
   * @param temperature - Sampling temperature (0-2)
   * @return Generated content and usage metrics
   */
  async generateCompletion(
    prompt: string,
    model: string = "gemini-2.0-flash",
    maxTokens?: number,
    temperature?: number
  ): Promise<{ content: string; usage?: { total_tokens: number; prompt_tokens: number; completion_tokens: number } }> {
    const response = await this.generateContent(model, {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generation_config: {
        max_output_tokens: maxTokens || 1000,
        temperature: temperature !== undefined ? temperature : 0.7
      }
    });

    const content = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const usage = response.usage_metadata ? {
      total_tokens: response.usage_metadata.total_token_count,
      prompt_tokens: response.usage_metadata.prompt_token_count,
      completion_tokens: response.usage_metadata.candidates_token_count
    } : undefined;

    return {
      content,
      usage
    };
  }

  /**
   * Counts tokens in a text string (using Gemini's token counting endpoint)
   * @param model - Model to use for token counting
   * @param text - Text to count tokens for
   * @return Token count
   */
  async countTokens(
    model: string,
    text: string
  ): Promise<number> {
    try {
      const response = await this.post<{ totalTokens: number }>(
        `models/${model}:countTokens`,
        {
          contents: [{
            parts: [{ text }]
          }]
        }
      );
      return response.totalTokens || 0;
    } catch (error) {
      // Fallback to estimation if API call fails
      return Math.ceil(text.length / 4);
    }
  }
}
