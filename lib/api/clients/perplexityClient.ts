/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Perplexity API client with support for online search-enabled Sonar models
 */

import { ApiClient } from '../apiClient';
import * as PerplexityTypes from '../types/perplexity';

export class PerplexityClient extends ApiClient {
  constructor(apiKey: string) {
    super('https://api.perplexity.ai', {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });
  }
  
  /**
   * Lists available Perplexity models
   * Returns a static list as Perplexity doesn't provide a models endpoint
   * @return Array of available models with their capabilities
   */
  async listModels(): Promise<PerplexityTypes.ModelObject[]> {
    return [
      {
        id: 'sonar-small-online',
        name: 'Sonar Small (Online)',
        description: 'Fast model with internet search capabilities',
        context_length: 12000,
        capabilities: ['web_search', 'coding', 'summarization']
      },
      {
        id: 'sonar-medium-online',
        name: 'Sonar Medium (Online)',
        description: 'Balanced model with internet search capabilities',
        context_length: 12000,
        capabilities: ['web_search', 'coding', 'summarization', 'analysis']
      },
      {
        id: 'sonar-large-online',
        name: 'Sonar Large (Online)',
        description: 'Most powerful model with internet search capabilities',
        context_length: 12000,
        capabilities: ['web_search', 'coding', 'summarization', 'analysis', 'creative_writing']
      },
      {
        id: 'mistral-7b-instruct',
        name: 'Mistral 7B Instruct',
        description: 'Lightweight model for basic tasks',
        context_length: 8000,
        capabilities: ['coding', 'conversation', 'instruction_following']
      },
      {
        id: 'llama-3-8b-instruct',
        name: 'Llama-3 8B Instruct',
        description: 'Small, efficient model for various tasks',
        context_length: 8000,
        capabilities: ['coding', 'conversation', 'instruction_following']
      },
      {
        id: 'llama-3-70b-instruct',
        name: 'Llama-3 70B Instruct',
        description: 'Powerful general purpose model',
        context_length: 8000,
        capabilities: ['coding', 'conversation', 'instruction_following', 'reasoning']
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
    return this.post<PerplexityTypes.ChatCompletionResponse>('/chat/completions', request);
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
    model: string = "llama-3-70b-instruct",
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
   * Generates text using Sonar models with real-time web search
   * Only works with Sonar models that have internet access
   * @param query - Search query or prompt
   * @param systemPrompt - System instructions for the model
   * @param model - Sonar model ID to use
   * @param options - Additional completion options
   * @return Generated text with current information from the web
   */
  async searchAndGenerateText(
    query: string,
    systemPrompt: string = "",
    model: string = "sonar-medium-online",
    options: Partial<PerplexityTypes.ChatCompletionRequest> = {}
  ): Promise<string> {
    if (!model.includes('sonar')) {
      console.warn('Search capability is only available with Sonar models');
      model = 'sonar-medium-online';
    }
    
    return this.generateText(query, systemPrompt, model, options);
  }
  
  /**
   * Tests the API connection by making a minimal request
   * @return True if connection is successful
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.createChatCompletion({
        model: 'mistral-7b-instruct', // Use a lightweight model for testing
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
