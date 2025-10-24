/**
 * Playground Models
 * 
 * This file contains the logic for retrieving and managing models
 * from various API providers for use in the playground.
 */

import { LucideIcon, Brain, Network, Sparkles, Zap, Code } from 'lucide-react';
import { ApiService } from '@/lib/api';

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  provider: string;
  capabilities: string[];
  metrics: {
    latency: string;
    accuracy: string;
    tokens: string;
  };
}

export interface ProviderGroupedModels {
  provider: string;
  models: ModelOption[];
}

/**
 * Map API provider models to UI model objects
 */
export async function getAvailableModels(): Promise<ProviderGroupedModels[]> {
  // Initialize result array
  const result: ProviderGroupedModels[] = [];

  // Try to initialize ApiService from localStorage if not already initialized
  try {
    ApiService.getInstance();
  } catch {
    // Not initialized yet, try to initialize from localStorage
    if (typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem('ai_comparison_api_config');
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig);
          ApiService.getInstance(config);
        } catch (error) {
          console.error('Error initializing ApiService from localStorage:', error);
        }
      }
    }
  }

  try {
    // Check for OpenAI models
    try {
      const apiService = ApiService.getInstance();
      if (apiService.getOpenAI) {
        const openAiResponse = await apiService.getOpenAI().listModels();
        const openAiModels = openAiResponse.data || [];
        
        const openAiModelOptions: ModelOption[] = openAiModels
          .filter((model: { id: string }) => 
            model.id.includes('gpt') && 
            !model.id.includes('instruct') && 
            !model.id.includes('search') &&
            !model.id.startsWith('audio') &&
            !model.id.startsWith('whisper') &&
            !model.id.startsWith('tts')
          )
          .map((model: { id: string }) => ({
            id: model.id,
            name: formatModelName(model.id),
            description: getModelDescription(model.id),
            icon: getModelIcon(model.id),
            provider: 'OpenAI',
            capabilities: getModelCapabilities(model.id),
            metrics: {
              latency: getModelLatency(model.id),
              accuracy: getModelAccuracy(model.id),
              tokens: getModelTokenLimit(model.id)
            }
          }));
        
        if (openAiModelOptions.length > 0) {
          result.push({
            provider: 'OpenAI',
            models: openAiModelOptions
          });
        }
      }
    } catch (error) {
      console.error('Error loading OpenAI models:', error);
    }
    
    // Check for Anthropic models
    try {
      const apiService = ApiService.getInstance();
      if (apiService.getAnthropic) {
        const anthropicModels = await apiService.getAnthropic().listModels();
        
        const anthropicModelOptions: ModelOption[] = anthropicModels.map((model: any) => ({
          id: model.name,
          name: formatModelName(model.name),
          description: model.description || getModelDescription(model.name),
          icon: getModelIcon(model.name, 'Anthropic'),
          provider: 'Anthropic',
          capabilities: getModelCapabilities(model.name, 'Anthropic'),
          metrics: {
            latency: getModelLatency(model.name, 'Anthropic'),
            accuracy: getModelAccuracy(model.name, 'Anthropic'),
            tokens: `${model.context_window || 100000}`
          }
        }));
        
        if (anthropicModelOptions.length > 0) {
          result.push({
            provider: 'Anthropic',
            models: anthropicModelOptions
          });
        }
      }
    } catch (error) {
      console.error('Error loading Anthropic models:', error);
    }
    
    // Check for DeepSeek models
    try {
      const apiService = ApiService.getInstance();
      if (apiService.getDeepSeek) {
        const deepseekModels = await apiService.getDeepSeek().listModels();
        
        const deepseekModelOptions: ModelOption[] = deepseekModels.map((model: any) => ({
          id: model.id,
          name: formatModelName(model.id),
          description: getModelDescription(model.id, 'DeepSeek'),
          icon: getModelIcon(model.id, 'DeepSeek'),
          provider: 'DeepSeek',
          capabilities: getModelCapabilities(model.id, 'DeepSeek'),
          metrics: {
            latency: getModelLatency(model.id, 'DeepSeek'),
            accuracy: getModelAccuracy(model.id, 'DeepSeek'),
            tokens: getModelTokenLimit(model.id, 'DeepSeek')
          }
        }));
        
        if (deepseekModelOptions.length > 0) {
          result.push({
            provider: 'DeepSeek',
            models: deepseekModelOptions
          });
        }
      }
    } catch (error) {
      console.error('Error loading DeepSeek models:', error);
    }
    
    // Check for Perplexity models
    try {
      const apiService = ApiService.getInstance();
      if (apiService.getPerplexity) {
        const perplexityModels = await apiService.getPerplexity().listModels();
        
        const perplexityModelOptions: ModelOption[] = perplexityModels.map((model: any) => ({
          id: model.id,
          name: model.name || formatModelName(model.id),
          description: model.description || getModelDescription(model.id, 'Perplexity'),
          icon: getModelIcon(model.id, 'Perplexity'),
          provider: 'Perplexity',
          capabilities: model.capabilities || getModelCapabilities(model.id, 'Perplexity'),
          metrics: {
            latency: getModelLatency(model.id, 'Perplexity'),
            accuracy: getModelAccuracy(model.id, 'Perplexity'),
            tokens: `${model.context_length || 12000}`
          }
        }));
        
        if (perplexityModelOptions.length > 0) {
          result.push({
            provider: 'Perplexity',
            models: perplexityModelOptions
          });
        }
      }
    } catch (error) {
      console.error('Error loading Perplexity models:', error);
    }
    
    // Add fallback models if no API is configured
    if (result.length === 0) {
      result.push({
        provider: 'Demo Models',
        models: [
          {
            id: 'gpt-4-demo',
            name: 'GPT-4 (Demo)',
            description: 'Advanced language model for natural conversations',
            icon: Brain,
            provider: 'Demo',
            capabilities: ['Text Generation', 'Code Analysis', 'Data Processing'],
            metrics: {
              latency: '~150ms',
              accuracy: '98.7%',
              tokens: '128K'
            }
          },
          {
            id: 'claude-3-demo',
            name: 'Claude 3 (Demo)',
            description: 'Specialized model for complex reasoning',
            icon: Sparkles,
            provider: 'Demo',
            capabilities: ['Text Generation', 'Content Creation', 'Complex Reasoning'],
            metrics: {
              latency: '~180ms',
              accuracy: '98.2%',
              tokens: '200K'
            }
          }
        ]
      });
    }
  } catch (error) {
    console.error('Error retrieving models:', error);
    
    // Provide fallback if everything fails
    result.push({
      provider: 'Demo Models',
      models: [
        {
          id: 'demo-model',
          name: 'Demo Model',
          description: 'Configure APIs to use real models',
          icon: Brain,
          provider: 'Demo',
          capabilities: ['Demo Capabilities'],
          metrics: {
            latency: 'N/A',
            accuracy: 'N/A',
            tokens: 'N/A'
          }
        }
      ]
    });
  }
  
  return result;
}

