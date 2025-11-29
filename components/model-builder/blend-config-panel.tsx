/**
 * @file blend-config-panel.tsx
 * @description Configuration panel for creating and editing model blends
 * @author Assistant
 * @date 2024-11-23
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Save, AlertTriangle, Check, Trash2, Percent } from 'lucide-react';
import {
  BlendedModelConfig,
  ModelBlendEntry,
  AggregationStrategy,
  ModelProvider,
} from '@/lib/types/modelBuilder';
import { BlendedModelsStorage } from '@/lib/storage/blendedModelsStorage';
import { calculateCost } from '@/lib/utils/costCalculator';
import { getAvailableModelsSimple, type SimpleModel } from '@/lib/utils/modelLoader';

interface BlendConfigPanelProps {
  blend?: BlendedModelConfig;
  onSave?: (config: BlendedModelConfig) => void;
  onCancel?: () => void;
}

export function BlendConfigPanel({
  blend,
  onSave,
  onCancel,
}: BlendConfigPanelProps) {
  const [name, setName] = useState(blend?.name || '');
  const [description, setDescription] = useState(blend?.description || '');
  const [models, setModels] = useState<ModelBlendEntry[]>(
    blend?.models || [
      {
        modelId: 'gpt-4-turbo-preview',
        provider: 'openai',
        weight: 100,
      },
    ]
  );
  const [strategy, setStrategy] = useState<AggregationStrategy>(
    blend?.aggregationStrategy || 'weighted'
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<SimpleModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);

  const storage = BlendedModelsStorage.getInstance();

  // Load available models based on configured API keys
  useEffect(() => {
    const loadModels = async () => {
      setLoadingModels(true);
      try {
        const models = await getAvailableModelsSimple();
        setAvailableModels(models);

        // If this is a new blend and we have models, set the first one as default
        if (!blend && models.length > 0) {
          setModels([{
            modelId: models[0].id,
            provider: models[0].provider as ModelProvider,
            weight: 100,
          }]);
        }
      } catch (error) {
        console.error('Error loading models:', error);
        setError('Failed to load available models');
      } finally {
        setLoadingModels(false);
      }
    };

    loadModels();

    // Listen for API key changes to reload models in real-time
    const handleApiKeyChange = () => {
      loadModels();
    };

    window.addEventListener('api-keys-updated', handleApiKeyChange);

    return () => {
      window.removeEventListener('api-keys-updated', handleApiKeyChange);
    };
  }, [blend]);

  // Validate weights sum to 100
  const totalWeight = models.reduce((sum, m) => sum + m.weight, 0);
  const isValid = Math.abs(totalWeight - 100) < 0.01 && models.length > 0 && models.length <= 3 && name.trim() !== '';

  const handleAddModel = () => {
    if (models.length >= 3) {
      setError('Maximum 3 models per blend');
      return;
    }

    if (availableModels.length === 0) {
      setError('No models available. Please configure API keys.');
      return;
    }

    const unusedModel = availableModels.find(m => !models.some(em => em.modelId === m.id));
    const newModel: ModelBlendEntry = {
      modelId: unusedModel?.id || availableModels[0].id,
      provider: (unusedModel?.provider || availableModels[0].provider) as ModelProvider,
      weight: 0,
    };

    setModels([...models, newModel]);
    setError(null);

    // Auto-adjust weights
    if (models.length === 0) {
      newModel.weight = 100;
    } else {
      redistributeWeights([...models, newModel]);
    }
  };

  const handleRemoveModel = (index: number) => {
    const newModels = models.filter((_, i) => i !== index);
    setModels(newModels);
    if (newModels.length > 0) {
      redistributeWeights(newModels);
    }
  };

  const handleModelChange = (index: number, modelId: string) => {
    const model = availableModels.find(m => m.id === modelId);
    if (!model) return;

    const newModels = [...models];
    newModels[index] = {
      ...newModels[index],
      modelId: model.id,
      provider: model.provider as ModelProvider,
    };
    setModels(newModels);
  };

  const handleWeightChange = (index: number, weight: number) => {
    const newModels = [...models];
    newModels[index].weight = Math.max(0, Math.min(100, weight));
    setModels(newModels);
  };

  const redistributeWeights = (modelList: ModelBlendEntry[]) => {
    if (modelList.length === 0) return;

    const equalWeight = 100 / modelList.length;
    modelList.forEach(m => {
      m.weight = Math.round(equalWeight * 10) / 10;
    });

    // Adjust for rounding
    const diff = 100 - modelList.reduce((sum, m) => sum + m.weight, 0);
    if (diff !== 0) {
      modelList[0].weight += diff;
    }

    setModels([...modelList]);
  };

  const handleSave = async () => {
    if (!isValid) {
      setError('Please fix validation errors before saving');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const config: BlendedModelConfig = {
        id: blend?.id || `blend-${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        models,
        aggregationStrategy: strategy,
        settings: blend?.settings || {
          temperature: 0.7,
          maxTokens: 1000,
        },
        metadata: blend?.metadata || {
          created: new Date(),
          totalCalls: 0,
        },
      };

      await storage.saveBlend(config);
      onSave?.(config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save blend');
    } finally {
      setSaving(false);
    }
  };

  const estimateCost = () => {
    // Estimate cost for 1000 tokens input, 500 tokens output
    const inputTokens = 1000;
    const outputTokens = 500;

    return models.reduce((total, model) => {
      const cost = calculateCost(model.provider, model.modelId, inputTokens, outputTokens);
      return total + (cost * model.weight / 100);
    }, 0);
  };

  return (
    <div className="p-6 bg-card rounded-lg border border-border">
      <h3 className="text-lg font-semibold mb-4">Blend Configuration</h3>

      {/* Loading State */}
      {loadingModels && (
        <div className="mb-4 p-3 bg-background/50 border border-border rounded-md">
          <p className="text-sm text-foreground/70">Loading available models...</p>
        </div>
      )}

      {/* No Models Warning */}
      {!loadingModels && availableModels.length === 0 && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/50 rounded-md">
          <p className="text-sm text-yellow-500">
            No models available. Please add API keys in Settings to create model blends.
          </p>
        </div>
      )}

      {/* Name & Description */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Blend Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Balanced Performance Blend"
            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-matrix-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the purpose of this blend..."
            rows={2}
            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-matrix-primary"
          />
        </div>
      </div>

      {/* Model Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium">Models ({models.length}/3)</label>
          <button
            onClick={handleAddModel}
            disabled={models.length >= 3}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-matrix-primary/20 text-matrix-primary rounded-md hover:bg-matrix-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add Model
          </button>
        </div>

        <AnimatePresence>
          {models.map((model, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 mb-3 p-3 bg-background/50 rounded-lg border border-border"
            >
              <select
                value={model.modelId}
                onChange={(e) => handleModelChange(index, e.target.value)}
                className="flex-1 px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-matrix-primary"
                disabled={loadingModels || availableModels.length === 0}
              >
                {availableModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.provider})
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={model.weight}
                  onChange={(e) => handleWeightChange(index, parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-2 text-center bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-matrix-primary"
                />
                <Percent className="w-4 h-4 text-foreground/60" />
              </div>

              <button
                onClick={() => handleRemoveModel(index)}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-md"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Weight Validation */}
        {models.length > 0 && (
          <div className={`flex items-center gap-2 mt-2 text-sm ${
            Math.abs(totalWeight - 100) < 0.01 ? 'text-green-500' : 'text-red-500'
          }`}>
            {Math.abs(totalWeight - 100) < 0.01 ? (
              <>
                <Check className="w-4 h-4" />
                Weights sum to 100%
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                Weights must sum to 100% (currently {totalWeight.toFixed(1)}%)
              </>
            )}
          </div>
        )}
      </div>

      {/* Aggregation Strategy */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">Aggregation Strategy</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'weighted', label: 'Weighted', desc: 'Combine based on weights' },
            { value: 'consensus', label: 'Consensus', desc: 'Most common response' },
            { value: 'first-success', label: 'First Success', desc: 'Fastest valid response' },
            { value: 'best-of', label: 'Best Of', desc: 'Highest quality response' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStrategy(opt.value as AggregationStrategy)}
              className={`p-3 rounded-lg border text-left transition-all ${
                strategy === opt.value
                  ? 'border-matrix-primary bg-matrix-primary/10'
                  : 'border-border hover:border-matrix-primary/50'
              }`}
            >
              <div className="font-medium text-sm">{opt.label}</div>
              <div className="text-xs text-foreground/60 mt-1">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Cost Estimate */}
      {models.length > 0 && (
        <div className="p-4 bg-background/50 rounded-lg border border-border mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground/70">Estimated Cost (1K/0.5K tokens):</span>
            <span className="text-lg font-semibold text-matrix-primary">
              ${estimateCost().toFixed(4)}
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-md">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={!isValid || saving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-matrix-primary text-black font-medium rounded-md hover:bg-matrix-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : blend ? 'Update Blend' : 'Save Blend'}
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-border text-foreground/70 rounded-md hover:bg-background"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}