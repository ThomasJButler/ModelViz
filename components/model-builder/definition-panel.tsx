"use client";

import { useState, useEffect } from 'react';
import { 
  Brain, 
  Settings, 
  Key, 
  Zap, 
  Sparkles, 
  Code, 
  CheckCircle2, 
  AlertCircle,
  Info,
  ChevronRight,
  ChevronDown,
  Sliders,
  Server
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ProviderSelector } from '@/components/provider-selector';
import { getAvailableModels, type ProviderGroupedModels, type ModelOption } from '@/lib/playground/models';
import { ApiService, ApiConfig } from '@/lib/api';

// Define model capability options
interface Capability {
  id: string;
  name: string;
  description: string;
  icon: any;
}

const capabilities: Capability[] = [
  {
    id: 'nlp',
    name: 'Natural Language Processing',
    description: 'Advanced text understanding and generation',
    icon: Brain
  },
  {
    id: 'reasoning',
    name: 'Logical Reasoning',
    description: 'Complex problem-solving capabilities',
    icon: Settings
  },
  {
    id: 'creative',
    name: 'Creative Generation',
    description: 'Content creation with creativity and originality',
    icon: Sparkles
  },
  {
    id: 'code',
    name: 'Code Generation',
    description: 'Programming code generation and analysis',
    icon: Code
  },
  {
    id: 'api',
    name: 'API Orchestration',
    description: 'Ability to route requests across multiple APIs',
    icon: Server
  },
  {
    id: 'optimization',
    name: 'Performance Optimization',
    description: 'Enhanced speed and response quality',
    icon: Zap
  }
];

