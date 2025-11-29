/**
 * @file ModelBlendService.ts
 * @description Service for executing and managing blended model configurations
 * @author Assistant
 * @date 2024-11-23
 */

import {
  BlendedModelConfig,
  BlendExecutionRequest,
  BlendExecutionResult,
  ModelExecutionResult,
  BlendPerformanceStats,
  AggregationStrategy,
  ModelBlendEntry,
} from '@/lib/types/modelBuilder';
import { MetricsService } from './MetricsService';
import { generatePlaygroundResponse } from '@/lib/playground/api';
import { calculateCost, estimateTokens } from '@/lib/utils/costCalculator';

export class ModelBlendService {
  private static instance: ModelBlendService | null = null;
  private metricsService: MetricsService;
  private activeExecutions: Map<string, AbortController> = new Map();

  private constructor() {
    this.metricsService = MetricsService.getInstance();
  }

  static getInstance(): ModelBlendService {
    if (!ModelBlendService.instance) {
      ModelBlendService.instance = new ModelBlendService();
    }
    return ModelBlendService.instance;
  }

  /**
   * Execute a blended model configuration
   */
  async executeBlend(
    config: BlendedModelConfig,
    request: BlendExecutionRequest
  ): Promise<BlendExecutionResult> {
    const startTime = Date.now();
    const executionId = `blend-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    try {
      // Validate configuration
      this.validateBlendConfig(config);

      // Execute models in parallel
      const modelResults = await this.executeModelsParallel(
        config.models,
        request.prompt,
        request.systemPrompt,
        request.settings || config.settings
      );

      // Aggregate responses based on strategy
      const aggregatedResponse = await this.aggregateResponses(
        modelResults,
        config.aggregationStrategy,
        config.models
      );

      // Calculate combined metrics
      const metrics = this.calculateBlendMetrics(modelResults);

      // Record metrics
      await this.recordBlendMetrics(config.id, metrics, modelResults);

      const result: BlendExecutionResult = {
        blendId: config.id,
        request,
        results: modelResults,
        aggregatedResponse,
        aggregationMetadata: {
          strategy: config.aggregationStrategy,
          confidence: this.calculateConfidence(modelResults, config.aggregationStrategy),
        },
        metrics: {
          ...metrics,
          totalLatency: Date.now() - startTime,
        },
        timestamp: new Date(),
      };

      // Update blend usage stats
      await this.updateBlendStats(config.id, result);

      return result;
    } catch (error) {
      console.error('[ModelBlendService] Execution failed:', error);
      throw error;
    } finally {
      this.activeExecutions.delete(executionId);
    }
  }

  /**
   * Execute multiple models in parallel
   */
  private async executeModelsParallel(
    models: ModelBlendEntry[],
    prompt: string,
    systemPrompt?: string,
    settings?: any
  ): Promise<ModelExecutionResult[]> {
    const executionPromises = models.map(async (model) => {
      const startTime = Date.now();

      try {
        // Adjust prompt based on weight if needed
        const adjustedPrompt = this.adjustPromptForWeight(prompt, model.weight);

        // Call the API
        const apiResponse = await generatePlaygroundResponse({
          provider: model.provider,
          modelId: model.modelId,
          input: JSON.stringify({
            system: systemPrompt || '',
            input: adjustedPrompt,
          }),
          inputFormat: 'json',
          temperature: model.settings?.temperature || settings?.temperature,
          maxTokens: model.settings?.maxTokens || settings?.maxTokens,
        });

        const response = apiResponse.content;

        // Calculate tokens using the utility function
        const inputTokens = estimateTokens((systemPrompt || '') + prompt);
        const outputTokens = estimateTokens(response);

        // Calculate cost
        const cost = calculateCost(
          model.provider,
          model.modelId,
          inputTokens,
          outputTokens
        );

        return {
          modelId: model.modelId,
          provider: model.provider,
          response,
          latency: Date.now() - startTime,
          tokens: {
            input: inputTokens,
            output: outputTokens,
          },
          cost,
          timestamp: new Date(),
        } as ModelExecutionResult;
      } catch (error) {
        return {
          modelId: model.modelId,
          provider: model.provider,
          error: error instanceof Error ? error.message : 'Unknown error',
          latency: Date.now() - startTime,
          tokens: { input: 0, output: 0 },
          cost: 0,
          timestamp: new Date(),
        } as ModelExecutionResult;
      }
    });

    return Promise.all(executionPromises);
  }

  /**
   * Aggregate responses based on strategy
   */
  private async aggregateResponses(
    results: ModelExecutionResult[],
    strategy: AggregationStrategy,
    models: ModelBlendEntry[]
  ): Promise<string> {
    // Filter out failed results
    const successfulResults = results.filter(r => !r.error && r.response);

    if (successfulResults.length === 0) {
      throw new Error('All models failed to generate a response');
    }

    switch (strategy) {
      case 'first-success':
        return this.firstSuccessAggregation(successfulResults);

      case 'weighted':
        return this.weightedAggregation(successfulResults, models);

      case 'consensus':
        return this.consensusAggregation(successfulResults);

      case 'best-of':
        return this.bestOfAggregation(successfulResults);

      default:
        return successfulResults[0].response || '';
    }
  }

  /**
   * First successful response
   */
  private firstSuccessAggregation(results: ModelExecutionResult[]): string {
    const fastest = results.reduce((prev, curr) =>
      prev.latency < curr.latency ? prev : curr
    );
    return fastest.response || '';
  }

  /**
   * Weighted aggregation based on model weights
   */
  private weightedAggregation(
    results: ModelExecutionResult[],
    models: ModelBlendEntry[]
  ): string {
    // For now, return the response from the model with highest weight
    // In production, this could do semantic merging
    const modelWeights = new Map(models.map(m => [m.modelId, m.weight]));

    const weightedResults = results
      .filter(r => r.response)
      .sort((a, b) => {
        const weightA = modelWeights.get(a.modelId) || 0;
        const weightB = modelWeights.get(b.modelId) || 0;
        return weightB - weightA;
      });

    if (weightedResults.length === 0) return '';

    // Simple approach: Use highest weighted successful response
    // Advanced: Merge responses proportionally
    return weightedResults[0].response || '';
  }

  /**
   * Consensus-based aggregation
   */
  private consensusAggregation(results: ModelExecutionResult[]): string {
    // Simple approach: Find common themes/patterns
    // For now, return the median-length response
    const validResponses = results
      .filter(r => r.response)
      .sort((a, b) => (a.response?.length || 0) - (b.response?.length || 0));

    if (validResponses.length === 0) return '';

    const medianIndex = Math.floor(validResponses.length / 2);
    return validResponses[medianIndex].response || '';
  }

  /**
   * Best-of aggregation based on quality metrics
   */
  private bestOfAggregation(results: ModelExecutionResult[]): string {
    // Score each response based on multiple factors
    const scoredResults = results
      .filter(r => r.response)
      .map(result => {
        let score = 0;

        // Penalize high latency
        score += (1000 - Math.min(result.latency, 1000)) / 1000 * 0.3;

        // Reward appropriate response length
        const responseLength = result.response?.length || 0;
        if (responseLength > 100 && responseLength < 2000) {
          score += 0.3;
        }

        // Consider cost efficiency
        score += (1 - Math.min(result.cost, 1)) * 0.2;

        // Bonus for no errors
        score += 0.2;

        return { result, score };
      })
      .sort((a, b) => b.score - a.score);

    if (scoredResults.length === 0) return '';

    return scoredResults[0].result.response || '';
  }

  /**
   * Calculate confidence score for aggregation
   */
  private calculateConfidence(
    results: ModelExecutionResult[],
    strategy: AggregationStrategy
  ): number {
    const successRate = results.filter(r => !r.error).length / results.length;

    switch (strategy) {
      case 'consensus':
        // Higher confidence if responses are similar
        return successRate * 0.8;

      case 'weighted':
        // Confidence based on success rate
        return successRate;

      case 'first-success':
        // Binary confidence
        return successRate > 0 ? 1 : 0;

      case 'best-of':
        // Confidence based on quality spread
        return Math.min(successRate * 1.2, 1);

      default:
        return successRate;
    }
  }

  /**
   * Calculate combined metrics for the blend
   */
  private calculateBlendMetrics(results: ModelExecutionResult[]) {
    return {
      totalCost: results.reduce((sum, r) => sum + r.cost, 0),
      totalTokens: {
        input: results.reduce((sum, r) => sum + r.tokens.input, 0),
        output: results.reduce((sum, r) => sum + r.tokens.output, 0),
      },
    };
  }

  /**
   * Record metrics for analytics
   */
  private async recordBlendMetrics(
    blendId: string,
    metrics: any,
    results: ModelExecutionResult[]
  ): Promise<void> {
    // Record each model's performance
    for (const result of results) {
      await this.metricsService.recordMetric({
        timestamp: Date.now(),
        provider: result.provider,
        model: result.modelId,
        inputFormat: 'json',
        latency: result.latency,
        tokensUsed: result.tokens.input + result.tokens.output,
        promptTokens: result.tokens.input,
        completionTokens: result.tokens.output,
        status: result.error ? 'error' : 'success',
        errorMessage: result.error,
        estimatedCost: result.cost,
        promptLength: 0, // We'll need to track this properly later
        responseLength: result.response?.length || 0,
      });
    }
  }

  /**
   * Update blend performance statistics
   */
  private async updateBlendStats(
    blendId: string,
    result: BlendExecutionResult
  ): Promise<void> {
    // This would update stored statistics
    // For now, we'll use localStorage
    const statsKey = `blend-stats-${blendId}`;
    const existingStats = localStorage.getItem(statsKey);

    let stats: BlendPerformanceStats;

    if (existingStats) {
      stats = JSON.parse(existingStats);
      stats.totalExecutions += 1;
      stats.avgLatency = (stats.avgLatency * (stats.totalExecutions - 1) + result.metrics.totalLatency) / stats.totalExecutions;
      stats.avgCost = (stats.avgCost * (stats.totalExecutions - 1) + result.metrics.totalCost) / stats.totalExecutions;
    } else {
      stats = {
        blendId,
        totalExecutions: 1,
        successRate: result.results.filter(r => !r.error).length / result.results.length,
        avgLatency: result.metrics.totalLatency,
        avgCost: result.metrics.totalCost,
        avgTokens: {
          input: result.metrics.totalTokens.input,
          output: result.metrics.totalTokens.output,
        },
        modelPerformance: {},
        lastUpdated: new Date(),
      };
    }

    localStorage.setItem(statsKey, JSON.stringify(stats));
  }

  /**
   * Validate blend configuration
   */
  private validateBlendConfig(config: BlendedModelConfig): void {
    if (!config.models || config.models.length === 0) {
      throw new Error('Blend must have at least one model');
    }

    if (config.models.length > 3) {
      throw new Error('Blend cannot have more than 3 models');
    }

    const totalWeight = config.models.reduce((sum, m) => sum + m.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error('Model weights must sum to 100%');
    }
  }

  /**
   * Adjust prompt based on model weight (optional)
   */
  private adjustPromptForWeight(prompt: string, weight: number): string {
    // For now, return the original prompt
    // Could implement prompt trimming for lower-weight models
    return prompt;
  }

  /**
   * Cancel an active blend execution
   */
  cancelExecution(executionId: string): void {
    const controller = this.activeExecutions.get(executionId);
    if (controller) {
      controller.abort();
      this.activeExecutions.delete(executionId);
    }
  }
}