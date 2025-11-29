/**
 * @file modelComparison.ts
 * @description Type definitions for the Model Comparison Tool
 * @author Assistant
 * @date 2024-11-23
 */

import { ModelProvider } from './modelBuilder';

export interface ComparisonModel {
  id: string;
  provider: ModelProvider;
  name: string;
  version?: string;
  settings?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  };
}

export interface ComparisonSession {
  id: string;
  name: string;
  description?: string;
  prompt: string;
  systemPrompt?: string;
  models: ComparisonModel[];
  results?: ComparisonResult[];
  metadata: {
    created: Date;
    completed?: Date;
    saved: boolean;
    tags?: string[];
  };
}

export interface ComparisonResult {
  sessionId: string;
  modelId: string;
  provider: ModelProvider;
  modelName: string;
  response: string;
  error?: string;
  metrics: {
    latency: number;
    tokens: {
      input: number;
      output: number;
    };
    cost: number;
    timestamp: Date;
  };
  qualityMetrics?: {
    coherence: number;      // 0-1 score
    relevance: number;      // 0-1 score
    completeness: number;   // 0-1 score
    accuracy?: number;      // 0-1 score (if reference available)
  };
}

export interface ComparisonAnalysis {
  sessionId: string;
  rankings: {
    speed: string[];        // Model IDs ordered by speed
    cost: string[];         // Model IDs ordered by cost efficiency
    quality: string[];      // Model IDs ordered by quality score
    overall: string[];      // Model IDs ordered by overall performance
  };
  metrics: {
    fastest: {
      modelId: string;
      latency: number;
    };
    cheapest: {
      modelId: string;
      cost: number;
    };
    highestQuality: {
      modelId: string;
      score: number;
    };
  };
  recommendations: {
    bestOverall: string;
    bestValue: string;      // Best quality/cost ratio
    fastestAcceptable: string; // Fastest with quality > threshold
  };
  costProjection: {
    per1000Calls: Record<string, number>;
    per1MTokens: Record<string, number>;
  };
}

export interface ComparisonExport {
  session: ComparisonSession;
  results: ComparisonResult[];
  analysis: ComparisonAnalysis;
  exportDate: Date;
  format: 'json' | 'markdown' | 'csv';
}

export interface ComparisonFilters {
  providers?: ModelProvider[];
  maxCost?: number;
  maxLatency?: number;
  minQuality?: number;
  models?: string[];
}

export interface ComparisonDiff {
  modelA: string;
  modelB: string;
  differences: {
    type: 'addition' | 'deletion' | 'modification';
    content: string;
    position?: number;
  }[];
  similarity: number; // 0-1 score
}