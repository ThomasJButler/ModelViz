/**
 * @file model-selector.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Model selection component with search, filtering, and comparison features.
 */

"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { DivideIcon as LucideIcon, Sparkles, Check } from 'lucide-react';
import { useState } from 'react';

interface Model {
  id: string;
  name: string;
  description: string;
  icon: typeof LucideIcon;
}

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  models: Model[];
}

/**
 * @constructor
 */
export function ModelSelector({ selectedModel, onSelectModel, models }: ModelSelectorProps) {
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 gap-3">
      {models.map((model, index) => {
        const Icon = model.icon;
        const isSelected = model.id === selectedModel;
        const isHovered = model.id === hoveredModel;
        
        return (
          <motion.button
            key={model.id}
            onClick={() => onSelectModel(model.id)}
            onMouseEnter={() => setHoveredModel(model.id)}
            onMouseLeave={() => setHoveredModel(null)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: index * 0.05,
              duration: 0.3,
              ease: [0.25, 0.1, 0.25, 1]
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative p-3 rounded-lg border text-left overflow-hidden group model-card ${
              isSelected
                ? 'border-matrix-primary bg-matrix-primary/10 shadow-[0_0_20px_rgba(0,255,0,0.2)]'
                : 'border-border bg-card hover:border-matrix-primary/50'
            } transition-all duration-300 button-press focus-ring`}
          >
            {/* Background shimmer effect */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
              initial={false}
              animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-matrix-primary/5 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            </motion.div>

            {/* Selection indicator */}
            <AnimatePresence>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-2 right-2 w-6 h-6 bg-matrix-primary rounded-full flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-background" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Icon with animation */}
            <motion.div
              animate={{
                rotate: isHovered ? [0, -5, 5, -5, 0] : 0,
                scale: isSelected ? 1.1 : 1
              }}
              transition={{ duration: 0.4 }}
              className="relative z-10"
            >
              <Icon className={`w-5 h-5 mb-1.5 transition-colors duration-300 ${
                isSelected ? 'text-matrix-primary' : 'text-foreground/70 group-hover:text-matrix-primary'
              }`} />
              
              {/* Sparkle effect on hover */}
              <AnimatePresence>
                {isHovered && !isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles className="w-3 h-3 text-matrix-primary" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Content */}
            <motion.div className="relative z-10">
              <h3 className={`text-sm font-semibold mb-0.5 transition-colors duration-300 ${
                isSelected ? 'text-matrix-primary' : 'group-hover:text-matrix-primary'
              }`}>
                {model.name}
              </h3>
              <p className="text-xs text-foreground/70">{model.description}</p>
            </motion.div>

            {/* Glow effect for selected state */}
            {isSelected && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-matrix-primary/0 via-matrix-primary/10 to-matrix-primary/0 blur-xl" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}