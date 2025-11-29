/**
 * @file modelBuilder.ts
 * @description Type definitions for the Custom Model Builder feature
 * @author Assistant
 * @date 2024-11-23
 */

export type AggregationStrategy =
  | 'consensus'      // Compare responses and pick most common
  | 'weighted'       // Combine based on model weights
  | 'first-success'  // Return first successful response
  | 'best-of';       // Use quality metrics to pick best

export type ModelProvider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'mistral'
  | 'perplexity'
  | 'groq'
  | 'deepseek';

export interface ModelBlendEntry {
  modelId: string;
  provider: ModelProvider;
  weight: number; // Percentage (0-100)
  settings?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  };
}

export interface BlendedModelConfig {
  id: string;
  name: string;
  description?: string;
  models: ModelBlendEntry[]; // Max 3 models
  aggregationStrategy: AggregationStrategy;
  settings: {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  };
  metadata: {
    created: Date;
    lastUsed?: Date;
    totalCalls: number;
    avgLatency?: number;
    avgCost?: number;
  };
}

export interface BlendExecutionRequest {
  blendId: string;
  prompt: string;
  systemPrompt?: string;
  settings?: {
    temperature?: number;
    maxTokens?: number;
  };
}

export interface ModelExecutionResult {
  modelId: string;
  provider: ModelProvider;
  response?: string;
  error?: string;
  latency: number;
  tokens: {
    input: number;
    output: number;
  };
  cost: number;
  timestamp: Date;
}

export interface BlendExecutionResult {
  blendId: string;
  request: BlendExecutionRequest;
  results: ModelExecutionResult[];
  aggregatedResponse: string;
  aggregationMetadata?: {
    strategy: AggregationStrategy;
    confidence?: number;
    reasoning?: string;
  };
  metrics: {
    totalLatency: number;
    totalCost: number;
    totalTokens: {
      input: number;
      output: number;
    };
  };
  timestamp: Date;
}

export interface BlendPerformanceStats {
  blendId: string;
  totalExecutions: number;
  successRate: number;
  avgLatency: number;
  avgCost: number;
  avgTokens: {
    input: number;
    output: number;
  };
  modelPerformance: Record<string, {
    successRate: number;
    avgLatency: number;
    avgCost: number;
  }>;
  lastUpdated: Date;
}