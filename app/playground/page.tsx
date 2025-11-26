/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Interactive AI playground for testing models with various input formats
 */
"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Brain, Code, Activity, Sparkles, Zap, Network, AlertTriangle, CheckCircle2, Timer, Braces, Terminal, Maximize2, Minimize2, Download, Share2, Loader2, Settings, ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-media-query';
import { ModelSelector } from '@/components/model-selector';
import { CodeEditor } from '@/components/code-editor';
import { OutputDisplay } from '@/components/output-display';
import { PlaygroundGuide } from '@/components/playground-guide';
import { ProviderSelector } from '@/components/provider-selector';
import { EnhancedInput } from '@/components/enhanced-input';
import { ApiConfigModal } from '@/components/settings/api-config-modal';
import { getAvailableModelsSimple, type SimpleModel } from '@/lib/utils/modelLoader';
import { type ModelOption, type ProviderGroupedModels } from '@/lib/playground/models';
import { generatePlaygroundResponse, type PlaygroundRequest, type PlaygroundResponse } from '@/lib/playground/api-cached';
import { ApiService } from '@/lib/api';
import { MetricsService } from '@/lib/services/MetricsService';
import { formatCost } from '@/lib/utils/costCalculator';
import { HolographicCard } from '@/components/effects/HolographicCard';

type InputFormat = 'json' | 'text' | 'code';

// Helper function to transform SimpleModel[] to ProviderGroupedModels[]
function groupModelsByProvider(simpleModels: SimpleModel[]): ProviderGroupedModels[] {
  const grouped: { [provider: string]: ModelOption[] } = {};

  // Map to proper provider names (matching API expectations)
  const providerNameMap: { [key: string]: string } = {
    'openai': 'OpenAI',
    'anthropic': 'Anthropic',
    'google': 'Google',
    'perplexity': 'Perplexity',
    'demo': 'Demo'
  };

  simpleModels.forEach(model => {
    const providerKey = model.provider.toLowerCase();
    const provider = providerNameMap[providerKey] || model.provider;

    if (!grouped[provider]) {
      grouped[provider] = [];
    }

    // Map icon based on provider
    let icon = Brain;
    if (provider === 'Anthropic') icon = Sparkles;
    else if (provider === 'Google') icon = Zap;
    else if (provider === 'Perplexity') icon = Network;

    grouped[provider].push({
      id: model.id,
      name: model.name,
      description: `${provider} model`,
      icon,
      provider,
      capabilities: ['Text Generation', 'Reasoning'],
      metrics: {
        latency: '~200ms',
        accuracy: '90-95%',
        tokens: '4K+'
      }
    });
  });

  return Object.entries(grouped).map(([provider, models]) => ({
    provider,
    models
  }));
}

const inputFormats = [
  { id: 'json', label: 'JSON', icon: Braces },
  { id: 'text', label: 'Text', icon: Terminal },
  { id: 'code', label: 'Code', icon: Code }
];

