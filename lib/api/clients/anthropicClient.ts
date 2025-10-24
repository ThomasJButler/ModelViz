/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Anthropic API client for Claude models with support for advanced reasoning and tool use
 */

import { ApiClient } from '../apiClient';
import * as AnthropicTypes from '../types/anthropic';

export class AnthropicClient extends ApiClient {
  private apiVersion = '2023-06-01';
  private anthropicVersion = 'claude-3';
  
  constructor(apiKey: string) {
    super('https://api.anthropic.com/v1', {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    });
  }
  
  /**
   * Lists available Claude models
   * Returns a static list as Anthropic doesn't provide a models endpoint
   * @return Array of available Claude models with capabilities
   */
  async listModels(): Promise<AnthropicTypes.ModelObject[]> {
    return [
      {
        name: 'claude-3-opus-20240229',
        description: 'Anthropic\'s most powerful model for highly complex tasks',
        context_window: 200000,
        max_tokens: 4096
      },
      {
        name: 'claude-3-sonnet-20240229',
        description: 'Balanced model for most tasks with excellent performance',
        context_window: 200000,
        max_tokens: 4096
      },
      {
        name: 'claude-3-haiku-20240307',
        description: 'Fastest and most compact model for simple tasks',
        context_window: 200000,
        max_tokens: 4096
      },
      {
        name: 'claude-2.1',
        description: 'Previous generation model with good performance',
        context_window: 100000,
        max_tokens: 4096
      }
    ];
  }
  
  /**
   * Creates a message completion with Claude
   * @param request - Message request with prompt and parameters
   * @return Claude's response with content blocks
   */
  async createMessage(
    request: AnthropicTypes.MessageRequest
  ): Promise<AnthropicTypes.MessageResponse> {
    return this.post<AnthropicTypes.MessageResponse>('messages', request);
  }

  /**
   * Simplified method for generating text from a single prompt
   * @param prompt - User prompt text
   * @param systemPrompt - System instructions for Claude
   * @param model - Claude model ID to use
   * @param options - Additional message options
   * @return Generated text response
   */
  async generateText(
    prompt: string,
    systemPrompt: string = "",
    model: string = "claude-3-sonnet-20240229",
    options: Partial<AnthropicTypes.MessageRequest> = {}
  ): Promise<string> {
    const response = await this.createMessage({
      model,
      messages: [{ role: 'user', content: prompt }],
      system: systemPrompt,
      max_tokens: 1024,
      temperature: 0.7,
      ...options
    });

    const textContent = response.content
      .filter(block => block.type === 'text' && block.text)
      .map(block => block.text)
      .join('');
    
    return textContent;
  }
  
  /**
   * Tests the API connection by making a minimal request
   * @return True if connection is successful
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.createMessage({
        model: 'claude-3-haiku-20240307',
        messages: [{ role: 'user', content: 'Hello, are you working?' }],
        max_tokens: 10
      });
      
      return response.id !== undefined;
    } catch (error) {
      console.error('Anthropic API connection test failed:', error);
      return false;
    }
  }

  /**
   * Generates a completion with usage statistics for cross-provider compatibility
   * @param prompt - Text prompt to complete
   * @param model - Claude model ID to use
   * @param maxTokens - Maximum tokens to generate
   * @param temperature - Sampling temperature (0-1)
   * @return Generated content and usage metrics
   */
  async generateCompletion(
    prompt: string,
    model: string = "claude-3-sonnet-20240229",
    maxTokens?: number,
    temperature?: number
  ): Promise<{ content: string; usage?: { total_tokens: number } }> {
    const response = await this.createMessage({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens || 1024,
      temperature: temperature !== undefined ? temperature : 0.7
    });

    const textContent = response.content
      .filter(block => block.type === 'text' && block.text)
      .map(block => block.text)
      .join('');

    return {
      content: textContent,
      usage: response.usage ? { total_tokens: response.usage.input_tokens + response.usage.output_tokens } : undefined
    };
  }
}
