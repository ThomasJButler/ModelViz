/**
 * @author Tom Butler
 * @date 2025-01-23
 * @description TypeScript type definitions for Google Gemini API requests and responses
 */

// Basic types
export interface Part {
  text?: string;
  inline_data?: {
    mime_type: string;
    data: string;
  };
}

export interface Content {
  role?: 'user' | 'model';
  parts: Part[];
}

export interface SafetySetting {
  category: 'HARM_CATEGORY_HARASSMENT' | 'HARM_CATEGORY_HATE_SPEECH' | 'HARM_CATEGORY_SEXUALLY_EXPLICIT' | 'HARM_CATEGORY_DANGEROUS_CONTENT';
  threshold: 'BLOCK_NONE' | 'BLOCK_LOW_AND_ABOVE' | 'BLOCK_MEDIUM_AND_ABOVE' | 'BLOCK_ONLY_HIGH';
}

export interface GenerationConfig {
  temperature?: number;
  top_p?: number;
  top_k?: number;
  max_output_tokens?: number;
  stop_sequences?: string[];
  candidate_count?: number;
}

// Request types
export interface GenerateContentRequest {
  contents: Content[];
  generation_config?: GenerationConfig;
  safety_settings?: SafetySetting[];
}

// Response types
export interface SafetyRating {
  category: string;
  probability: 'NEGLIGIBLE' | 'LOW' | 'MEDIUM' | 'HIGH';
  blocked?: boolean;
}

export interface Candidate {
  content: Content;
  finish_reason?: 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'RECITATION' | 'OTHER';
  safety_ratings?: SafetyRating[];
  citation_metadata?: {
    citation_sources: Array<{
      start_index: number;
      end_index: number;
      uri?: string;
      license?: string;
    }>;
  };
}

export interface UsageMetadata {
  prompt_token_count: number;
  candidates_token_count: number;
  total_token_count: number;
}

export interface GenerateContentResponse {
  candidates: Candidate[];
  prompt_feedback?: {
    block_reason?: string;
    safety_ratings?: SafetyRating[];
  };
  usage_metadata?: UsageMetadata;
}

// Model related types
export interface ModelObject {
  name: string;
  display_name: string;
  description?: string;
  input_token_limit?: number;
  output_token_limit?: number;
  supported_generation_methods?: string[];
}

export interface ListModelsResponse {
  models: ModelObject[];
}