const defaultPlaceholders: Record<InputFormat, Record<string, string>> = {
  json: {
    openai: `{
  "input": "Explain quantum computing in simple terms",
  "max_tokens": 150,
  "temperature": 0.7,
  "format": "markdown"
}`,
    anthropic: `{
  "input": "Write a short story about a programmer who discovers an AI",
  "system": "You are a creative storyteller with a talent for science fiction",
  "max_tokens": 500,
  "temperature": 0.8
}`,
    perplexity: `{
  "input": "Research the latest developments in quantum computing",
  "max_tokens": 300,
  "temperature": 0.5
}`,
    demo: `{
  "input": "Explain quantum computing in simple terms",
  "max_tokens": 150,
  "temperature": 0.7,
  "format": "markdown"
}`
  },
  text: {
    openai: 'Explain the differences between quantum computing and classical computing.',
    anthropic: 'Write a concise history of artificial intelligence and where it might go in the future.',
    perplexity: 'What were the major breakthroughs in AI during the past year?',
    demo: 'Enter your question about quantum computing...'
  },
  code: {
    openai: `# Python machine learning example
def train_model(X_train, y_train):
    """
    Train a classification model on the provided data
    """
    from sklearn.ensemble import RandomForestClassifier

    model = RandomForestClassifier(n_estimators=100)
    model.fit(X_train, y_train)
    return model`,
    anthropic: `// JavaScript async function example
async function fetchUserData(userId) {
  try {
    const response = await fetch(\`https://api.example.com/users/\${userId}\`);
    if (!response.ok) {
      throw new Error(\`HTTP error! Status: \${response.status}\`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}`,
    perplexity: `// TypeScript React component
import React, { useState, useEffect } from 'react';

interface DataItem {
  id: string;
  name: string;
  value: number;
}

const DataVisualisation: React.FC<{dataUrl: string}> = ({ dataUrl }) => {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(dataUrl);
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataUrl]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="visualisation">
      {data.map(item => (
        <div key={item.id} className="data-item">
          <h3>{item.name}</h3>
          <div className="bar" style={{width: \`\${item.value * 10}px\`}}>{item.value}</div>
        </div>
      ))}
    </div>
  );
};

export default DataVisualisation;`,
    demo: `# Python code analysis
def quantum_circuit(qubits, gates):
    """
    Implements a quantum circuit with the given qubits and gates
    """
    return simulate_quantum_state(apply_gates(qubits, gates))`
  }
};

/**
 * Interactive AI playground component
 * @constructor
 */
