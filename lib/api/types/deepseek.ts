/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description TypeScript type definitions for DeepSeek AI API requests and responses
 */

// Basic types
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
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

export interface ToolResult {
  tool_call_id: string;
  role: 'tool';
  content: string;
}

// Request types
export interface ChatCompletionRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
  tools?: FunctionDefinition[];
  tool_choice?: 'auto' | 'none' | { function: { name: string } };
  presence_penalty?: number;
  frequency_penalty?: number;
  stop?: string[];
  user?: string;
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
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter';
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
  object: 'model';
  created: number;
  owned_by: string;
}

export interface ListModelsResponse {
  object: 'list';
  data: ModelObject[];
}
