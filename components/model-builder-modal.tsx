/**
 * @file model-builder-modal.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Modal dialog for building and configuring custom AI model setups.
 */

"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Brain, Zap, Sparkles, Cpu, Code, Image as ImageIcon, Check, Maximize } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ModelCardProps } from './model-card';

interface ModelBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseModels: ModelCardProps[];
  onModelCreate: (model: ModelCardProps) => void;
}

interface Capability {
  id: string;
  name: string;
  description: string;
  source: string;
  cost: number;
  performance: number;
  icon: any;
}

/**
 * @constructor
 */
export function ModelBuilderModal({ isOpen, onClose, baseModels, onModelCreate }: ModelBuilderModalProps) {
  const router = useRouter();
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [modelName, setModelName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const capabilities: Capability[] = [
    {
      id: 'nlp',
      name: 'Natural Language Processing',
      description: 'Advanced text understanding and generation',
      source: 'GPT-4',
      cost: 0.03,
      performance: 98,
      icon: Brain
    },
    {
      id: 'vision',
      name: 'Computer Vision',
      description: 'Image generation and analysis',
      source: 'DALL·E 3',
      cost: 0.02,
      performance: 96,
      icon: ImageIcon
    },
    {
      id: 'code',
      name: 'Code Generation',
      description: 'Intelligent code completion and generation',
      source: 'Claude 3',
      cost: 0.015,
      performance: 95,
      icon: Code
    },
    {
      id: 'reasoning',
      name: 'Logical Reasoning',
      description: 'Complex problem-solving capabilities',
      source: 'LLaMA 3',
      cost: 0.01,
      performance: 94,
      icon: Cpu
    },
    {
      id: 'creativity',
      name: 'Creative Generation',
      description: 'Original content and ideas generation',
      source: 'GPT-4',
      cost: 0.025,
      performance: 97,
      icon: Sparkles
    },
    {
      id: 'optimisation',
      name: 'Performance optimisation',
      description: 'Enhanced speed and efficiency',
      source: 'LLaMA 3',
      cost: 0.02,
      performance: 93,
      icon: Zap
    }
  ];

  const totalCost = selectedCapabilities.reduce(
    (acc, id) => acc + (capabilities.find(c => c.id === id)?.cost || 0),
    0
  );

  const averagePerformance = selectedCapabilities.length
    ? selectedCapabilities.reduce(
        (acc, id) => acc + (capabilities.find(c => c.id === id)?.performance || 0),
        0
      ) / selectedCapabilities.length
    : 0;

  const handleCapabilityToggle = (id: string) => {
    setSelectedCapabilities(prev =>
      prev.includes(id)
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  const handleCreate = () => {
    const selectedCapabilityDetails = selectedCapabilities.map(id => 
      capabilities.find(c => c.id === id)
    ).filter((c): c is Capability => c !== undefined);

    const newModel: ModelCardProps = {
      id: `custom-${Date.now()}`,
      title: modelName,
      description: `Custom model combining ${selectedCapabilityDetails.map(c => c.name.toLowerCase()).join(', ')}`,
      icon: selectedCapabilityDetails[0]?.icon || Brain,
      category: 'custom',
      provider: 'Custom',
      metrics: {
        accuracy: averagePerformance,
        latency: 100 + (selectedCapabilities.length * 10), // Estimated latency
        requests: "0",
        costper1k: totalCost,
        contextLength: 100000,
        dailyQuota: 100000
      },
      capabilities: selectedCapabilityDetails.map(c => c.description),
      bestFor: selectedCapabilityDetails.map(c => c.name),
      limitations: [
        "Custom model performance may vary",
        "Requires fine-tuning for optimal results",
        "Limited to selected capabilities"
      ]
    };

    onModelCreate(newModel);
    setShowSuccess(true);
    
    // Reset form
    setModelName('');
    setSelectedCapabilities([]);
    
    // Close after showing success message
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-auto rounded-lg border border-border bg-card p-6"
          >
            {showSuccess ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-card rounded-lg"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-matrix-primary/20 mb-4">
                    <Check className="w-8 h-8 text-matrix-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Model Created Successfully!</h3>
                  <p className="text-foreground/70">Redirecting to view all models...</p>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 p-2 rounded-lg hover:bg-matrix-primary/10 text-foreground/70 hover:text-matrix-primary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-matrix-primary to-matrix-secondary text-transparent bg-clip-text">
                    Build Your Custom AI Model
                  </h2>
                  <p className="text-foreground/70">
                    Combine capabilities from different models to create your perfect AI solution
                  </p>
                </div>

                {/* Model Name Input */}
                <div className="mb-8">
                  <label className="block text-sm font-medium mb-2">Model Name</label>
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="Enter a name for your model"
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-matrix-primary focus:ring-1 focus:ring-matrix-primary outline-none"
                  />
                </div>

                {/* Capabilities Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {capabilities.map((capability) => {
                    const isSelected = selectedCapabilities.includes(capability.id);
                    const Icon = capability.icon;

                    return (
                      <motion.button
                        key={capability.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCapabilityToggle(capability.id)}
                        className={`p-4 rounded-lg border ${
                          isSelected
                            ? 'border-matrix-primary bg-matrix-primary/10'
                            : 'border-border bg-background hover:border-matrix-primary/50'
                        } transition-colors text-left`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            isSelected ? 'bg-matrix-primary/20' : 'bg-background'
                          }`}>
                            <Icon className="w-5 h-5 text-matrix-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium mb-1">{capability.name}</h3>
                            <p className="text-sm text-foreground/70 mb-2">
                              {capability.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-foreground/50">
                              <span>Source: {capability.source}</span>
                              <span>Cost: ${capability.cost}/1K tokens</span>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="border-t border-border pt-6 mb-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-foreground/70 mb-1">Estimated Cost</p>
                      <p className="text-2xl font-bold text-matrix-primary">
                        ${totalCost.toFixed(3)}/1K tokens
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground/70 mb-1">Average Performance</p>
                      <p className="text-2xl font-bold text-matrix-secondary">
                        {averagePerformance.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <button
                      onClick={handleCreate}
                      disabled={!modelName || selectedCapabilities.length === 0}
                      className="flex-1 py-3 rounded-lg bg-matrix-primary text-background font-medium hover:bg-matrix-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create Model
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 py-3 rounded-lg border border-matrix-primary text-matrix-primary font-medium hover:bg-matrix-primary/10 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  <button
                    onClick={() => {
                      router.push('/model-builder');
                      onClose();
                    }}
                    className="py-2.5 w-full rounded-lg border border-matrix-primary text-matrix-primary hover:bg-matrix-primary/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Maximize className="w-4 h-4" />
                    Open Full-Screen Builder (Recommended)
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