export default function PlaygroundPage() {
  const [modelGroups, setModelGroups] = useState<ProviderGroupedModels[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedModelName, setSelectedModelName] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [inputFormat, setInputFormat] = useState<InputFormat>('text');
  const [input, setInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(true);
  const [output, setOutput] = useState<PlaygroundResponse | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isApiConfigOpen, setIsApiConfigOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    requestCount: 0,
    avgLatency: 0,
    successRate: 100,
    processingTime: 0
  });
  const [metricsView, setMetricsView] = useState<'session' | 'alltime'>('session');
  const [alltimeMetrics, setAlltimeMetrics] = useState({
    requestCount: 0,
    avgLatency: 0,
    successRate: 100,
    totalCost: 0
  });
  const isMobile = useIsMobile();

  /** @constructs */
  const loadModels = useCallback(async () => {
    try {
      setIsLoadingModels(true);

      // Initialize ApiService with saved config from localStorage (synced from /settings)
      const savedConfig = localStorage.getItem('modelviz_playground_config');
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig);
          ApiService.getInstance(config);
        } catch (initError) {
          console.error('Error initializing ApiService:', initError);
        }
      }

      // Use unified model loader
      const simpleModels = await getAvailableModelsSimple();
      const models = groupModelsByProvider(simpleModels);
      setModelGroups(models);

      console.log('[Playground] Loaded models:', {
        totalModels: simpleModels.length,
        providers: models.map(g => g.provider)
      });

      if (models.length > 0 && models[0].models.length > 0) {
        const defaultModel = models[0].models[0];
        setSelectedModel(defaultModel.id);
        setSelectedModelName(defaultModel.name);
        setSelectedProvider(defaultModel.provider);

        const providerKey = defaultModel.provider.toLowerCase() as string;
        const placeholderKey = Object.keys(defaultPlaceholders[inputFormat]).includes(providerKey)
          ? providerKey
          : 'demo';
        setInput(defaultPlaceholders[inputFormat][placeholderKey as keyof typeof defaultPlaceholders.json]);
      }
    } catch (error) {
      console.error('Error loading models:', error);
      setError('Failed to load AI models. Please check your API configuration.');
    } finally {
      setIsLoadingModels(false);
    }
  }, [inputFormat]);

  useEffect(() => {
    loadModels();

    // Listen for API key changes to reload models in real-time
    const handleApiKeyChange = () => {
      console.log('[Playground] API key changed, reloading models...');
      loadModels();
    };

    window.addEventListener('api-keys-updated', handleApiKeyChange);

    return () => {
      window.removeEventListener('api-keys-updated', handleApiKeyChange);
    };
  }, [loadModels]);

  /** @listens selectedModel, selectedProvider, inputFormat */
  useEffect(() => {
    if (selectedProvider) {
      const providerKey = selectedProvider.toLowerCase() as string;
      const placeholderKey = Object.keys(defaultPlaceholders[inputFormat]).includes(providerKey)
        ? providerKey
        : 'demo';
      setInput(defaultPlaceholders[inputFormat][placeholderKey as keyof typeof defaultPlaceholders.json]);
    }
  }, [selectedModel, selectedProvider, inputFormat]);

  /** Load persistent metrics from MetricsService */
  const loadPersistentMetrics = useCallback(async () => {
    try {
      const service = MetricsService.getInstance();
      const aggregated = await service.getAggregatedMetrics('today');

      console.log('[Playground] Loaded persistent metrics:', {
        totalCalls: aggregated.totalCalls,
        totalCost: aggregated.totalCost
      });

      setAlltimeMetrics({
        requestCount: aggregated.totalCalls,
        avgLatency: Math.round(aggregated.avgLatency),
        successRate: aggregated.successRate * 100,
        totalCost: aggregated.totalCost
      });
    } catch (error) {
      console.error('[Playground] Failed to load persistent metrics:', error);
    }
  }, []);

  useEffect(() => {
    const initializeAndLoadMetrics = async () => {
      try {
        const service = MetricsService.getInstance();

        // Explicitly initialize the service
        console.log('[Playground] Initializing MetricsService...');
        await service.init();
        console.log('[Playground] MetricsService initialized');

        // Load initial metrics
        await loadPersistentMetrics();
      } catch (error) {
        console.error('[Playground] Failed to initialize metrics:', error);
      }
    };

    // Initialize on mount
    initializeAndLoadMetrics();

    // Listen for metrics updates
    const handleMetricsUpdate = () => {
      console.log('[Playground] Metrics update event received');
      loadPersistentMetrics();
    };

    const handleMetricsUpdateFailed = (event: CustomEvent) => {
      console.error('[Playground] Metrics update failed:', event.detail?.error);
    };

    window.addEventListener('metrics-updated', handleMetricsUpdate);
    window.addEventListener('metrics-update-failed', handleMetricsUpdateFailed);

    return () => {
      window.removeEventListener('metrics-updated', handleMetricsUpdate);
      window.removeEventListener('metrics-update-failed', handleMetricsUpdateFailed);
    };
  }, [loadPersistentMetrics]);

  const handleProcess = async () => {
    setIsProcessing(true);
    setOutput(null);
    setError(null);

    const request: PlaygroundRequest = {
      modelId: selectedModel,
      provider: selectedProvider,
      input,
      inputFormat
    };

    if (inputFormat === 'json') {
      try {
        const jsonInput = JSON.parse(input);
        if (jsonInput.max_tokens) {
          request.maxTokens = jsonInput.max_tokens;
        }
        if (jsonInput.temperature !== undefined) {
          request.temperature = jsonInput.temperature;
        }
      } catch (e) {
        // If invalid JSON, continue with defaults
      }
    }

    try {
      const response = await generatePlaygroundResponse(request);

      const processingTime = response.metadata?.processing_time
        ? parseFloat(response.metadata.processing_time.replace('s', '')) * 1000
        : 500;

      setMetrics(prev => ({
        requestCount: prev.requestCount + 1,
        avgLatency: (prev.avgLatency * prev.requestCount + processingTime) / (prev.requestCount + 1),
        successRate: response.error
          ? ((prev.successRate * prev.requestCount) + 0) / (prev.requestCount + 1)
          : ((prev.successRate * prev.requestCount) + 100) / (prev.requestCount + 1),
        processingTime
      }));

      setOutput(response);
    } catch (error) {
      console.error('Error processing request:', error);
      setError('Failed to process request. Please check your input and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedModelData = modelGroups
    .flatMap(group => group.models)
    .find(model => model.id === selectedModel);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div>
      <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-20 lg:pb-12 lg:pt-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-matrix-primary via-matrix-secondary to-matrix-tertiary text-transparent bg-clip-text">
                  AI Playground
                </h1>
                <p className="text-sm sm:text-base text-foreground/70">
                  Experience the future of artificial intelligence
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg bg-matrix-primary/10 border border-matrix-primary text-matrix-primary hover:bg-matrix-primary/20 transition-colors hidden sm:flex"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-5 h-5" />
                  ) : (
                    <Maximize2 className="w-5 h-5" />
                  )}
                </motion.button>
                <Link href="/settings">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-2 rounded-lg bg-matrix-primary/10 border border-matrix-primary text-matrix-primary hover:bg-matrix-primary/20 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Settings</span>
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowGuide(true)}
                  className="px-3 py-2 rounded-lg bg-matrix-primary/10 border border-matrix-primary text-matrix-primary hover:bg-matrix-primary/20 transition-colors flex items-center gap-2 text-sm"
                >
                  <Terminal className="w-4 h-4" />
                  <span className="hidden sm:inline">Guide</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <HolographicCard intensity={0.5} glowColor="rgba(0, 255, 0, 0.3)" interactive={true}>
            <div className="p-6 rounded-lg border border-matrix-primary/20 bg-black/50 backdrop-blur-xl shadow-[0_0_20px_rgba(0,255,0,0.2)]">
            {isLoadingModels ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-matrix-primary animate-spin" />
                <span className="ml-3 text-lg">Loading available models...</span>
              </div>
            ) : error ? (
              <div className="flex items-center text-red-500 py-4">
                <AlertTriangle className="w-6 h-6 mr-2" />
                <p>{error}</p>
              </div>
            ) : isMobile ? (
              /* Mobile: Simple dropdown selectors */
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* Provider Dropdown */}
                  <div className="relative">
                    <label className="block text-xs text-matrix-primary/70 mb-1">Provider</label>
                    <div className="relative">
                      <select
                        value={selectedProvider}
                        onChange={(e) => {
                          const provider = e.target.value;
                          setSelectedProvider(provider);
                          const providerModels = modelGroups.find(group => group.provider === provider)?.models || [];
                          if (providerModels.length > 0) {
                            setSelectedModel(providerModels[0].id);
                            setSelectedModelName(providerModels[0].name);
                          }
                        }}
                        className="w-full appearance-none px-3 py-2.5 pr-8 rounded-lg bg-black/60 border border-matrix-primary/30
                                 text-matrix-primary text-sm focus:border-matrix-primary focus:outline-none focus:ring-1 focus:ring-matrix-primary/50"
                      >
                        {modelGroups.map(group => (
                          <option key={group.provider} value={group.provider}>
                            {group.provider}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-matrix-primary/50 pointer-events-none" />
                    </div>
                  </div>

                  {/* Model Dropdown */}
                  <div className="relative">
                    <label className="block text-xs text-matrix-primary/70 mb-1">Model</label>
                    <div className="relative">
                      <select
                        value={selectedModel}
                        onChange={(e) => {
                          const id = e.target.value;
                          setSelectedModel(id);
                          const model = modelGroups
                            .flatMap(group => group.models)
                            .find(model => model.id === id);
                          if (model) {
                            setSelectedModelName(model.name);
                          }
                        }}
                        className="w-full appearance-none px-3 py-2.5 pr-8 rounded-lg bg-black/60 border border-matrix-primary/30
                                 text-matrix-primary text-sm focus:border-matrix-primary focus:outline-none focus:ring-1 focus:ring-matrix-primary/50"
                      >
                        {modelGroups
                          .filter(group => group.provider === selectedProvider)
                          .flatMap(group => group.models)
                          .map(model => (
                            <option key={model.id} value={model.id}>
                              {model.name}
                            </option>
                          ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-matrix-primary/50 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Compact model info on mobile */}
                {selectedModelData && (
                  <div className="flex items-center gap-3 text-xs text-matrix-primary/70">
                    <span>{selectedModelData.metrics.latency}</span>
                    <span>•</span>
                    <span>{selectedModelData.metrics.tokens}</span>
                  </div>
                )}
              </div>
            ) : (
              /* Desktop: Full grid selectors */
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-4">
                  <ProviderSelector
                    providers={modelGroups}
                    selectedProvider={selectedProvider}
                    onSelectProvider={(provider) => {
                      setSelectedProvider(provider);
                      const providerModels = modelGroups.find(group => group.provider === provider)?.models || [];
                      if (providerModels.length > 0) {
                        setSelectedModel(providerModels[0].id);
                        setSelectedModelName(providerModels[0].name);
                      }
                    }}
                    isLoading={isLoadingModels}
                  />

                  <ModelSelector
                    selectedModel={selectedModel}
                    onSelectModel={(id) => {
                      setSelectedModel(id);
                      const model = modelGroups
                        .flatMap(group => group.models)
                        .find(model => model.id === id);
                      if (model) {
                        setSelectedModelName(model.name);
                        if (selectedProvider !== model.provider) {
                          setSelectedProvider(model.provider);
                        }
                      }
                    }}
                    models={modelGroups
                      .filter(group => group.provider === selectedProvider)
                      .flatMap(group =>
                        group.models.map(model => ({
                          id: model.id,
                          name: model.name,
                          description: model.description,
                          icon: model.icon
                        }))
                      )
                    }
                  />
                </div>

                {selectedModelData && (
                  <div className="flex flex-wrap gap-2 p-4 rounded-lg border border-matrix-primary/20 bg-card/80 backdrop-blur-sm">
                    <h3 className="w-full text-sm font-medium text-matrix-primary mb-2">Model Capabilities</h3>
                    {selectedModelData.capabilities.map((capability, index) => (
                      <motion.span
                        key={capability}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="px-3 py-1 text-xs rounded-full bg-matrix-primary/10 text-matrix-primary border border-matrix-primary/30 shadow-[0_0_10px_rgba(0,255,0,0.1)]"
                      >
                        {capability}
                      </motion.span>
                    ))}
                    <div className="w-full mt-3 flex gap-6 pt-3 border-t border-matrix-primary/10">
                      {Object.entries(selectedModelData.metrics).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <p className="text-xs text-matrix-primary/70 mb-1">{key}</p>
                          <p className="text-sm font-mono text-matrix-primary font-bold">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          </HolographicCard>
        </motion.div>


        <div className="flex flex-col gap-6">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex gap-2">
              {inputFormats.map(format => {
                const Icon = format.icon;
                return (
                  <motion.button
                    key={format.id}
                    whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(0,255,0,0.2)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setInputFormat(format.id as InputFormat)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
                      inputFormat === format.id
                        ? 'bg-matrix-primary/20 text-matrix-primary border border-matrix-primary shadow-[0_0_10px_rgba(0,255,0,0.2)]'
                        : 'border border-matrix-primary/30 hover:border-matrix-primary/50 text-foreground/70'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {format.label}
                  </motion.button>
                );
              })}
            </div>

            <HolographicCard intensity={0.4} glowColor="rgba(0, 255, 0, 0.2)" interactive={true}>
              <div className="relative">
                {inputFormat === 'json' || inputFormat === 'code' ? (
                  <CodeEditor
                    value={input}
                    onChange={setInput}
                    isProcessing={isProcessing}
                    onProcess={handleProcess}
                    inputFormat={inputFormat}
                    language={inputFormat === 'json' ? 'json' : 'python'}
                  />
                ) : (
                  <EnhancedInput
                    value={input}
                    onChange={setInput}
                    onSubmit={handleProcess}
                    isProcessing={isProcessing}
                    placeholder="Ask any question or provide instructions..."
                    provider={selectedProvider}
                    model={selectedModelName}
                    inputFormat={inputFormat}
                    maxHeight="300px"
                  />
                )}
              </div>
            </HolographicCard>
          </motion.div>

          {/* Output Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-matrix-primary">Output</h2>
              <div className="flex items-center gap-4">
                {/* Desktop: Full metrics | Mobile: Simplified */}
                {isMobile ? (
                  <div className="flex items-center gap-3 text-xs text-matrix-primary/70">
                    <span>{metrics.requestCount} calls</span>
                    <span>•</span>
                    <span>{metrics.avgLatency.toFixed(0)}ms</span>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-4 text-sm"
                  >
                    <button
                      onClick={() => setMetricsView(v => v === 'session' ? 'alltime' : 'session')}
                      className="px-2 py-1 text-xs rounded bg-matrix-primary/10 border border-matrix-primary/30
                               text-matrix-primary hover:bg-matrix-primary/20 transition-colors"
                    >
                      {metricsView === 'session' ? 'Session' : 'All Time'}
                    </button>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-matrix-tertiary" />
                      <span className="text-matrix-tertiary">
                        {(metricsView === 'session' ? metrics.requestCount : alltimeMetrics.requestCount)} calls
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-matrix-secondary" />
                      <span className="text-matrix-secondary">
                        {(metricsView === 'session' ? metrics.avgLatency : alltimeMetrics.avgLatency).toFixed(0)}ms
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-matrix-primary" />
                      <span className="text-matrix-primary">
                        {(metricsView === 'session' ? metrics.successRate : alltimeMetrics.successRate).toFixed(1)}%
                      </span>
                    </div>
                    {metricsView === 'alltime' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-matrix-tertiary">Cost:</span>
                        <span className="text-matrix-secondary font-mono">
                          {formatCost(alltimeMetrics.totalCost)}
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}
                {output && !output.error && (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-lg bg-matrix-primary/10 border border-matrix-primary text-matrix-primary hover:bg-matrix-primary/20 transition-colors"
                      onClick={() => {
                        const element = document.createElement("a");
                        const file = new Blob([output.content], {type: 'text/plain'});
                        element.href = URL.createObjectURL(file);
                        element.download = `${selectedModel.replace('/', '-')}-response.txt`;
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-lg bg-matrix-primary/10 border border-matrix-primary text-matrix-primary hover:bg-matrix-primary/20 transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(output.content);
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

            <HolographicCard intensity={0.4} glowColor="rgba(0, 255, 0, 0.2)" interactive={true}>
              <div className="relative">
                <OutputDisplay
                  output={output ?
                    output.error ? { error: output.error } : { content: output.content }
                    : null}
                  isProcessing={isProcessing}
                  VisualisationType={inputFormat === 'json' ? 'json' : 'text'}
                />
              </div>
            </HolographicCard>

            {output && !isProcessing && output.metadata && !output.error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg border border-matrix-secondary/20 bg-card/80 backdrop-blur-sm"
              >
                <h3 className="text-sm font-medium text-matrix-secondary mb-2">Processing Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-matrix-secondary/70">Tokens Used</p>
                    <p className="font-mono text-matrix-secondary font-bold">
                      {output.metadata.tokens_used}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-matrix-secondary/70">Processing Time</p>
                    <p className="font-mono text-matrix-secondary font-bold">
                      {output.metadata.processing_time}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-matrix-secondary/70">Model</p>
                    <p className="font-mono text-matrix-secondary font-bold">
                      {output.metadata.model}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-matrix-secondary/70">Confidence</p>
                    <p className="font-mono text-matrix-secondary font-bold">
                      {(output.metadata.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        <AnimatePresence>
          {showGuide && (
            <PlaygroundGuide onClose={() => setShowGuide(false)} />
          )}
        </AnimatePresence>
      </div>
    </div>

    {/* API Configuration Modal */}
    <ApiConfigModal
      isOpen={isApiConfigOpen}
      onClose={() => setIsApiConfigOpen(false)}
    />
  </div>
  );
}
