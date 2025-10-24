/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description DeepSeek API client with specialised models for chat and code generation
 */

import { ApiClient } from '../apiClient';
import * as DeepSeekTypes from '../types/deepseek';

export class DeepSeekClient extends ApiClient {
  constructor(apiKey: string) {
    super('https://api.deepseek.com/v1', {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });
  }
  
  /**
   * Lists available DeepSeek models
   * Attempts API call first, falls back to static list if unavailable
   * @return Array of available models
   */
  async listModels(): Promise<DeepSeekTypes.ModelObject[]> {
    try {
      const response = await this.get<DeepSeekTypes.ListModelsResponse>('models');
      return response.data;
    } catch (error) {
      console.warn('Could not fetch DeepSeek models, returning hardcoded list');
      return [
        {
          id: 'deepseek-chat',
          object: 'model',
          created: Date.now(),
          owned_by: 'deepseek'
        },
        {
          id: 'deepseek-coder',
          object: 'model',
          created: Date.now(),
          owned_by: 'deepseek'
        },
        {
          id: 'deepseek-lite',
          object: 'model',
          created: Date.now(),
          owned_by: 'deepseek'
        }
      ];
    }
  }
  
  /**
   * Creates a chat completion using DeepSeek models
   * @param request - Chat completion request parameters
   * @return Generated completion response
   */
  async createChatCompletion(
    request: DeepSeekTypes.ChatCompletionRequest
  ): Promise<DeepSeekTypes.ChatCompletionResponse> {
    return this.post<DeepSeekTypes.ChatCompletionResponse>('chat/completions', request);
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
    model: string = "deepseek-chat",
    options: Partial<DeepSeekTypes.ChatCompletionRequest> = {}
  ): Promise<string> {
    // Build messages array
    const messages: DeepSeekTypes.Message[] = [];
    
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
   * Tests the API connection by making a minimal request
   * @return True if connection is successful
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try a minimal API call to validate the key
      const response = await this.createChatCompletion({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Hello!' }],
        max_tokens: 10
      });
      
      return response.id !== undefined;
    } catch (error) {
      console.error('DeepSeek API connection test failed:', error);
      return false;
    }
  }
}
