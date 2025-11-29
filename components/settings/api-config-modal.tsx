"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Key, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { ApiService, ApiConfig } from "@/lib/api";

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiConfigModal({ isOpen, onClose }: ApiConfigModalProps) {
  const [config, setConfig] = useState<ApiConfig>({
    openai: { apiKey: '' },
    news: { apiKey: '' },
    anthropic: { apiKey: '' },
    perplexity: { apiKey: '' },
    google: { apiKey: '' }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | null;
  }>({ message: '', type: null });
  const [isTesting, setIsTesting] = useState<{
    openai: boolean;
    news: boolean;
    anthropic: boolean;
    perplexity: boolean;
    google: boolean;
  }>({
    openai: false,
    news: false,
    anthropic: false,
    perplexity: false,
    google: false
  });
  const [testResults, setTestResults] = useState<{
    openai: boolean | null;
    news: boolean | null;
    anthropic: boolean | null;
    perplexity: boolean | null;
    google: boolean | null;
  }>({
    openai: null,
    news: null,
    anthropic: null,
    perplexity: null,
    google: null
  });

  // Load saved config on mount
  useEffect(() => {
    const loadSavedConfig = () => {
      try {
        const savedConfig = localStorage.getItem('modelviz_api_config');
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig) as ApiConfig;
          // Mask API keys in the UI
          setConfig({
            openai: {
              apiKey: parsedConfig.openai?.apiKey
                ? parsedConfig.openai.apiKey.substring(0, 4) + '...' + parsedConfig.openai.apiKey.slice(-4)
                : ''
            },
            news: {
              apiKey: parsedConfig.news?.apiKey
                ? parsedConfig.news.apiKey.substring(0, 4) + '...' + parsedConfig.news.apiKey.slice(-4)
                : ''
            },
            anthropic: {
              apiKey: parsedConfig.anthropic?.apiKey
                ? parsedConfig.anthropic.apiKey.substring(0, 4) + '...' + parsedConfig.anthropic.apiKey.slice(-4)
                : ''
            },
            perplexity: {
              apiKey: parsedConfig.perplexity?.apiKey
                ? parsedConfig.perplexity.apiKey.substring(0, 4) + '...' + parsedConfig.perplexity.apiKey.slice(-4)
                : ''
            },
            google: {
              apiKey: parsedConfig.google?.apiKey
                ? parsedConfig.google.apiKey.substring(0, 4) + '...' + parsedConfig.google.apiKey.slice(-4)
                : ''
            }
          });
          
          // Store the actual config in ApiService
          if (parsedConfig.openai?.apiKey || parsedConfig.news?.apiKey) {
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
        }
      } catch (error) {
        console.error('Error loading saved configuration', error);
        setStatus({ 
          message: 'Failed to load saved configuration', 
          type: 'error' 
        });
      }
    };

    if (isOpen) {
      loadSavedConfig();
    }
  }, [isOpen]);

  const handleSave = () => {
    setIsLoading(true);
    setStatus({ message: 'Saving configuration...', type: 'info' });

    try {
      // Use the real API keys, not the masked ones displayed in the UI
      const savedConfig = localStorage.getItem('modelviz_api_config');
      let updatedConfig: ApiConfig = { openai: { apiKey: '' }, news: { apiKey: '' } };
      
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig) as ApiConfig;
        updatedConfig = { ...parsedConfig };
      }
      
      // Only update keys that were actually changed (not masked)
      if (config.openai?.apiKey && !config.openai.apiKey.includes('...')) {
        updatedConfig.openai = { apiKey: config.openai.apiKey };
      }
      
      if (config.news?.apiKey && !config.news.apiKey.includes('...')) {
        updatedConfig.news = { apiKey: config.news.apiKey };
      }
      
      if (config.anthropic?.apiKey && !config.anthropic.apiKey.includes('...')) {
        updatedConfig.anthropic = { apiKey: config.anthropic.apiKey };
      }

      if (config.perplexity?.apiKey && !config.perplexity.apiKey.includes('...')) {
        updatedConfig.perplexity = { apiKey: config.perplexity.apiKey };
      }

      if (config.google?.apiKey && !config.google.apiKey.includes('...')) {
        updatedConfig.google = { apiKey: config.google.apiKey };
      }

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

      setStatus({ message: 'Configuration saved successfully!', type: 'success' });
      setTimeout(() => {
        setIsLoading(false);
        window.location.reload(); // Refresh page to load models with new API keys
      }, 1500);
    } catch (error) {
      console.error('Error saving configuration', error);
      setStatus({ message: 'Failed to save configuration', type: 'error' });
      setIsLoading(false);
    }
  };

  const handleInputChange = (service: keyof ApiConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [service]: { apiKey: value }
    }));
    
    // Reset test results when input changes
    setTestResults(prev => ({
      ...prev,
      [service]: null
    }));
  };

  const testConnection = async (service: 'openai' | 'news' | 'anthropic' | 'perplexity' | 'google') => {
    setIsTesting(prev => ({ ...prev, [service]: true }));
    
    try {
      // Get the actual API key
      const savedConfig = localStorage.getItem('modelviz_api_config');
      let apiKey = config[service]?.apiKey || '';
      
      // If the key is masked, use the saved one
      if (apiKey.includes('...') && savedConfig) {
        const parsedConfig = JSON.parse(savedConfig) as ApiConfig;
        apiKey = parsedConfig[service]?.apiKey || '';
      }
      
      if (!apiKey) {
        setTestResults(prev => ({ ...prev, [service]: false }));
        setIsTesting(prev => ({ ...prev, [service]: false }));
        return;
      }
      
      const tempConfig: Partial<ApiConfig> = {};
      tempConfig[service] = { apiKey };
      
      // Try to initialize and make a test call
      let api: any;
      try {
        ApiService.getInstance().updateConfig(tempConfig);
        switch(service) {
          case 'openai':
            api = ApiService.getInstance().getOpenAI();
            break;
          case 'news':
            api = ApiService.getInstance().getNews();
            break;
          case 'anthropic':
            api = ApiService.getInstance().getAnthropic();
            break;
          case 'perplexity':
            api = ApiService.getInstance().getPerplexity();
            break;
          case 'google':
            api = ApiService.getInstance().getGoogle();
            break;
        }
      } catch (error) {
        ApiService.getInstance(tempConfig as ApiConfig);
        switch(service) {
          case 'openai':
            api = ApiService.getInstance().getOpenAI();
            break;
          case 'news':
            api = ApiService.getInstance().getNews();
            break;
          case 'anthropic':
            api = ApiService.getInstance().getAnthropic();
            break;
          case 'perplexity':
            api = ApiService.getInstance().getPerplexity();
            break;
          case 'google':
            api = ApiService.getInstance().getGoogle();
            break;
        }
      }
      
      // Make a simple test request
      if (service === 'openai') {
        await api.listModels();
      } else if (service === 'news') {
        // Use the dedicated test method for News API
        const success = await api.testConnection();
        if (!success) {
          throw new Error('News API connection test failed');
        }
      } else if (service === 'anthropic' || service === 'perplexity' || service === 'google') {
        // Use test connection for the new providers
        const success = await api.testConnection();
        if (!success) {
          throw new Error(`${service} API connection test failed`);
        }
      }
      
      setTestResults(prev => ({ ...prev, [service]: true }));
    } catch (error) {
      console.error(`Error testing ${service} connection`, error);
      setTestResults(prev => ({ ...prev, [service]: false }));
    } finally {
      setIsTesting(prev => ({ ...prev, [service]: false }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md rounded-lg border border-border bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-matrix-primary" />
                <h2 className="text-xl font-bold">API Configuration</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-matrix-primary/10 text-foreground/70 hover:text-matrix-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status message */}
            {status.type && (
              <div 
                className={`mb-4 p-3 rounded-md text-sm flex items-center gap-2 ${
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
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{status.message}</span>
              </div>
            )}

            {/* Form */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium mb-2">
                  OpenAI API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={config.openai?.apiKey || ''}
                    onChange={(e) => handleInputChange('openai', e.target.value)}
                    placeholder="sk-..."
                    className="flex-1 px-3 py-2 bg-background rounded-md border border-border focus:border-matrix-primary focus:ring-1 focus:ring-matrix-primary outline-none text-sm"
                  />
                  <button
                    className={`px-3 py-2 rounded-md border border-border hover:border-matrix-primary text-xs flex items-center gap-1 ${
                      testResults.openai === true
                        ? 'bg-green-500/10 text-green-500 border-green-500/30'
                        : testResults.openai === false
                          ? 'bg-red-500/10 text-red-500 border-red-500/30'
                          : 'bg-background'
                    }`}
                    onClick={() => testConnection('openai')}
                    disabled={isTesting.openai}
                  >
                    {isTesting.openai ? (
                      <span className="inline-block w-3 h-3 border-2 border-matrix-primary border-t-transparent rounded-full animate-spin"></span>
                    ) : testResults.openai === true ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : testResults.openai === false ? (
                      <AlertCircle className="w-3 h-3" />
                    ) : null}
                    Test
                  </button>
                </div>
                <p className="mt-1 text-xs text-foreground/50">
                  Get from: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-matrix-primary hover:underline">OpenAI Dashboard</a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Anthropic API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={config.anthropic?.apiKey || ''}
                    onChange={(e) => handleInputChange('anthropic', e.target.value)}
                    placeholder="sk_ant_..."
                    className="flex-1 px-3 py-2 bg-background rounded-md border border-border focus:border-matrix-primary focus:ring-1 focus:ring-matrix-primary outline-none text-sm"
                  />
                  <button
                    className={`px-3 py-2 rounded-md border border-border hover:border-matrix-primary text-xs flex items-center gap-1 ${
                      testResults.anthropic === true
                        ? 'bg-green-500/10 text-green-500 border-green-500/30'
                        : testResults.anthropic === false
                          ? 'bg-red-500/10 text-red-500 border-red-500/30'
                          : 'bg-background'
                    }`}
                    onClick={() => testConnection('anthropic')}
                    disabled={isTesting.anthropic}
                  >
                    {isTesting.anthropic ? (
                      <span className="inline-block w-3 h-3 border-2 border-matrix-primary border-t-transparent rounded-full animate-spin"></span>
                    ) : testResults.anthropic === true ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : testResults.anthropic === false ? (
                      <AlertCircle className="w-3 h-3" />
                    ) : null}
                    Test
                  </button>
                </div>
                <p className="mt-1 text-xs text-foreground/50">
                  Get from: <a href="https://console.anthropic.com/keys" target="_blank" rel="noopener noreferrer" className="text-matrix-primary hover:underline">Anthropic Console</a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Google Gemini API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={config.google?.apiKey || ''}
                    onChange={(e) => handleInputChange('google', e.target.value)}
                    placeholder="Your Google API key"
                    className="flex-1 px-3 py-2 bg-background rounded-md border border-border focus:border-matrix-primary focus:ring-1 focus:ring-matrix-primary outline-none text-sm"
                  />
                  <button
                    className={`px-3 py-2 rounded-md border border-border hover:border-matrix-primary text-xs flex items-center gap-1 ${
                      testResults.google === true
                        ? 'bg-green-500/10 text-green-500 border-green-500/30'
                        : testResults.google === false
                          ? 'bg-red-500/10 text-red-500 border-red-500/30'
                          : 'bg-background'
                    }`}
                    onClick={() => testConnection('google')}
                    disabled={isTesting.google}
                  >
                    {isTesting.google ? (
                      <span className="inline-block w-3 h-3 border-2 border-matrix-primary border-t-transparent rounded-full animate-spin"></span>
                    ) : testResults.google === true ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : testResults.google === false ? (
                      <AlertCircle className="w-3 h-3" />
                    ) : null}
                    Test
                  </button>
                </div>
                <p className="mt-1 text-xs text-foreground/50">
                  Get from: <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-matrix-primary hover:underline">Google AI Studio</a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Perplexity API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={config.perplexity?.apiKey || ''}
                    onChange={(e) => handleInputChange('perplexity', e.target.value)}
                    placeholder="pplx-..."
                    className="flex-1 px-3 py-2 bg-background rounded-md border border-border focus:border-matrix-primary focus:ring-1 focus:ring-matrix-primary outline-none text-sm"
                  />
                  <button
                    className={`px-3 py-2 rounded-md border border-border hover:border-matrix-primary text-xs flex items-center gap-1 ${
                      testResults.perplexity === true
                        ? 'bg-green-500/10 text-green-500 border-green-500/30'
                        : testResults.perplexity === false
                          ? 'bg-red-500/10 text-red-500 border-red-500/30'
                          : 'bg-background'
                    }`}
                    onClick={() => testConnection('perplexity')}
                    disabled={isTesting.perplexity}
                  >
                    {isTesting.perplexity ? (
                      <span className="inline-block w-3 h-3 border-2 border-matrix-primary border-t-transparent rounded-full animate-spin"></span>
                    ) : testResults.perplexity === true ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : testResults.perplexity === false ? (
                      <AlertCircle className="w-3 h-3" />
                    ) : null}
                    Test
                  </button>
                </div>
                <p className="mt-1 text-xs text-foreground/50">
                  Get from: <a href="https://www.perplexity.ai/settings/api" target="_blank" rel="noopener noreferrer" className="text-matrix-primary hover:underline">Perplexity API Settings</a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  News API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={config.news?.apiKey || ''}
                    onChange={(e) => handleInputChange('news', e.target.value)}
                    placeholder="Your News API key"
                    className="flex-1 px-3 py-2 bg-background rounded-md border border-border focus:border-matrix-primary focus:ring-1 focus:ring-matrix-primary outline-none text-sm"
                  />
                  <button
                    className={`px-3 py-2 rounded-md border border-border hover:border-matrix-primary text-xs flex items-center gap-1 ${
                      testResults.news === true
                        ? 'bg-green-500/10 text-green-500 border-green-500/30'
                        : testResults.news === false
                          ? 'bg-red-500/10 text-red-500 border-red-500/30'
                          : 'bg-background'
                    }`}
                    onClick={() => testConnection('news')}
                    disabled={isTesting.news}
                  >
                    {isTesting.news ? (
                      <span className="inline-block w-3 h-3 border-2 border-matrix-primary border-t-transparent rounded-full animate-spin"></span>
                    ) : testResults.news === true ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : testResults.news === false ? (
                      <AlertCircle className="w-3 h-3" />
                    ) : null}
                    Test
                  </button>
                </div>
                <p className="mt-1 text-xs text-foreground/50">
                  Get from: <a href="https://newsapi.org/register" target="_blank" rel="noopener noreferrer" className="text-matrix-primary hover:underline">News API</a>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end mt-6">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-matrix-primary text-background font-medium hover:bg-matrix-primary/90 transition-colors"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Configuration
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