// Helper functions for model metadata

function formatModelName(modelId: string): string {
  // Handle different naming conventions
  if (modelId.includes('gpt')) {
    // OpenAI models
    return modelId
      .replace('gpt-3.5-turbo', 'GPT-3.5 Turbo')
      .replace('gpt-4', 'GPT-4')
      .replace('gpt-4-turbo', 'GPT-4 Turbo')
      .replace('gpt-4-vision', 'GPT-4 Vision')
      .replace(/-(\d{8})/, ' (Updated $1)')
      .replace(/-preview/, ' Preview');
  } else if (modelId.includes('claude')) {
    // Anthropic models
    return modelId
      .replace('claude-3-opus', 'Claude 3 Opus')
      .replace('claude-3-sonnet', 'Claude 3 Sonnet')
      .replace('claude-3-haiku', 'Claude 3 Haiku')
      .replace('claude-2.1', 'Claude 2.1')
      .replace(/-(\d{8})/, ' (Updated $1)');
  } else if (modelId.includes('deepseek')) {
    // DeepSeek models
    return modelId
      .replace('deepseek-chat', 'DeepSeek Chat')
      .replace('deepseek-coder', 'DeepSeek Coder')
      .replace('deepseek-lite', 'DeepSeek Lite');
  } else if (modelId.includes('llama') || modelId.includes('mistral') || modelId.includes('sonar')) {
    // Perplexity models
    return modelId
      .replace('llama-3-70b-instruct', 'Llama 3 70B')
      .replace('llama-3-8b-instruct', 'Llama 3 8B')
      .replace('mistral-7b-instruct', 'Mistral 7B')
      .replace('sonar-small-online', 'Sonar Small (Online)')
      .replace('sonar-medium-online', 'Sonar Medium (Online)')
      .replace('sonar-large-online', 'Sonar Large (Online)');
  }
  
  // Default formatting
  return modelId
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getModelDescription(modelId: string, provider: string = 'OpenAI'): string {
  // Descriptions for OpenAI models
  if (provider === 'OpenAI') {
    if (modelId.includes('gpt-3.5')) {
      return 'Efficient model for a wide range of natural language tasks';
    } else if (modelId.includes('gpt-4')) {
      if (modelId.includes('vision')) {
        return 'Advanced model with image understanding capabilities';
      } else if (modelId.includes('turbo')) {
        return 'More efficient version of GPT-4 with improved performance';
      } else {
        return 'OpenAI\'s most advanced model for complex tasks';
      }
    }
  }
  
  // Descriptions for Anthropic models
  if (provider === 'Anthropic') {
    if (modelId.includes('opus')) {
      return 'Anthropic\'s most powerful model for highly complex tasks';
    } else if (modelId.includes('sonnet')) {
      return 'Balanced model for most tasks with excellent performance';
    } else if (modelId.includes('haiku')) {
      return 'Fast and efficient model for simple to moderate tasks';
    } else if (modelId.includes('claude-2')) {
      return 'Previous generation Claude model with good performance';
    }
  }
  
  // Descriptions for DeepSeek models
  if (provider === 'DeepSeek') {
    if (modelId.includes('coder')) {
      return 'Specialized model for code generation and analysis';
    } else if (modelId.includes('lite')) {
      return 'Lightweight and efficient general purpose model';
    } else {
      return 'Advanced conversational AI for general purpose tasks';
    }
  }
  
  // Descriptions for Perplexity models
  if (provider === 'Perplexity') {
    if (modelId.includes('sonar')) {
      if (modelId.includes('small')) {
        return 'Fast model with internet search capabilities';
      } else if (modelId.includes('medium')) {
        return 'Balanced model with internet search capabilities';
      } else if (modelId.includes('large')) {
        return 'Most powerful model with internet search capabilities';
      }
    } else if (modelId.includes('llama-3-70b')) {
      return 'Powerful general purpose model with strong reasoning';
    } else if (modelId.includes('llama-3-8b')) {
      return 'Efficient model for various tasks with good performance';
    } else if (modelId.includes('mistral')) {
      return 'Fast and efficient model for basic to moderate tasks';
    }
  }
  
  return 'AI language model for text generation and analysis';
}

function getModelIcon(modelId: string, provider: string = 'OpenAI'): LucideIcon {
  // Select icon based on model capabilities and provider
  if (provider === 'OpenAI') {
    if (modelId.includes('gpt-4')) {
      return Brain;
    } else {
      return Network;
    }
  } else if (provider === 'Anthropic') {
    return Sparkles;
  } else if (provider === 'DeepSeek') {
    if (modelId.includes('coder')) {
      return Code;
    } else {
      return Network;
    }
  } else if (provider === 'Perplexity') {
    if (modelId.includes('sonar')) {
      return Zap;
    } else {
      return Brain;
    }
  }
  
  return Brain; // Default icon
}

function getModelCapabilities(modelId: string, provider: string = 'OpenAI'): string[] {
  // Basic capabilities based on model
  const capabilities: string[] = ['Text Generation', 'Reasoning'];
  
  if (provider === 'OpenAI') {
    if (modelId.includes('gpt-4')) {
      capabilities.push('Advanced Reasoning', 'Tool Use');
      if (modelId.includes('vision')) {
        capabilities.push('Image Understanding');
      }
    }
  } else if (provider === 'Anthropic') {
    if (modelId.includes('opus')) {
      capabilities.push('Advanced Reasoning', 'Tool Use', 'Complex Tasks');
    } else if (modelId.includes('sonnet')) {
      capabilities.push('Tool Use', 'Content Creation');
    }
  } else if (provider === 'DeepSeek') {
    if (modelId.includes('coder')) {
      capabilities.push('Code Generation', 'Technical Writing');
    }
  } else if (provider === 'Perplexity') {
    if (modelId.includes('sonar')) {
      capabilities.push('Web Search', 'Current Information');
    } else if (modelId.includes('llama-3-70b')) {
      capabilities.push('Advanced Reasoning', 'Content Creation');
    }
  }
  
  return capabilities;
}

function getModelLatency(modelId: string, provider: string = 'OpenAI'): string {
  // Estimate latency based on model size
  if (provider === 'OpenAI') {
    if (modelId.includes('gpt-4')) {
      return '~300ms';
    } else {
      return '~150ms';
    }
  } else if (provider === 'Anthropic') {
    if (modelId.includes('opus')) {
      return '~350ms';
    } else if (modelId.includes('sonnet')) {
      return '~250ms';
    } else {
      return '~150ms';
    }
  } else if (provider === 'DeepSeek') {
    return '~200ms';
  } else if (provider === 'Perplexity') {
    if (modelId.includes('sonar')) {
      return '~400ms'; // Longer due to web search
    } else if (modelId.includes('llama-3-70b')) {
      return '~300ms';
    } else {
      return '~150ms';
    }
  }
  
  return '~200ms'; // Default latency
}

function getModelAccuracy(modelId: string, provider: string = 'OpenAI'): string {
  // Estimate accuracy based on model capabilities
  if (provider === 'OpenAI') {
    if (modelId.includes('gpt-4')) {
      return '95-99%';
    } else {
      return '90-95%';
    }
  } else if (provider === 'Anthropic') {
    if (modelId.includes('opus')) {
      return '95-99%';
    } else if (modelId.includes('sonnet')) {
      return '92-97%';
    } else {
      return '90-95%';
    }
  } else if (provider === 'DeepSeek') {
    if (modelId.includes('coder')) {
      return '90-97%';
    } else {
      return '90-95%';
    }
  } else if (provider === 'Perplexity') {
    if (modelId.includes('sonar')) {
      return '92-98%'; // Potentially more accurate with web search
    } else if (modelId.includes('llama-3-70b')) {
      return '92-97%';
    } else {
      return '90-95%';
    }
  }
  
  return '90-95%'; // Default accuracy
}

function getModelTokenLimit(modelId: string, provider: string = 'OpenAI'): string {
  // Token limit based on model
  if (provider === 'OpenAI') {
    if (modelId.includes('gpt-4-turbo')) {
      return '128K';
    } else if (modelId.includes('gpt-4')) {
      return '8K';
    } else {
      return '16K';
    }
  } else if (provider === 'Anthropic') {
    return '200K';
  } else if (provider === 'DeepSeek') {
    return '32K';
  } else if (provider === 'Perplexity') {
    if (modelId.includes('sonar')) {
      return '12K';
    } else {
      return '8K';
    }
  }
  
  return '4K'; // Default token limit
}
