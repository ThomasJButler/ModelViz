/**
 * @file model-grid.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Model grid layout component displaying models in a responsive grid.
 */

"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Search, Scale, Sparkles } from 'lucide-react';
import { ModelCard, type ModelCardProps } from './model-card';
import { ModelCardSkeleton } from './model-card-skeleton';
import { EmptyState } from './empty-state';
import { useState, useEffect } from 'react';

interface ModelGridProps {
  models: ModelCardProps[];
  onCompare: (modelId: string) => void;
  isLoading?: boolean;
}

/**
 * @constructor
 */
export function ModelGrid({ models, onCompare, isLoading = false }: ModelGridProps) {
  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  // Show loading skeletons
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ModelCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Show empty state
  if (models.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No models found"
        description="Try adjusting your search or filter criteria to find the AI models you're looking for."
      />
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
    >
      <AnimatePresence mode="popLayout">
        {models.map((model) => {
          const isSelected = selectedModels.includes(model.id);
          
          return (
            <motion.div
              key={model.id}
              layout
              variants={itemVariants}
              className="relative group"
            >
              <div className={`relative transition-all duration-300 ${isSelected ? 'ring-2 ring-matrix-primary ring-offset-2 ring-offset-background rounded-lg' : ''}`}>
                <ModelCard {...model} />
                
                {/* Compare button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: isSelected ? 1 : 0,
                    scale: isSelected ? 1 : 0.8
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    onCompare(model.id);
                    setSelectedModels(prev => 
                      prev.includes(model.id) 
                        ? prev.filter(id => id !== model.id)
                        : [...prev, model.id]
                    );
                  }}
                  className={`absolute top-4 right-4 p-2.5 rounded-lg backdrop-blur-sm border transition-all duration-300 z-10 ${
                    isSelected 
                      ? 'bg-matrix-primary text-background border-matrix-primary shadow-[0_0_20px_rgba(0,255,0,0.5)]' 
                      : 'bg-background/80 border-border hover:border-matrix-primary/50 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <Scale className={`w-4 h-4 ${isSelected ? 'animate-pulse' : ''}`} />
                </motion.button>
                
                {/* Selected indicator */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-matrix-primary rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(0,255,0,0.5)]"
                    >
                      <Sparkles className="w-3 h-3 text-background" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}