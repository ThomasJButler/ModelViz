/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description TypeScript type definitions for Anthropic Claude API requests and responses
 */

// Basic types
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Tool {
  name: string;
  description?: string;
  input_schema: Record<string, any>;
}

export interface ToolUse {
  id: string;
  name: string;
  input: Record<string, any>;
}

export interface ToolResult {
  tool_use_id: string;
  content: string;
}

// Request types
export interface MessageRequest {
  model: string;
  messages: Message[];
  system?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stop_sequences?: string[];
  stream?: boolean;
  tools?: Tool[];
  tool_choice?: 'auto' | 'any' | { name: string };
  metadata?: Record<string, string>;
}

// Response types
export interface ContentBlock {
  type: 'text' | 'tool_use' | 'tool_result';
  text?: string;
  tool_use?: ToolUse;
  tool_result?: ToolResult;
}

export interface MessageResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: ContentBlock[];
  model: string;
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use';
  stop_sequence?: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

// Model related types
export interface ModelObject {
  name: string;
  description?: string;
  context_window: number;
  max_tokens: number;
}

export interface ListModelsResponse {
  models: ModelObject[];
}
