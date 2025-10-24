/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description AI models directory page displaying available models with filtering, comparison, and custom model building capabilities
 */
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, MessageSquare, Image, Music, Plus, Sparkles } from 'lucide-react';
import { ModelFilter } from '@/components/model-filter';
import { ModelGrid } from '@/components/model-grid';
import { ModelComparison } from '@/components/model-comparison';
import { ModelRecommender } from '@/components/model-recommender';
import { ModelBuilderModal } from '@/components/model-builder-modal';
import type { ModelCardProps } from '@/components/model-card';

const categories = [
  { value: "all", label: "All Models" },
  { value: "language", label: "Language" },
  { value: "vision", label: "Vision" },
  { value: "audio", label: "Audio" }
];

const sortOptions = [
  { value: "accuracy", label: "Accuracy" },
  { value: "latency", label: "Latency" },
  { value: "costPer1k", label: "Cost" },
  { value: "requests", label: "Usage" }
];

const baseModels: ModelCardProps[] = [
  {
    id: "gpt-4",
    title: "GPT-4 Turbo",
    description: "Advanced language model for natural conversations and complex tasks",
    icon: Brain,
    category: "language",
    provider: "OpenAI",
    metrics: {
      accuracy: 98.7,
      latency: 150,
      requests: "5.2M",
      costper1k: 0.03,
      contextLength: 128000,
      dailyQuota: 500000
    },
    capabilities: [
      "Natural language understanding",
      "Code generation",
      "Creative writing",
      "Complex reasoning"
    ],
    bestFor: [
      "Conversational AI",
      "Content creation",
      "Code assistance",
      "Analysis tasks"
    ],
    limitations: [
      "Higher latency than simpler models",
      "Cost scales with usage",
      "May occasionally hallucinate"
    ]
  },
  {
    id: "claude-3",
    title: "Claude 3",
    description: "Sophisticated AI for analysis and long-form content generation",
    icon: Brain,
    category: "language",
    provider: "Anthropic",
    metrics: {
      accuracy: 98.9,
      latency: 145,
      requests: "3.8M",
      costper1k: 0.025,
      contextLength: 200000,
      dailyQuota: 400000
    },
    capabilities: [
      "Document analysis",
      "Research assistance",
      "Content creation",
      "Data interpretation"
    ],
    bestFor: [
      "Academic research",
      "Document analysis",
      "Technical writing",
      "Data analysis"
    ],
    limitations: [
      "Limited creative capabilities",
      "Strict content policies",
      "No code execution"
    ]
  },
  {
    id: "llama-3",
    title: "LLaMA 3",
    description: "Open-source language model with state-of-the-art performance",
    icon: Brain,
    category: "language",
    provider: "Meta",
    metrics: {
      accuracy: 97.8,
      latency: 120,
      requests: "2.9M",
      costper1k: 0.015,
      contextLength: 100000,
      dailyQuota: 1000000
    },
    capabilities: [
      "Multilingual support",
      "Knowledge retrieval",
      "Task automation",
      "Context understanding"
    ],
    bestFor: [
      "Local deployment",
      "High-volume tasks",
      "Custom training",
      "Edge computing"
    ],
    limitations: [
      "Lower accuracy than GPT-4",
      "Limited training data",
      "Requires more prompting"
    ]
  },
  {
    id: "dall-e-3",
    title: "DALL·E 3",
    description: "Advanced image generation from natural language descriptions",
    icon: Image,
    category: "vision",
    provider: "OpenAI",
    metrics: {
      accuracy: 96.5,
      latency: 250,
      requests: "4.1M",
      costper1k: 0.04,
      contextLength: 0,
      dailyQuota: 200000
    },
    capabilities: [
      "Photorealistic images",
      "Artistic styles",
      "Complex compositions",
      "Image editing"
    ],
    bestFor: [
      "Marketing content",
      "Concept art",
      "Product design",
      "Visual storytelling"
    ],
    limitations: [
      "Limited animation support",
      "Style consistency issues",
      "No video generation"
    ]
  },
  {
    id: "midjourney-v6",
    title: "Midjourney V6",
    description: "Creative image generation with artistic precision",
    icon: Image,
    category: "vision",
    provider: "Midjourney",
    metrics: {
      accuracy: 95.8,
      latency: 280,
      requests: "3.5M",
      costper1k: 0.035,
      contextLength: 0,
      dailyQuota: 150000
    },
    capabilities: [
      "Artistic rendering",
      "Style consistency",
      "Detail control",
      "Variations generation"
    ],
    bestFor: [
      "Digital art",
      "Illustrations",
      "Creative projects",
      "Style exploration"
    ],
    limitations: [
      "Less photorealistic",
      "Limited editing",
      "Fixed aspect ratios"
    ]
  },
  {
    id: "whisper-v3",
    title: "Whisper V3",
    description: "Multilingual speech recognition and transcription",
    icon: Music,
    category: "audio",
    provider: "OpenAI",
    metrics: {
      accuracy: 97.2,
      latency: 90,
      requests: "1.8M",
      costper1k: 0.01,
      contextLength: 0,
      dailyQuota: 300000
    },
    capabilities: [
      "Speech recognition",
      "Translation",
      "Speaker diarization",
      "Noise reduction"
    ],
    bestFor: [
      "Transcription",
      "Subtitling",
      "Voice commands",
      "Meeting notes"
    ],
    limitations: [
      "Speaker identification limits",
      "Background noise sensitivity",
      "Accent variations"
    ]
  }
];

