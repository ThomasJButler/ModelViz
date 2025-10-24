/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description OpenAI API client that handles authentication, request formation, and response parsing for GPT models
 */

import { ApiClient } from '../apiClient';
import * as OpenAITypes from '../types/openai';

export class OpenAIClient extends ApiClient {
  constructor(apiKey: string) {
    super('https://api.openai.com/v1', {
      'Authorization': `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v1'
    });
  }

  /**
   * Lists all available OpenAI models
   * @return List of available models with metadata
   */
  async listModels(): Promise<OpenAITypes.ListModelsResponse> {
    return this.get<OpenAITypes.ListModelsResponse>('models');
  }

  /**
   * Retrieves details for a specific model
   * @param modelId - ID of the model to retrieve
   * @return Model details
   */
  async getModel(modelId: string): Promise<OpenAITypes.Model> {
    return this.get<OpenAITypes.Model>(`models/${modelId}`);
  }

  /**
   * Creates a chat completion using GPT models
   * @param request - Chat completion request parameters
   * @return Generated completion response
   */
  async createChatCompletion(
    request: OpenAITypes.ChatCompletionRequest
  ): Promise<OpenAITypes.ChatCompletionResponse> {
    return this.post<OpenAITypes.ChatCompletionResponse>('chat/completions', request);
  }

  /**
   * Generates embeddings for semantic similarity and search
   * @param request - Embedding request parameters
   * @return Vector embeddings for the input text
   */
  async createEmbeddings(
    request: OpenAITypes.EmbeddingRequest
  ): Promise<OpenAITypes.EmbeddingResponse> {
    return this.post<OpenAITypes.EmbeddingResponse>('embeddings', request);
  }

  /**
   * Analyses content for policy violations using the moderation API
   * @param request - Moderation request with content to check
   * @return Moderation results with flagged categories
   */
  async createModeration(
    request: OpenAITypes.ModerationRequest
  ): Promise<OpenAITypes.ModerationResponse> {
    return this.post<OpenAITypes.ModerationResponse>('moderations', request);
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
    systemPrompt: string = "You are a helpful assistant.",
    model: string = "gpt-3.5-turbo",
    options: Partial<OpenAITypes.ChatCompletionRequest> = {}
  ): Promise<string> {
    const messages: OpenAITypes.Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ];

    const response = await this.createChatCompletion({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1000,
      ...options
    });

    return response.choices[0]?.message?.content || '';
  }

  /**
   * Generates an embedding vector for a single text string
   * @param text - Text to generate embedding for
   * @param model - Embedding model to use
   * @return Embedding vector as array of numbers
   */
  async generateEmbedding(
    text: string,
    model: string = "text-embedding-ada-002"
  ): Promise<number[]> {
    const response = await this.createEmbeddings({
      model,
      input: text
    });

    return response.data[0].embedding;
  }

  /**
   * Generates a completion with usage statistics for cross-provider compatibility
   * @param prompt - Text prompt to complete
   * @param model - Model ID to use
   * @param maxTokens - Maximum tokens to generate
   * @param temperature - Sampling temperature (0-2)
   * @return Generated content and usage metrics
   */
  async generateCompletion(
    prompt: string,
    model: string = "gpt-3.5-turbo",
    maxTokens?: number,
    temperature?: number
  ): Promise<{ content: string; usage?: { total_tokens: number } }> {
    const response = await this.createChatCompletion({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens || 1000,
      temperature: temperature !== undefined ? temperature : 0.7
    });

    return {
      content: response.choices[0]?.message?.content || '',
      usage: response.usage
    };
  }
}
