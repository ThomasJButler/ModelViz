/**
 * @file compare/page.tsx
 * @description Model comparison tool page for testing prompts across multiple models
 * @author Tom Butler
 * @date 2025-11-26
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Download,
  History,
  Zap,
  DollarSign,
  Hash,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Loader2,
  GitCompare,
  X,
  Trophy,
} from 'lucide-react';
import { ComparisonSession, ComparisonResult, ComparisonAnalysis } from '@/lib/types/modelComparison';
import { ComparisonService } from '@/lib/services/ComparisonService';
import { ModelProvider } from '@/lib/types/modelBuilder';
import { getAvailableModelsSimple, type SimpleModel } from '@/lib/utils/modelLoader';
import { HolographicCard } from '@/components/effects/HolographicCard';

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadModels = async () => {
    setLoadingModels(true);
    try {
      const models = await getAvailableModelsSimple();
      setAvailableModels(models);
      console.log('[Compare] Loaded models:', models);
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

      console.log('[Compare] Starting comparison with session:', session);

      // Execute comparison
      const comparisonResults = await comparisonService.executeComparison(session);
      console.log('[Compare] Results:', comparisonResults);
      setResults(comparisonResults);

      // Analyze results
      const analysisResult = await comparisonService.analyzeResults(session.id, comparisonResults);
      setAnalysis(analysisResult);

      // Reload sessions
      await loadSessions();
    } catch (err) {
      console.error('[Compare] Error:', err);
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <GitCompare className="w-8 h-8 text-matrix-primary" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-matrix-primary via-matrix-secondary to-matrix-tertiary text-transparent bg-clip-text">
              Model Comparison
            </h1>
          </div>
          <p className="text-foreground/70">
            Test a single prompt across multiple models simultaneously
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-1 space-y-6">
            {/* Model Selection */}
            <HolographicCard intensity={0.3} glowColor="rgba(0, 255, 0, 0.3)" interactive={true}>
              <div className="p-4 rounded-lg border border-matrix-primary/20 bg-black/50 backdrop-blur-xl">
                <h3 className="font-semibold mb-3 flex items-center justify-between text-matrix-primary">
                  Select Models
                  <span className="text-sm text-matrix-primary/60 px-2 py-0.5 rounded bg-matrix-primary/10">
                    {selectedModels.length}/6
                  </span>
                </h3>

                {loadingModels && (
                  <div className="p-4 text-center text-sm text-matrix-primary/60 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading models...
                  </div>
                )}

                {!loadingModels && availableModels.length === 0 && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-sm text-yellow-500">
                      No models available. Please add API keys in Settings.
                    </p>
                  </div>
                )}

                {!loadingModels && availableModels.length > 0 && (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {availableModels.map(model => (
                      <motion.label
                        key={model.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                          selectedModels.includes(model.id)
                            ? 'bg-matrix-primary/20 border border-matrix-primary shadow-[0_0_10px_rgba(0,255,0,0.2)]'
                            : 'hover:bg-matrix-primary/10 border border-matrix-primary/20'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedModels.includes(model.id)}
                          onChange={() => handleModelToggle(model.id)}
                          className="w-4 h-4 rounded accent-matrix-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground/90 truncate">{model.name}</div>
                          <div className="text-xs text-matrix-primary/60">{model.provider}</div>
                        </div>
                      </motion.label>
                    ))}
                  </div>
                )}
              </div>
            </HolographicCard>

            {/* Actions */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0,255,0,0.3)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCompare}
                disabled={isRunning || selectedModels.length < 2 || !prompt.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-matrix-primary text-black font-semibold rounded-lg hover:bg-matrix-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(0,255,0,0.2)]"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Compare Models
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-matrix-primary/30 text-matrix-primary/80 rounded-lg hover:bg-matrix-primary/10 hover:border-matrix-primary/50 transition-all"
              >
                <History className="w-4 h-4" />
                History ({sessions.length})
              </motion.button>

              {results.length > 0 && (
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleExport('json')}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-matrix-primary/30 text-matrix-primary/70 rounded-lg hover:bg-matrix-primary/10 text-sm transition-all"
                  >
                    <Download className="w-3 h-3" />
                    JSON
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleExport('markdown')}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-matrix-primary/30 text-matrix-primary/70 rounded-lg hover:bg-matrix-primary/10 text-sm transition-all"
                  >
                    <Download className="w-3 h-3" />
                    Markdown
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Prompt & Results */}
          <div className="lg:col-span-3 space-y-6">
            {/* Prompt Input */}
            <HolographicCard intensity={0.4} glowColor="rgba(0, 255, 0, 0.2)" interactive={true}>
              <div className="p-6 rounded-lg border border-matrix-primary/20 bg-black/50 backdrop-blur-xl">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-matrix-primary/80">
                      System Prompt (Optional)
                    </label>
                    <textarea
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      placeholder="You are a helpful assistant..."
                      rows={2}
                      className="w-full px-4 py-3 bg-black/60 border border-matrix-primary/30 rounded-lg text-foreground/90 placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-matrix-primary/50 focus:border-matrix-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-matrix-primary/80">
                      User Prompt <span className="text-matrix-secondary">*</span>
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Enter your prompt here..."
                      rows={4}
                      className="w-full px-4 py-3 bg-black/60 border border-matrix-primary/30 rounded-lg text-foreground/90 placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-matrix-primary/50 focus:border-matrix-primary transition-all"
                    />
                  </div>
                </div>
              </div>
            </HolographicCard>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur-sm"
              >
                <p className="text-sm text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              </motion.div>
            )}

            {/* Analysis Summary */}
            {analysis && (
              <HolographicCard intensity={0.5} glowColor="rgba(0, 255, 0, 0.4)" interactive={true}>
                <div className="p-6 rounded-lg border border-matrix-primary/30 bg-black/50 backdrop-blur-xl">
                  <h3 className="font-semibold mb-4 text-matrix-primary flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Analysis Summary
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="text-center p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                    >
                      <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                      <div className="text-xs text-yellow-400/70 uppercase tracking-wide">Fastest</div>
                      <div className="font-semibold text-yellow-400 mt-1">
                        {availableModels.find(m => m.id === analysis.metrics.fastest.modelId)?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-yellow-400/60 mt-1 font-mono">
                        {analysis.metrics.fastest.latency}ms
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                    >
                      <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-400" />
                      <div className="text-xs text-green-400/70 uppercase tracking-wide">Cheapest</div>
                      <div className="font-semibold text-green-400 mt-1">
                        {availableModels.find(m => m.id === analysis.metrics.cheapest.modelId)?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-green-400/60 mt-1 font-mono">
                        ${analysis.metrics.cheapest.cost.toFixed(4)}
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="text-center p-4 bg-matrix-primary/10 border border-matrix-primary/30 rounded-lg"
                    >
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 text-matrix-primary" />
                      <div className="text-xs text-matrix-primary/70 uppercase tracking-wide">Best Overall</div>
                      <div className="font-semibold text-matrix-primary mt-1">
                        {availableModels.find(m => m.id === analysis.recommendations.bestOverall)?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-matrix-primary/60 mt-1">
                        Recommended
                      </div>
                    </motion.div>
                  </div>
                </div>
              </HolographicCard>
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
                    >
                      <HolographicCard intensity={0.3} glowColor={result.error ? 'rgba(255, 100, 100, 0.3)' : 'rgba(0, 255, 0, 0.2)'} interactive={true}>
                        <div className="rounded-lg border border-matrix-primary/20 bg-black/50 backdrop-blur-xl overflow-hidden">
                          <div className="p-4 border-b border-matrix-primary/20 bg-matrix-primary/5">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-foreground/90">{result.modelName}</h4>
                                <p className="text-xs text-matrix-primary/60">{result.provider}</p>
                              </div>
                              {result.error ? (
                                <div className="p-1 rounded-full bg-red-500/20">
                                  <AlertCircle className="w-4 h-4 text-red-400" />
                                </div>
                              ) : (
                                <div className="p-1 rounded-full bg-green-500/20">
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="p-4">
                            {result.error ? (
                              <p className="text-red-400 text-sm">{result.error}</p>
                            ) : (
                              <div className="space-y-3">
                                <div className="max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-matrix-primary/30">
                                  <p className="text-sm text-foreground/80 whitespace-pre-wrap">{result.response}</p>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-matrix-primary/60 pt-2 border-t border-matrix-primary/10">
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
                        </div>
                      </HolographicCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Empty State */}
            {!loadingModels && results.length === 0 && !error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 px-6"
              >
                <GitCompare className="w-16 h-16 mx-auto mb-4 text-matrix-primary/30" />
                <h3 className="text-lg font-medium text-foreground/70 mb-2">Ready to Compare</h3>
                <p className="text-sm text-foreground/50 max-w-md mx-auto">
                  Select at least 2 models, enter a prompt, and click Compare to see how different AI models respond to the same input.
                </p>
              </motion.div>
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
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowHistory(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-black/90 rounded-xl border border-matrix-primary/30 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-[0_0_30px_rgba(0,255,0,0.2)]"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-matrix-primary flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Comparison History
                  </h3>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="p-2 rounded-lg hover:bg-matrix-primary/10 text-matrix-primary/60 hover:text-matrix-primary transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  {sessions.length === 0 ? (
                    <p className="text-foreground/50 text-center py-8">No saved comparisons yet</p>
                  ) : (
                    sessions.map((session) => (
                      <motion.button
                        key={session.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => loadSession(session)}
                        className="w-full p-4 bg-matrix-primary/5 rounded-lg border border-matrix-primary/20 hover:border-matrix-primary/40 text-left transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium text-foreground/90">{session.name}</div>
                          <div className="text-xs text-matrix-primary/50">
                            {new Date(session.metadata.created).toLocaleString()}
                          </div>
                        </div>
                        <p className="text-sm text-foreground/60 line-clamp-2 mb-3">{session.prompt}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {session.models.map((model) => (
                            <span key={model.id} className="text-xs px-2 py-1 bg-matrix-primary/10 border border-matrix-primary/20 rounded-md text-matrix-primary/70">
                              {model.name}
                            </span>
                          ))}
                        </div>
                      </motion.button>
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