type View = 'grid' | 'comparison' | 'recommender' | 'custom';

/**
 * @constructor
 */
export default function ModelsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("accuracy");
  const [view, setView] = useState<View>('grid');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [customModels, setCustomModels] = useState<ModelCardProps[]>([]);

  const handleModelCreate = (model: ModelCardProps) => {
    setCustomModels(prev => [...prev, model]);
    setIsBuilderOpen(false);
  };

  const allModels = [...baseModels, ...customModels];

  const filteredModels = allModels
    .filter(model => {
      const matchesSearch = 
        model.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (model.capabilities ?? []).some(cap => 
          cap.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      const matchesCategory = selectedCategory === "all" || model.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const key = sortBy as keyof typeof a.metrics;
      const aValue = a.metrics[key];
      const bValue = b.metrics[key];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortBy === 'costper1k' || sortBy === 'latency'
          ? aValue - bValue  // Lower is better
          : bValue - aValue; // Higher is better
      }
      return 0;
    });

  const selectedModelDetails = selectedModels
    .map(id => allModels.find(m => m.id === id))
    .filter((m): m is ModelCardProps => m !== undefined);

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-matrix-primary to-matrix-secondary text-transparent bg-clip-text">
              AI Models
            </h1>
            <p className="text-foreground/70">
              Explore our cutting-edge AI models and their capabilities
            </p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => setView(view === 'custom' ? 'grid' : 'custom')}
              className={`px-4 py-2 rounded-lg border ${
                view === 'custom'
                  ? 'border-matrix-primary bg-matrix-primary/10 text-matrix-primary'
                  : 'border-border hover:border-matrix-primary/50'
              } transition-colors flex items-center gap-2`}
            >
              <Sparkles className="w-4 h-4" />
              {customModels.length > 0 ? `Custom Models (${customModels.length})` : 'Custom Models'}
            </button>
            <button
              onClick={() => setView('recommender')}
              className={`px-4 py-2 rounded-lg border ${
                view === 'recommender'
                  ? 'border-matrix-primary bg-matrix-primary/10 text-matrix-primary'
                  : 'border-border hover:border-matrix-primary/50'
              } transition-colors`}
            >
              Find Best Model
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsBuilderOpen(true)}
              className="px-4 py-2 rounded-lg bg-matrix-primary text-background font-medium hover:bg-matrix-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Build Your Own
            </motion.button>
          </div>
        </div>

        {(view === 'grid' || view === 'custom') && (
          <>
            <div className="mb-8">
              <ModelFilter
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                sortBy={sortBy}
                onSearchChange={setSearchQuery}
                onCategoryChange={setSelectedCategory}
                onSortChange={setSortBy}
                categories={categories}
                sortOptions={sortOptions}
              />
            </div>

            {view === 'custom' && customModels.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <Sparkles className="w-12 h-12 text-matrix-primary/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Custom Models Yet</h3>
                <p className="text-foreground/70 mb-6">
                  Create your first custom model by combining capabilities from our base models
                </p>
                <button
                  onClick={() => setIsBuilderOpen(true)}
                  className="px-6 py-2 rounded-lg bg-matrix-primary text-background font-medium hover:bg-matrix-primary/90 transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Build Your First Model
                </button>
              </motion.div>
            ) : (
              <ModelGrid 
                models={view === 'custom' ? customModels : filteredModels}
                onCompare={(modelId) => {
                  setSelectedModels(prev => {
                    const newModels = prev.includes(modelId)
                      ? prev.filter(id => id !== modelId)
                      : [...prev, modelId].slice(-2);
                    
                    if (newModels.length === 2) {
                      setTimeout(() => setView('comparison'), 100);
                    }
                    return newModels;
                  });
                }}
              />
            )}
          </>
        )}

        {view === 'comparison' && selectedModelDetails.length === 2 && (
          <ModelComparison
            models={selectedModelDetails}
            onClose={() => {
              setView('grid');
              setSelectedModels([]);
            }}
          />
        )}

        {view === 'recommender' && (
          <ModelRecommender
            models={allModels}
            onModelSelect={(modelId) => {
              setSelectedModels([modelId]);
              setView('grid');
            }}
          />
        )}

        <ModelBuilderModal
          isOpen={isBuilderOpen}
          onClose={() => setIsBuilderOpen(false)}
          baseModels={baseModels}
          onModelCreate={handleModelCreate}
        />
      </div>
    </div>
  );
}