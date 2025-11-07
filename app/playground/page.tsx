/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Interactive AI playground for testing models with various input formats
 */
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Code, Activity, Shield, Sparkles, Zap, Network, AlertTriangle, CheckCircle2, Timer, Braces, Terminal, Maximize2, Minimize2, Download, Share2, Loader2, Settings } from 'lucide-react';
import { ModelSelector } from '@/components/model-selector';
import { CodeEditor } from '@/components/code-editor';
import { OutputDisplay } from '@/components/output-display';
import { PlaygroundGuide } from '@/components/playground-guide';
import { ProviderSelector } from '@/components/provider-selector';
import { EnhancedInput } from '@/components/enhanced-input';
import { ApiConfigModal } from '@/components/settings/api-config-modal';
import { getAvailableModels, type ModelOption, type ProviderGroupedModels } from '@/lib/playground/models';
import { generatePlaygroundResponse, type PlaygroundRequest, type PlaygroundResponse } from '@/lib/playground/api-cached';
import { ApiService } from '@/lib/api';

type InputFormat = 'json' | 'text' | 'code';

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
    deepseek: `{
  "input": "Explain the advantages of functional programming",
  "max_tokens": 200,
  "temperature": 0.7
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
    deepseek: 'What are the best practices for writing clean, maintainable code?',
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
    deepseek: `# Python data processing function
def process_data(df):
    """
    Process a pandas dataframe by cleaning and transforming data
    """
    df = df.drop_duplicates()

    df = df.fillna({
        'numeric_col': df['numeric_col'].mean(),
        'categorical_col': 'unknown'
    })

    df['new_feature'] = df['feature1'] / df['feature2']

    return df`,
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

  /** @constructs */
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoadingModels(true);

        // Initialize ApiService with saved config from localStorage
        const savedConfig = localStorage.getItem('modelviz_api_config');
        if (savedConfig) {
          try {
            const config = JSON.parse(savedConfig);
            ApiService.getInstance(config);
          } catch (initError) {
            console.error('Error initializing ApiService:', initError);
          }
        }

        const models = await getAvailableModels();
        setModelGroups(models);

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
    };

    loadModels();
  }, []);

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
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-background/95 to-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,255,0,0.1),_transparent_50%)]" />
      </div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-matrix-primary via-matrix-secondary to-matrix-tertiary text-transparent bg-clip-text">
                AI Playground
              </h1>
              <p className="text-foreground/70">
                Experience the future of artificial intelligence
              </p>
            </div>
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleFullscreen}
                className="p-2 rounded-lg bg-matrix-primary/10 border border-matrix-primary text-matrix-primary hover:bg-matrix-primary/20 transition-colors"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsApiConfigOpen(true)}
                className="px-4 py-2 rounded-lg bg-matrix-primary/10 border border-matrix-primary text-matrix-primary hover:bg-matrix-primary/20 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                API Config
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowGuide(true)}
                className="px-4 py-2 rounded-lg bg-matrix-primary/10 border border-matrix-primary text-matrix-primary hover:bg-matrix-primary/20 transition-colors flex items-center gap-2"
              >
                <Terminal className="w-4 h-4" />
                Guide
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="p-6 rounded-lg border border-matrix-primary/20 bg-card/80 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,0,0.1)]">
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
            ) : (
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
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
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

            <div className="relative">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute -inset-0.5 bg-gradient-to-r from-matrix-primary via-matrix-secondary to-matrix-tertiary rounded-lg blur opacity-20"
              />
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
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-matrix-primary">Output</h2>
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-4 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-matrix-secondary" />
                    <span className="text-matrix-secondary">
                      {metrics.avgLatency.toFixed(0)}ms
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-matrix-primary" />
                    <span className="text-matrix-primary">
                      {metrics.successRate.toFixed(1)}%
                    </span>
                  </div>
                </motion.div>
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

            <div className="relative">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute -inset-0.5 bg-gradient-to-r from-matrix-primary via-matrix-secondary to-matrix-tertiary rounded-lg blur opacity-20"
              />
              <div className="relative">
                <OutputDisplay
                  output={output ?
                    output.error ? { error: output.error } : { content: output.content }
                    : null}
                  isProcessing={isProcessing}
                  VisualisationType={inputFormat === 'json' ? 'json' : 'text'}
                />
              </div>
            </div>

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

      {/* API Configuration Modal */}
      <ApiConfigModal
        isOpen={isApiConfigOpen}
        onClose={() => setIsApiConfigOpen(false)}
      />
    </div>
  );
}
