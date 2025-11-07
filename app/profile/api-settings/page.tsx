/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description API settings page for configuring and testing AI provider API keys
 */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Key, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Save, 
  Info,
  Brain,
  Sparkles,
  Code,
  Zap,
  Globe,
  Database
} from "lucide-react";
import { ApiService, ApiConfig } from "@/lib/api";

const providers = [
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT models for natural language and code generation",
    icon: Brain,
    placeholder: "sk-...",
    helpText: "Get your API key from the OpenAI dashboard",
    helpUrl: "https://platform.openai.com/api-keys",
    primary: true
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude models for reasoning and complex tasks",
    icon: Sparkles,
    placeholder: "sk_ant_...",
    helpText: "Get your API key from the Anthropic console",
    helpUrl: "https://console.anthropic.com/keys",
    primary: true
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    description: "Specialized models for code and technical tasks",
    icon: Code,
    placeholder: "Your DeepSeek API key",
    helpText: "Get your API key from the DeepSeek platform",
    helpUrl: "https://platform.deepseek.com/",
    primary: true
  },
  {
    id: "perplexity",
    name: "Perplexity",
    description: "Models with internet search capabilities",
    icon: Zap,
    placeholder: "pplx-...",
    helpText: "Get your API key from the Perplexity API settings",
    helpUrl: "https://www.perplexity.ai/settings/api",
    primary: true
  },
  {
    id: "news",
    name: "News API",
    description: "Real-time news data from multiple sources",
    icon: Globe,
    placeholder: "Your News API key",
    helpText: "Get your API key from News API",
    helpUrl: "https://newsapi.org/register",
    primary: false
  }
];

/**
 * @constructor
 */
