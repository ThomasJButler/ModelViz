/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description TypeScript type definitions for Perplexity AI API requests and responses
 */

// Basic types
export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
}

export interface FunctionDefinition {
  name: string;
  description?: string;
  parameters: Record<string, any>;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

// Request types
export interface ChatCompletionRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
  tools?: FunctionDefinition[];
  tool_choice?: 'auto' | 'none' | { function: { name: string } };
}

// Response types
export interface ChatCompletionResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string | null;
      tool_calls?: ToolCall[];
    };
    logprobs: any;
    finish_reason: 'stop' | 'length' | 'tool_calls';
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Model related types
export interface ModelObject {
  id: string;
  name: string;
  description: string;
  context_length: number;
  capabilities: string[];
}

export interface ListModelsResponse {
  models: ModelObject[];
}
