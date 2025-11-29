/**
 * @file ComparisonService.ts
 * @description Service for comparing multiple AI models with the same prompt
 * @author Assistant
 * @date 2024-11-23
 */

import {
  ComparisonSession,
  ComparisonResult,
  ComparisonAnalysis,
  ComparisonModel,
  ComparisonExport,
  ComparisonFilters,
} from '@/lib/types/modelComparison';
import { MetricsService } from './MetricsService';
import { generatePlaygroundResponse } from '@/lib/playground/api';
import { calculateCost, estimateTokens } from '@/lib/utils/costCalculator';

const STORAGE_KEY = 'modelviz-comparison-sessions';
const MAX_SESSIONS = 50;

export class ComparisonService {
  private static instance: ComparisonService | null = null;
  private metricsService: MetricsService;
  private activeComparisons: Map<string, AbortController> = new Map();

  private constructor() {
    this.metricsService = MetricsService.getInstance();
  }

  static getInstance(): ComparisonService {
    if (!ComparisonService.instance) {
      ComparisonService.instance = new ComparisonService();
    }
    return ComparisonService.instance;
  }

  /**
   * Execute a comparison across multiple models
   */
  async executeComparison(
    session: ComparisonSession
  ): Promise<ComparisonResult[]> {
    const sessionId = session.id;
    const controller = new AbortController();
    this.activeComparisons.set(sessionId, controller);

    try {
      // Execute all models in parallel
      const resultPromises = session.models.map(async (model) => {
        return this.executeModel(
          model,
          session.prompt,
          session.systemPrompt,
          sessionId,
          controller.signal
        );
      });

      const results = await Promise.all(resultPromises);

      // Calculate quality metrics for each result
      const resultsWithQuality = await this.calculateQualityMetrics(results);

      // Update session with results
      session.results = resultsWithQuality;
      session.metadata.completed = new Date();

      // Save session if marked
      if (session.metadata.saved) {
        await this.saveSession(session);
      }

      // Record metrics
      await this.recordComparisonMetrics(resultsWithQuality);

      // Dispatch event for UI updates
      window.dispatchEvent(new CustomEvent('comparison-completed', {
        detail: { sessionId, results: resultsWithQuality }
      }));

      return resultsWithQuality;
    } finally {
      this.activeComparisons.delete(sessionId);
    }
  }