export function ModelDefinitionPanel() {
  // Model providers and selection state
  const [providers, setProviders] = useState<ProviderGroupedModels[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('OpenAI');
  const [selectedModel, setSelectedModel] = useState<ModelOption | null>(null);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  
  // Model configuration state
  const [modelName, setModelName] = useState('');
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [isApiConfigOpen, setIsApiConfigOpen] = useState(false);
  const [isCapabilitiesOpen, setIsCapabilitiesOpen] = useState(false);
  const [isModelSettingsOpen, setIsModelSettingsOpen] = useState(false);
  
  // API settings state
  const [apiConfig, setApiConfig] = useState<ApiConfig>({});
  const [apiStatus, setApiStatus] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | null;
  }>({ message: '', type: null });
  
  // Load model providers and API configuration
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingProviders(true);
      
      try {
        // Load API config from localStorage
        const savedConfig = localStorage.getItem('modelviz_api_config');
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig) as ApiConfig;
          
          // Initialize API service if needed
          try {
            ApiService.getInstance(parsedConfig);
          } catch (error) {
            console.error('Error initializing API service:', error);
          }
          
          setApiConfig(parsedConfig);
          
          // Show API status based on config
          const configKeys = Object.keys(parsedConfig);
          if (configKeys.length > 0) {
            setApiStatus({
              message: `${configKeys.length} API provider${configKeys.length > 1 ? 's' : ''} configured`,
              type: 'success'
            });
          } else {
            setApiStatus({
              message: 'No API providers configured',
              type: 'info'
            });
          }
        } else {
          setApiStatus({
            message: 'No API providers configured',
            type: 'info'
          });
        }
        
        // Get available models
        const models = await getAvailableModels();
        setProviders(models);
        
        // Select first model if none selected
        if (!selectedModel && models.length > 0 && models[0].models.length > 0) {
          setSelectedModel(models[0].models[0]);
        }
      } catch (error) {
        console.error('Error loading model data:', error);
        setApiStatus({
          message: 'Error loading model data',
          type: 'error'
        });
      } finally {
        setIsLoadingProviders(false);
      }
    };

    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Handle provider change
  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    
    // Find a model from the new provider
    const providerData = providers.find(p => p.provider === provider);
    if (providerData && providerData.models.length > 0) {
      setSelectedModel(providerData.models[0]);
    } else {
      setSelectedModel(null);
    }
  };
  
  // Handle model change
  const handleModelChange = (modelId: string) => {
    const providerData = providers.find(p => p.provider === selectedProvider);
    if (providerData) {
      const model = providerData.models.find(m => m.id === modelId);
      if (model) {
        setSelectedModel(model);
      }
    }
  };
  
  // Handle capability toggle
  const handleCapabilityToggle = (capabilityId: string) => {
    setSelectedCapabilities(prev => {
      if (prev.includes(capabilityId)) {
        return prev.filter(id => id !== capabilityId);
      } else {
        return [...prev, capabilityId];
      }
    });
  };
  
  // Check if provider is configured
  const isProviderConfigured = (providerId: string): boolean => {
    const normalizedId = providerId.toLowerCase();
    return !!apiConfig[normalizedId]?.apiKey;
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Model Definition</h3>
        <p className="text-sm text-foreground/70">
          Configure your model&apos;s capabilities and parameters
        </p>
      </div>

      {/* API Provider Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">1. Select API Provider</h4>
          <div className="text-xs text-matrix-primary">
            {isProviderConfigured(selectedProvider) ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Configured
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-500">
                <AlertCircle className="w-3 h-3" />
                Not Configured
              </span>
            )}
          </div>
        </div>
        
        {isLoadingProviders ? (
          <div className="p-4 text-center">
            <div className="inline-block w-5 h-5 border-2 border-matrix-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-foreground/70 mt-2">Loading providers...</p>
          </div>
        ) : (
          <ProviderSelector
            providers={providers}
            selectedProvider={selectedProvider}
            onSelectProvider={handleProviderChange}
          />
        )}
        
        {/* API Configuration Section */}
        <div className="mt-4">
          <button
            onClick={() => setIsApiConfigOpen(!isApiConfigOpen)}
            className="flex items-center justify-between w-full px-3 py-2 text-sm text-left border border-matrix-primary/20 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-matrix-primary" />
              <span>API Configuration</span>
            </div>
            {isApiConfigOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          
          {isApiConfigOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 p-3 border border-matrix-primary/20 rounded-lg bg-card/30"
            >
              {/* API status message */}
              {apiStatus.type && (
                <div className={`mb-3 p-2 rounded text-xs flex items-center gap-1.5 ${
                  apiStatus.type === 'success' 
                    ? 'bg-green-500/10 text-green-500' 
                    : apiStatus.type === 'error'
                      ? 'bg-red-500/10 text-red-500'
                      : 'bg-blue-500/10 text-blue-500'
                }`}
                >
                  {apiStatus.type === 'success' ? (
                    <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                  ) : apiStatus.type === 'error' ? (
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  ) : (
                    <Info className="w-3 h-3 flex-shrink-0" />
                  )}
                  <span>{apiStatus.message}</span>
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <p className="text-xs text-foreground/70">
                  Configure API keys for different providers to use their models in your custom builds.
                </p>
                <a
                  href="/profile/api-settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center py-1.5 text-xs border border-matrix-primary/30 rounded bg-matrix-primary/5 text-matrix-primary hover:bg-matrix-primary/10 transition-colors"
                >
                  Configure API Keys
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Model Selection */}
      <div className="space-y-4 mt-6">
        <h4 className="text-sm font-medium">2. Select Base Model</h4>
        
        {isLoadingProviders ? (
          <div className="p-4 text-center">
            <div className="inline-block w-5 h-5 border-2 border-matrix-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-foreground/70 mt-2">Loading models...</p>
          </div>
        ) : providers.length === 0 ? (
          <div className="p-4 text-center border border-dashed border-matrix-primary/30 rounded-lg">
            <AlertCircle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-foreground/70">No models available</p>
            <p className="text-xs text-foreground/50 mt-1">Configure API keys to access models</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="p-3 border border-matrix-primary/20 bg-card/30 rounded-lg">
              {/* Model dropdown */}
              <select
                value={selectedModel?.id || ''}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background rounded-md border border-border focus:border-matrix-primary focus:ring-1 focus:ring-matrix-primary outline-none"
              >
                {providers.find(p => p.provider === selectedProvider)?.models.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              
              {/* Selected model details */}
              {selectedModel && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-medium text-sm">{selectedModel.name}</h5>
                      <p className="text-xs text-foreground/70">{selectedModel.description}</p>
                    </div>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-matrix-primary/10 text-xs text-matrix-primary border border-matrix-primary/20">
                      <selectedModel.icon className="w-3 h-3" />
                      <span>{selectedModel.provider}</span>
                    </div>
                  </div>
                  
                  {/* Model Capabilities */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedModel.capabilities.map((capability, index) => (
                      <span 
                        key={index}
                        className="inline-flex text-[10px] px-1.5 py-0.5 rounded-full bg-foreground/10 text-foreground/70"
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                  
                  {/* Model metrics */}
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="p-1.5 rounded bg-foreground/5">
                      <p className="text-[10px] text-foreground/50">Accuracy</p>
                      <p className="text-xs font-medium">{selectedModel.metrics.accuracy}</p>
                    </div>
                    <div className="p-1.5 rounded bg-foreground/5">
                      <p className="text-[10px] text-foreground/50">Latency</p>
                      <p className="text-xs font-medium">{selectedModel.metrics.latency}</p>
                    </div>
                    <div className="p-1.5 rounded bg-foreground/5">
                      <p className="text-[10px] text-foreground/50">Tokens</p>
                      <p className="text-xs font-medium">{selectedModel.metrics.tokens}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Model settings section */}
            <div>
              <button
                onClick={() => setIsModelSettingsOpen(!isModelSettingsOpen)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm text-left border border-matrix-primary/20 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-matrix-primary" />
                  <span>Model Settings</span>
                </div>
                {isModelSettingsOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              
              {isModelSettingsOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 p-3 border border-matrix-primary/20 rounded-lg bg-card/30"
                >
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-foreground/70 mb-1">Temperature</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="2" 
                        step="0.1" 
                        defaultValue="0.7"
                        className="w-full h-1.5 bg-foreground/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-matrix-primary"
                      />
                      <div className="flex justify-between text-[10px] text-foreground/50 mt-1">
                        <span>Precise</span>
                        <span>Balanced</span>
                        <span>Creative</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-foreground/70 mb-1">Response Length</label>
                      <select className="w-full px-2 py-1.5 text-xs bg-background rounded-md border border-border focus:border-matrix-primary focus:ring-1 focus:ring-matrix-primary outline-none">
                        <option value="short">Short (Concise answers)</option>
                        <option value="medium" selected>Medium (Detailed responses)</option>
                        <option value="long">Long (Comprehensive explanations)</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Enhanced Capabilities */}
      <div className="space-y-4 mt-6">
        <div>
          <button
            onClick={() => setIsCapabilitiesOpen(!isCapabilitiesOpen)}
            className="flex items-center justify-between w-full px-3 py-2 text-sm text-left border border-matrix-primary/20 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-matrix-primary" />
              <span>3. Enhanced Capabilities</span>
            </div>
            {isCapabilitiesOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
        
        {isCapabilitiesOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <p className="text-xs text-foreground/70">
              Enhance your model with additional capabilities beyond the base model&apos;s functionality.
            </p>
            
            <div className="grid grid-cols-1 gap-2">
              {capabilities.map((capability) => {
                const isSelected = selectedCapabilities.includes(capability.id);
                const Icon = capability.icon;
                
                return (
                  <button
                    key={capability.id}
                    onClick={() => handleCapabilityToggle(capability.id)}
                    className={`p-3 rounded-lg border text-left ${
                      isSelected
                        ? 'border-matrix-primary bg-matrix-primary/10'
                        : 'border-border bg-card/30 hover:border-matrix-primary/30'
                    } transition-colors`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-md ${
                        isSelected ? 'bg-matrix-primary/20' : 'bg-foreground/10'
                      }`}>
                        <Icon className={`w-3.5 h-3.5 ${
                          isSelected ? 'text-matrix-primary' : 'text-foreground/70'
                        }`} />
                      </div>
                      <div>
                        <h5 className="text-xs font-medium">{capability.name}</h5>
                        <p className="text-[10px] text-foreground/70">{capability.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Model name and metadata */}
      <div className="mt-6 space-y-3">
        <h4 className="text-sm font-medium">4. Name Your Model</h4>
        <input
          type="text"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          placeholder="Enter a name for your model"
          className="w-full px-3 py-2 text-sm bg-background rounded-md border border-border focus:border-matrix-primary focus:ring-1 focus:ring-matrix-primary outline-none"
        />
        <textarea
          placeholder="Description (optional)"
          className="w-full px-3 py-2 text-sm bg-background rounded-md border border-border focus:border-matrix-primary focus:ring-1 focus:ring-matrix-primary outline-none h-20 resize-none"
        ></textarea>
      </div>
    </div>
  );
}