export default function ApiSettingsPage() {
  const [config, setConfig] = useState<ApiConfig>({});
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | null;
  }>({ message: '', type: null });
  const [isTesting, setIsTesting] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({});
  const [activeProviders, setActiveProviders] = useState<Record<string, boolean>>({});

  /** @constructs */
  useEffect(() => {
    const initialIsTesting: Record<string, boolean> = {};
    const initialTestResults: Record<string, boolean | null> = {};
    const initialActiveProviders: Record<string, boolean> = {};
    
    providers.forEach(provider => {
      initialIsTesting[provider.id] = false;
      initialTestResults[provider.id] = null;
      initialActiveProviders[provider.id] = true;
    });
    
    setIsTesting(initialIsTesting);
    setTestResults(initialTestResults);
    setActiveProviders(initialActiveProviders);
  }, []);

  /** @constructs */
  useEffect(() => {
    const loadSavedConfig = () => {
      try {
        const savedConfig = localStorage.getItem('modelviz_api_config');
        if (!savedConfig) return;
        
        const parsedConfig = JSON.parse(savedConfig) as ApiConfig;
        
        // Update active providers
        const newActiveProviders = { ...activeProviders };
        Object.keys(parsedConfig).forEach(key => {
          newActiveProviders[key] = true;
        });
        setActiveProviders(newActiveProviders);
        
        // Mask API keys in the UI
        const maskedConfig: ApiConfig = {};
        Object.entries(parsedConfig).forEach(([key, value]) => {
          if (value && value.apiKey) {
            maskedConfig[key] = { 
              apiKey: value.apiKey.substring(0, 4) + '...' + value.apiKey.slice(-4)
            };
          }
        });
        
        setConfig(maskedConfig);
        
        // Store the actual config in ApiService
        if (Object.keys(parsedConfig).length > 0) {
          try {
            ApiService.getInstance(parsedConfig);
            setStatus({ 
              message: 'Loaded saved API configuration', 
              type: 'success' 
            });
          } catch (err) {
            console.error('Error initializing API service', err);
          }
        }
      } catch (error) {
        console.error('Error loading saved configuration', error);
        setStatus({ 
          message: 'Failed to load saved configuration', 
          type: 'error' 
        });
      }
    };

    loadSavedConfig();
  }, [activeProviders]);

  const handleSave = () => {
    setIsLoading(true);
    setStatus({ message: 'Saving configuration...', type: 'info' });

    try {
      // Get the current saved config for merging
      const savedConfig = localStorage.getItem('modelviz_api_config');
      let updatedConfig: ApiConfig = {};
      
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig) as ApiConfig;
        updatedConfig = { ...parsedConfig };
      }
      
      // Only update keys that were actually changed (not masked) or enabled
      providers.forEach(provider => {
        const id = provider.id;
        // Only include if active and has API key
        if (activeProviders[id] && config[id]?.apiKey) {
          if (!config[id].apiKey.includes('...')) {
            updatedConfig[id] = { apiKey: config[id].apiKey };
          }
        } else if (!activeProviders[id] && updatedConfig[id]) {
          // If provider was disabled, remove from config
          delete updatedConfig[id];
        }
      });

      // Save to localStorage
      localStorage.setItem('modelviz_api_config', JSON.stringify(updatedConfig));
      
      // Update ApiService
      if (ApiService.getInstance) {
        try {
          ApiService.getInstance(updatedConfig);
        } catch (error) {
          ApiService.getInstance(updatedConfig);
        }
      }

      setStatus({ message: 'API configuration saved successfully!', type: 'success' });
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error saving configuration', error);
      setStatus({ message: 'Failed to save configuration', type: 'error' });
      setIsLoading(false);
    }
  };

  const handleInputChange = (providerId: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      [providerId]: { apiKey: value }
    }));

    setTestResults(prev => ({
      ...prev,
      [providerId]: null
    }));
  };

  const toggleProvider = (providerId: string) => {
    setActiveProviders(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }));

    setTestResults(prev => ({
      ...prev,
      [providerId]: null
    }));
  };

  const testConnection = async (providerId: string) => {
    setIsTesting(prev => ({ ...prev, [providerId]: true }));
    
    try {
      // Get the actual API key
      const savedConfig = localStorage.getItem('modelviz_api_config');
      let apiKey = config[providerId]?.apiKey || '';

      if (apiKey.includes('...') && savedConfig) {
        const parsedConfig = JSON.parse(savedConfig) as ApiConfig;
        apiKey = parsedConfig[providerId]?.apiKey || '';
      }
      
      if (!apiKey) {
        setTestResults(prev => ({ ...prev, [providerId]: false }));
        setIsTesting(prev => ({ ...prev, [providerId]: false }));
        return;
      }
      
      const tempConfig: Partial<ApiConfig> = {};
      tempConfig[providerId] = { apiKey };

      let api: any;
      try {
        ApiService.getInstance().updateConfig(tempConfig);

        switch(providerId) {
          case 'openai':
            api = ApiService.getInstance().getOpenAI();
            break;
          case 'anthropic':
            api = ApiService.getInstance().getAnthropic();
            break;
          case 'deepseek':
            api = ApiService.getInstance().getDeepSeek();
            break;
          case 'perplexity':
            api = ApiService.getInstance().getPerplexity();
            break;
          case 'news':
            api = ApiService.getInstance().getNews();
            break;
          default:
            throw new Error(`Unknown provider: ${providerId}`);
        }
      } catch (error) {
        ApiService.getInstance(tempConfig as ApiConfig);
        
        switch(providerId) {
          case 'openai':
            api = ApiService.getInstance().getOpenAI();
            break;
          case 'anthropic':
            api = ApiService.getInstance().getAnthropic();
            break;
          case 'deepseek':
            api = ApiService.getInstance().getDeepSeek();
            break;
          case 'perplexity':
            api = ApiService.getInstance().getPerplexity();
            break;
          case 'news':
            api = ApiService.getInstance().getNews();
            break;
          default:
            throw new Error(`Unknown provider: ${providerId}`);
        }
      }

      if (providerId === 'openai') {
        await api.listModels();
      } else {
        const success = await api.testConnection();
        if (!success) {
          throw new Error(`${providerId} API connection test failed`);
        }
      }
      
      setTestResults(prev => ({ ...prev, [providerId]: true }));
    } catch (error: any) {
      console.error(`Error testing ${providerId} connection`, error);
      setTestResults(prev => ({ ...prev, [providerId]: false }));
    } finally {
      setIsTesting(prev => ({ ...prev, [providerId]: false }));
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-lg border border-matrix-primary/20 bg-card/80 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,0,0.1)]"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Key className="w-6 h-6 text-matrix-primary" />
            <h2 className="text-2xl font-bold">API Settings</h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-matrix-primary text-background font-medium hover:bg-matrix-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Configuration
          </motion.button>
        </div>

        {/* Status message */}
        {status.type && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-3 rounded-md text-sm flex items-center gap-2 ${
              status.type === 'success' 
                ? 'bg-green-500/10 text-green-500' 
                : status.type === 'error'
                  ? 'bg-red-500/10 text-red-500'
                  : 'bg-blue-500/10 text-blue-500'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : status.type === 'error' ? (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <Info className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{status.message}</span>
          </motion.div>
        )}

        <div className="text-sm text-foreground/70 mb-8">
          Configure your API keys for various AI providers. These keys will be stored locally in your browser and used for making API requests. 
          You can enable or disable providers as needed. 
          <span className="block mt-2 font-medium text-matrix-primary">
            Only configure the APIs you want to use - the system will work fine with any combination of active providers.
          </span>
        </div>

        {/* Primary Providers */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-matrix-primary">AI Providers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {providers.filter(p => p.primary).map(provider => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                config={config}
                isActive={activeProviders[provider.id] || false}
                isTesting={isTesting[provider.id] || false}
                testResult={testResults[provider.id]}
                onToggle={() => toggleProvider(provider.id)}
                onInputChange={(value) => handleInputChange(provider.id, value)}
                onTest={() => testConnection(provider.id)}
              />
            ))}
          </div>
        </div>

        {/* Secondary Providers */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-matrix-primary">Other APIs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {providers.filter(p => !p.primary).map(provider => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                config={config}
                isActive={activeProviders[provider.id] || false}
                isTesting={isTesting[provider.id] || false}
                testResult={testResults[provider.id]}
                onToggle={() => toggleProvider(provider.id)}
                onInputChange={(value) => handleInputChange(provider.id, value)}
                onTest={() => testConnection(provider.id)}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Provider card component
function ProviderCard({
  provider,
  config,
  isActive,
  isTesting,
  testResult,
  onToggle,
  onInputChange,
  onTest
}: {
  provider: any;
  config: ApiConfig;
  isActive: boolean;
  isTesting: boolean;
  testResult: boolean | null;
  onToggle: () => void;
  onInputChange: (value: string) => void;
  onTest: () => void;
}) {
  const Icon = provider.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * Math.random() }}
      className={`p-4 rounded-lg border ${
        isActive 
          ? 'border-matrix-primary/30 bg-card/90 shadow-[0_0_10px_rgba(0,255,0,0.05)]' 
          : 'border-border/30 bg-card/50 opacity-70'
      } transition-all duration-200`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-md ${isActive ? 'bg-matrix-primary/20' : 'bg-foreground/10'}`}>
            <Icon className={`w-5 h-5 ${isActive ? 'text-matrix-primary' : 'text-foreground/50'}`} />
          </div>
          <div>
            <h4 className="font-semibold">{provider.name}</h4>
            <p className="text-xs text-foreground/50">{provider.description}</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={isActive} 
            onChange={onToggle}
            className="sr-only peer" 
          />
          <div className="w-11 h-6 bg-foreground/10 peer-focus:ring-matrix-primary/30 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-foreground/50 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-matrix-primary/20 peer-checked:after:bg-matrix-primary"></div>
        </label>
      </div>
      
      <div className={`space-y-3 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        <div>
          <div className="flex gap-2 mb-1.5">
            <input
              type="text"
              value={config[provider.id]?.apiKey || ''}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={provider.placeholder}
              disabled={!isActive}
              className="flex-1 px-3 py-2 text-sm bg-background rounded-md border border-border focus:border-matrix-primary focus:ring-1 focus:ring-matrix-primary outline-none"
            />
            <button
              className={`px-3 py-2 rounded-md border text-xs flex items-center gap-1 ${
                testResult === true
                  ? 'bg-green-500/10 text-green-500 border-green-500/30'
                  : testResult === false
                    ? 'bg-red-500/10 text-red-500 border-red-500/30'
                    : 'bg-foreground/5 border-border hover:border-matrix-primary/50 text-foreground/70'
              }`}
              onClick={onTest}
              disabled={isTesting || !isActive}
            >
              {isTesting ? (
                <span className="inline-block w-3 h-3 border-2 border-matrix-primary border-t-transparent rounded-full animate-spin"></span>
              ) : testResult === true ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : testResult === false ? (
                <AlertCircle className="w-3 h-3" />
              ) : null}
              Test
            </button>
          </div>
          <p className="text-xs text-foreground/50">
            {provider.helpText}:{' '}
            <a 
              href={provider.helpUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-matrix-primary hover:underline"
            >
              {provider.helpUrl.replace(/^https?:\/\//, '').split('/')[0]}
            </a>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