  /**
   * Execute a single model
   */
  private async executeModel(
    model: ComparisonModel,
    prompt: string,
    systemPrompt: string | undefined,
    sessionId: string,
    signal: AbortSignal
  ): Promise<ComparisonResult> {
    const startTime = Date.now();

    try {
      // Check if aborted
      if (signal.aborted) {
        throw new Error('Comparison cancelled');
      }

      // Call the API
      const apiResponse = await generatePlaygroundResponse({
        provider: model.provider,
        modelId: model.id,
        input: JSON.stringify({
          system: systemPrompt || '',
          input: prompt,
        }),
        inputFormat: 'json',
        temperature: model.settings?.temperature,
        maxTokens: model.settings?.maxTokens,
      });

      const response = apiResponse.content;

      // Calculate tokens using the utility function
      const inputTokens = estimateTokens((systemPrompt || '') + prompt);
      const outputTokens = estimateTokens(response);

      // Calculate cost
      const cost = calculateCost(
        model.provider,
        model.id,
        inputTokens,
        outputTokens
      );

      return {
        sessionId,
        modelId: model.id,
        provider: model.provider,
        modelName: model.name,
        response,
        metrics: {
          latency: Date.now() - startTime,
          tokens: {
            input: inputTokens,
            output: outputTokens,
          },
          cost,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      return {
        sessionId,
        modelId: model.id,
        provider: model.provider,
        modelName: model.name,
        response: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        metrics: {
          latency: Date.now() - startTime,
          tokens: { input: 0, output: 0 },
          cost: 0,
          timestamp: new Date(),
        },
      };
    }
  }

  /**
   * Calculate quality metrics for responses
   */
  private async calculateQualityMetrics(
    results: ComparisonResult[]
  ): Promise<ComparisonResult[]> {
    return results.map(result => {
      if (result.error || !result.response) {
        return result;
      }

      // Simple heuristic-based quality scoring
      const response = result.response;
      const responseLength = response.length;

      // Coherence: Check for structured response
      const hasStructure = response.includes('\n') || response.includes('. ');
      const coherence = hasStructure ? 0.8 : 0.5;

      // Relevance: Basic check (would need NLP in production)
      const relevance = responseLength > 50 ? 0.7 : 0.4;

      // Completeness: Based on response length
      const completeness = Math.min(responseLength / 500, 1);

      return {
        ...result,
        qualityMetrics: {
          coherence,
          relevance,
          completeness,
          accuracy: undefined, // Would need reference answer
        },
      };
    });
  }

  /**
   * Analyze comparison results
   */
  async analyzeResults(
    sessionId: string,
    results: ComparisonResult[]
  ): Promise<ComparisonAnalysis> {
    // Filter successful results
    const successfulResults = results.filter(r => !r.error);

    if (successfulResults.length === 0) {
      throw new Error('No successful results to analyze');
    }

    // Sort by various metrics
    const bySpeed = [...successfulResults].sort((a, b) =>
      a.metrics.latency - b.metrics.latency
    );
    const byCost = [...successfulResults].sort((a, b) =>
      a.metrics.cost - b.metrics.cost
    );
    const byQuality = [...successfulResults].sort((a, b) => {
      const aScore = this.calculateOverallQuality(a.qualityMetrics);
      const bScore = this.calculateOverallQuality(b.qualityMetrics);
      return bScore - aScore;
    });

    // Calculate projections
    const costProjection: Record<string, number> = {};
    const tokenProjection: Record<string, number> = {};

    successfulResults.forEach(result => {
      costProjection[result.modelId] = result.metrics.cost * 1000;
      tokenProjection[result.modelId] =
        (result.metrics.cost / result.metrics.tokens.output) * 1000000;
    });

    // Determine recommendations
    const bestOverall = this.selectBestOverall(successfulResults);
    const bestValue = this.selectBestValue(successfulResults);
    const fastestAcceptable = this.selectFastestAcceptable(successfulResults);

    return {
      sessionId,
      rankings: {
        speed: bySpeed.map(r => r.modelId),
        cost: byCost.map(r => r.modelId),
        quality: byQuality.map(r => r.modelId),
        overall: [bestOverall, ...successfulResults
          .filter(r => r.modelId !== bestOverall)
          .map(r => r.modelId)],
      },
      metrics: {
        fastest: {
          modelId: bySpeed[0].modelId,
          latency: bySpeed[0].metrics.latency,
        },
        cheapest: {
          modelId: byCost[0].modelId,
          cost: byCost[0].metrics.cost,
        },
        highestQuality: {
          modelId: byQuality[0].modelId,
          score: this.calculateOverallQuality(byQuality[0].qualityMetrics),
        },
      },
      recommendations: {
        bestOverall,
        bestValue,
        fastestAcceptable,
      },
      costProjection: {
        per1000Calls: costProjection,
        per1MTokens: tokenProjection,
      },
    };
  }

  /**
   * Calculate overall quality score
   */
  private calculateOverallQuality(metrics?: any): number {
    if (!metrics) return 0;

    const weights = {
      coherence: 0.3,
      relevance: 0.4,
      completeness: 0.3,
    };

    return (
      (metrics.coherence || 0) * weights.coherence +
      (metrics.relevance || 0) * weights.relevance +
      (metrics.completeness || 0) * weights.completeness
    );
  }

  /**
   * Select best overall model
   */
  private selectBestOverall(results: ComparisonResult[]): string {
    const scores = results.map(result => {
      const qualityScore = this.calculateOverallQuality(result.qualityMetrics);
      const speedScore = 1 - Math.min(result.metrics.latency / 5000, 1);
      const costScore = 1 - Math.min(result.metrics.cost / 0.1, 1);

      return {
        modelId: result.modelId,
        score: qualityScore * 0.5 + speedScore * 0.3 + costScore * 0.2,
      };
    });

    scores.sort((a, b) => b.score - a.score);
    return scores[0].modelId;
  }

  /**
   * Select best value model
   */
  private selectBestValue(results: ComparisonResult[]): string {
    const scores = results.map(result => {
      const qualityScore = this.calculateOverallQuality(result.qualityMetrics);
      const costEfficiency = qualityScore / Math.max(result.metrics.cost, 0.001);

      return {
        modelId: result.modelId,
        score: costEfficiency,
      };
    });

    scores.sort((a, b) => b.score - a.score);
    return scores[0].modelId;
  }

  /**
   * Select fastest acceptable model
   */
  private selectFastestAcceptable(
    results: ComparisonResult[],
    minQuality: number = 0.5
  ): string {
    const acceptable = results.filter(r =>
      this.calculateOverallQuality(r.qualityMetrics) >= minQuality
    );

    if (acceptable.length === 0) {
      return results[0].modelId;
    }

    acceptable.sort((a, b) => a.metrics.latency - b.metrics.latency);
    return acceptable[0].modelId;
  }

  /**
   * Save comparison session
   */
  async saveSession(session: ComparisonSession): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);

      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.unshift(session);

        // Limit stored sessions
        if (sessions.length > MAX_SESSIONS) {
          sessions.splice(MAX_SESSIONS);
        }
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));

      console.log(`[ComparisonService] Saved session: ${session.name}`);
    } catch (error) {
      console.error('[ComparisonService] Failed to save session:', error);
      throw error;
    }
  }

  /**
   * Load a comparison session
   */
  async loadSession(sessionId: string): Promise<ComparisonSession | null> {
    try {
      const sessions = await this.getAllSessions();
      const session = sessions.find(s => s.id === sessionId);

      if (session) {
        // Convert date strings
        return {
          ...session,
          metadata: {
            ...session.metadata,
            created: new Date(session.metadata.created),
            completed: session.metadata.completed
              ? new Date(session.metadata.completed)
              : undefined,
          },
        };
      }

      return null;
    } catch (error) {
      console.error('[ComparisonService] Failed to load session:', error);
      return null;
    }
  }

  /**
   * Get all saved sessions
   */
  async getAllSessions(): Promise<ComparisonSession[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[ComparisonService] Failed to load sessions:', error);
      return [];
    }
  }

  /**
   * Delete a comparison session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const sessions = await this.getAllSessions();
      const filtered = sessions.filter(s => s.id !== sessionId);

      if (filtered.length < sessions.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return true;
      }

      return false;
    } catch (error) {
      console.error('[ComparisonService] Failed to delete session:', error);
      return false;
    }
  }

  /**
   * Export comparison results
   */
  async exportResults(
    session: ComparisonSession,
    analysis: ComparisonAnalysis,
    format: 'json' | 'markdown' | 'csv' = 'json'
  ): Promise<string> {
    const exportData: ComparisonExport = {
      session,
      results: session.results || [],
      analysis,
      exportDate: new Date(),
      format,
    };

    switch (format) {
      case 'markdown':
        return this.exportAsMarkdown(exportData);
      case 'csv':
        return this.exportAsCSV(exportData);
      default:
        return JSON.stringify(exportData, null, 2);
    }
  }

  /**
   * Export as Markdown
   */
  private exportAsMarkdown(data: ComparisonExport): string {
    const { session, results, analysis } = data;

    let markdown = `# Model Comparison Report\n\n`;
    markdown += `**Session**: ${session.name}\n`;
    markdown += `**Date**: ${session.metadata.created}\n`;
    markdown += `**Prompt**: ${session.prompt}\n\n`;

    markdown += `## Results\n\n`;
    results.forEach(result => {
      markdown += `### ${result.modelName}\n`;
      markdown += `- **Provider**: ${result.provider}\n`;
      markdown += `- **Latency**: ${result.metrics.latency}ms\n`;
      markdown += `- **Cost**: $${result.metrics.cost.toFixed(4)}\n`;
      markdown += `- **Tokens**: ${result.metrics.tokens.input}/${result.metrics.tokens.output}\n`;
      if (result.error) {
        markdown += `- **Error**: ${result.error}\n`;
      }
      markdown += `\n**Response**:\n${result.response}\n\n---\n\n`;
    });

    markdown += `## Analysis\n\n`;
    markdown += `### Rankings\n`;
    markdown += `- **Fastest**: ${analysis.metrics.fastest.modelId} (${analysis.metrics.fastest.latency}ms)\n`;
    markdown += `- **Cheapest**: ${analysis.metrics.cheapest.modelId} ($${analysis.metrics.cheapest.cost.toFixed(4)})\n`;
    markdown += `- **Highest Quality**: ${analysis.metrics.highestQuality.modelId} (${analysis.metrics.highestQuality.score.toFixed(2)})\n\n`;

    markdown += `### Recommendations\n`;
    markdown += `- **Best Overall**: ${analysis.recommendations.bestOverall}\n`;
    markdown += `- **Best Value**: ${analysis.recommendations.bestValue}\n`;
    markdown += `- **Fastest Acceptable**: ${analysis.recommendations.fastestAcceptable}\n`;

    return markdown;
  }

  /**
   * Export as CSV
   */
  private exportAsCSV(data: ComparisonExport): string {
    const { results } = data;

    let csv = 'Model,Provider,Latency (ms),Cost ($),Input Tokens,Output Tokens,Error\n';

    results.forEach(result => {
      csv += `"${result.modelName}","${result.provider}",${result.metrics.latency},${result.metrics.cost},`;
      csv += `${result.metrics.tokens.input},${result.metrics.tokens.output},"${result.error || ''}"\n`;
    });

    return csv;
  }

  /**
   * Record comparison metrics
   */
  private async recordComparisonMetrics(results: ComparisonResult[]): Promise<void> {
    for (const result of results) {
      await this.metricsService.recordMetric({
        timestamp: Date.now(),
        provider: result.provider,
        model: result.modelId,
        inputFormat: 'json',
        latency: result.metrics.latency,
        tokensUsed: result.metrics.tokens.input + result.metrics.tokens.output,
        promptTokens: result.metrics.tokens.input,
        completionTokens: result.metrics.tokens.output,
        status: result.error ? 'error' : 'success',
        errorMessage: result.error,
        estimatedCost: result.metrics.cost,
        promptLength: 0, // We'll need to track this properly later
        responseLength: result.response?.length || 0,
        confidence: result.qualityMetrics?.relevance,
      });
    }
  }

  /**
   * Cancel an active comparison
   */
  cancelComparison(sessionId: string): void {
    const controller = this.activeComparisons.get(sessionId);
    if (controller) {
      controller.abort();
      this.activeComparisons.delete(sessionId);
    }
  }
}