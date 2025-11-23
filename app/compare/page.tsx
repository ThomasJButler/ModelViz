/**
 * @file compare/page.tsx
 * @description Model comparison tool page for testing prompts across multiple models
 * @author Assistant
 * @date 2024-11-23
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Save,
  Download,
  History,
  Zap,
  DollarSign,
  Hash,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { ComparisonSession, ComparisonResult, ComparisonAnalysis } from '@/lib/types/modelComparison';
import { ComparisonService } from '@/lib/services/ComparisonService';
import { ModelProvider } from '@/lib/types/modelBuilder';
import { getAvailableModelsSimple, type SimpleModel } from '@/lib/utils/modelLoader';

export default function ComparePage() {
  const [prompt, setPrompt] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [analysis, setAnalysis] = useState<ComparisonAnalysis | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<ComparisonSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<SimpleModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);

  const comparisonService = ComparisonService.getInstance();

  useEffect(() => {
    loadSessions();
    loadModels();

    // Listen for API key changes to reload models in real-time
    const handleApiKeyChange = () => {
      console.log('[Compare] API key changed, reloading models...');
      loadModels();
    };

    window.addEventListener('api-keys-updated', handleApiKeyChange);

    return () => {
      window.removeEventListener('api-keys-updated', handleApiKeyChange);
    };
  }, []);

  const loadModels = async () => {
    setLoadingModels(true);
    try {
      const models = await getAvailableModelsSimple();
      setAvailableModels(models);
    } catch (error) {
      console.error('Error loading models:', error);
      setError('Failed to load available models');
    } finally {
      setLoadingModels(false);
    }
  };

  const loadSessions = async () => {
    const loadedSessions = await comparisonService.getAllSessions();
    setSessions(loadedSessions);
  };

  const handleModelToggle = (modelId: string) => {
    setSelectedModels(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId);
      } else if (prev.length < 6) {
        return [...prev, modelId];
      }
      return prev;
    });
  };

  const handleCompare = async () => {
    if (selectedModels.length < 2 || !prompt.trim()) {
      setError('Please select at least 2 models and enter a prompt');
      return;
    }

    setIsRunning(true);
    setError(null);
    setResults([]);
    setAnalysis(null);

    try {
      const session: ComparisonSession = {
        id: `session-${Date.now()}`,
        name: `Comparison ${new Date().toLocaleString()}`,
        prompt: prompt.trim(),
        systemPrompt: systemPrompt.trim() || undefined,
        models: selectedModels.map(id => {
          const model = availableModels.find(m => m.id === id)!;
          return {
            id: model.id,
            provider: model.provider as ModelProvider,
            name: model.name,
          };
        }),
        metadata: {
          created: new Date(),
          saved: true,
        },
      };

      // Execute comparison
      const comparisonResults = await comparisonService.executeComparison(session);
      setResults(comparisonResults);

      // Analyze results
      const analysisResult = await comparisonService.analyzeResults(session.id, comparisonResults);
      setAnalysis(analysisResult);

      // Reload sessions
      await loadSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Comparison failed');
    } finally {
      setIsRunning(false);
    }
  };

  const handleExport = async (format: 'json' | 'markdown') => {
    if (!results.length || !analysis) return;

    const session: ComparisonSession = {
      id: `export-${Date.now()}`,
      name: 'Export',
      prompt,
      systemPrompt: systemPrompt || undefined,
      models: selectedModels.map(id => {
        const model = availableModels.find(m => m.id === id)!;
        return {
          id: model.id,
          provider: model.provider as ModelProvider,
          name: model.name,
        };
      }),
      results,
      metadata: {
        created: new Date(),
        saved: false,
      },
    };

    const exportData = await comparisonService.exportResults(session, analysis, format);

    // Create download
    const blob = new Blob([exportData], { type: format === 'json' ? 'application/json' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparison-${Date.now()}.${format === 'json' ? 'json' : 'md'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSession = async (session: ComparisonSession) => {
    setPrompt(session.prompt);
    setSystemPrompt(session.systemPrompt || '');
    setSelectedModels(session.models.map(m => m.id));
    setResults(session.results || []);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-matrix-primary to-matrix-secondary text-transparent bg-clip-text">
            Model Comparison Tool
          </h1>
          <p className="text-foreground/70">
            Test a single prompt across multiple models simultaneously
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-1 space-y-6">
            {/* Model Selection */}
            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="font-semibold mb-3 flex items-center justify-between">
                Select Models
                <span className="text-sm text-foreground/60">{selectedModels.length}/6</span>
              </h3>

              {loadingModels && (
                <div className="p-4 text-center text-sm text-foreground/60">
                  Loading models...
                </div>
              )}

              {!loadingModels && availableModels.length === 0 && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-md">
                  <p className="text-sm text-yellow-500">
                    No models available. Please add API keys in Settings.
                  </p>
                </div>
              )}

              {!loadingModels && availableModels.length > 0 && (
                <div className="space-y-2">
                  {availableModels.map(model => (
                    <label
                      key={model.id}
                      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all ${
                        selectedModels.includes(model.id)
                          ? 'bg-matrix-primary/20 border border-matrix-primary'
                          : 'hover:bg-background border border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedModels.includes(model.id)}
                        onChange={() => handleModelToggle(model.id)}
                        className="w-4 h-4 rounded"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{model.name}</div>
                        <div className="text-xs text-foreground/60">{model.provider}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleCompare}
                disabled={isRunning || selectedModels.length < 2 || !prompt.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-matrix-primary text-black font-medium rounded-md hover:bg-matrix-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Compare
                  </>
                )}
              </button>

              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border text-foreground/70 rounded-md hover:bg-background"
              >
                <History className="w-4 h-4" />
                History ({sessions.length})
              </button>

              {results.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport('json')}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-border text-foreground/70 rounded-md hover:bg-background text-sm"
                  >
                    <Download className="w-3 h-3" />
                    JSON
                  </button>
                  <button
                    onClick={() => handleExport('markdown')}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-border text-foreground/70 rounded-md hover:bg-background text-sm"
                  >
                    <Download className="w-3 h-3" />
                    Markdown
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Prompt & Results */}
          <div className="lg:col-span-3 space-y-6">
            {/* Prompt Input */}
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">System Prompt (Optional)</label>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="You are a helpful assistant..."
                    rows={2}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-matrix-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">User Prompt *</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your prompt here..."
                    rows={4}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-matrix-primary"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              </div>
            )}

            {/* Analysis Summary */}
            {analysis && (
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="font-semibold mb-4">Analysis Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-background/50 rounded-lg">
                    <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                    <div className="text-xs text-foreground/60">Fastest</div>
                    <div className="font-medium text-sm">
                      {availableModels.find(m => m.id === analysis.metrics.fastest.modelId)?.name}
                    </div>
                    <div className="text-xs text-foreground/60">{analysis.metrics.fastest.latency}ms</div>
                  </div>
                  <div className="text-center p-3 bg-background/50 rounded-lg">
                    <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-500" />
                    <div className="text-xs text-foreground/60">Cheapest</div>
                    <div className="font-medium text-sm">
                      {availableModels.find(m => m.id === analysis.metrics.cheapest.modelId)?.name}
                    </div>
                    <div className="text-xs text-foreground/60">${analysis.metrics.cheapest.cost.toFixed(4)}</div>
                  </div>
                  <div className="text-center p-3 bg-background/50 rounded-lg">
                    <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                    <div className="text-xs text-foreground/60">Best Overall</div>
                    <div className="font-medium text-sm">
                      {availableModels.find(m => m.id === analysis.recommendations.bestOverall)?.name}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results Grid */}
            {results.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {results.map((result, index) => (
                    <motion.div
                      key={result.modelId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-card rounded-lg border border-border overflow-hidden"
                    >
                      <div className="p-4 border-b border-border">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{result.modelName}</h4>
                            <p className="text-xs text-foreground/60">{result.provider}</p>
                          </div>
                          {result.error ? (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      </div>

                      <div className="p-4">
                        {result.error ? (
                          <p className="text-red-500 text-sm">{result.error}</p>
                        ) : (
                          <div className="space-y-3">
                            <div className="max-h-48 overflow-y-auto">
                              <p className="text-sm whitespace-pre-wrap">{result.response}</p>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-foreground/60">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {result.metrics.latency}ms
                              </span>
                              <span className="flex items-center gap-1">
                                <Hash className="w-3 h-3" />
                                {result.metrics.tokens.output} tokens
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ${result.metrics.cost.toFixed(4)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* History Modal */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
              onClick={() => setShowHistory(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card rounded-lg border border-border p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              >
                <h3 className="text-lg font-semibold mb-4">Comparison History</h3>
                <div className="space-y-3">
                  {sessions.length === 0 ? (
                    <p className="text-foreground/60 text-center py-8">No saved comparisons yet</p>
                  ) : (
                    sessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => loadSession(session)}
                        className="w-full p-4 bg-background/50 rounded-lg border border-border hover:border-matrix-primary/50 text-left"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium">{session.name}</div>
                          <div className="text-xs text-foreground/60">
                            {new Date(session.metadata.created).toLocaleString()}
                          </div>
                        </div>
                        <p className="text-sm text-foreground/70 line-clamp-2">{session.prompt}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {session.models.map((model) => (
                            <span key={model.id} className="text-xs px-2 py-1 bg-background rounded-md">
                              {model.name}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}