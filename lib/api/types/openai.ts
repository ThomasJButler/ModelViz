/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description TypeScript type definitions for OpenAI GPT API requests and responses
 */

// Basic types used throughout the API
export type Role = 'system' | 'user' | 'assistant' | 'function' | 'tool';

export interface Message {
  role: Role;
  content: string | null;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
  tool_calls?: {
    id: string;
    type: string;
    function: {
      name: string;
      arguments: string;
    };
  }[];
}

export interface Choice {
  index: number;
  message: Message;
  finish_reason: 'stop' | 'length' | 'function_call' | 'content_filter' | 'tool_calls' | null;
}

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

// Models endpoint
export interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export interface ListModelsResponse {
  object: string;
  data: Model[];
}

// Chat completions endpoint
export interface ChatCompletionRequest {
  model: string;
  messages: Message[];
  functions?: Array<{
    name: string;
    description?: string;
    parameters: Record<string, any>;
  }>;
  function_call?: 'auto' | 'none' | { name: string };
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
  stop?: string | string[];
  max_tokens?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  logit_bias?: Record<string, number>;
  user?: string;
  tools?: Array<{
    type: 'function';
    function: {
      name: string;
      description?: string;
      parameters: Record<string, any>;
    };
  }>;
  tool_choice?: 'auto' | 'none' | {
    type: 'function';
    function: {
      name: string;
    };
  };
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Choice[];
  usage: Usage;
}

// Embeddings endpoint
export interface EmbeddingRequest {
  model: string;
  input: string | string[];
  user?: string;
  encoding_format?: 'float' | 'base64';
}

export interface EmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

// Moderation endpoint
export interface ModerationRequest {
  input: string | string[];
  model?: string;
}

export interface ModerationResponse {
  id: string;
  model: string;
  results: Array<{
    categories: Record<string, boolean>;
    category_scores: Record<string, number>;
    flagged: boolean;
  }>;
}
