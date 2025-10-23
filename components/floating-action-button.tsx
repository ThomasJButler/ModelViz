/**
 * @file floating-action-button.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Floating action button for quick access to primary actions.
 */

"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface FloatingAction {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  actions: FloatingAction[];
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

/**
 * @constructor
 */
export function FloatingActionButton({ 
  actions, 
  position = 'bottom-right' 
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const positions = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-24 right-6',
    'top-left': 'top-24 left-6'
  };

  const actionPositions = {
    'bottom-right': (index: number) => ({ bottom: (index + 1) * 70, right: 0 }),
    'bottom-left': (index: number) => ({ bottom: (index + 1) * 70, left: 0 }),
    'top-right': (index: number) => ({ top: (index + 1) * 70, right: 0 }),
    'top-left': (index: number) => ({ top: (index + 1) * 70, left: 0 })
  };

  return (
    <div className={`fixed ${positions[position]} z-50`}>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/20 backdrop-blur-sm -z-10"
            />
            
            {/* Action buttons */}
            {actions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  transition: {
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 200
                  }
                }}
                exit={{ 
                  scale: 0, 
                  opacity: 0,
                  transition: {
                    delay: (actions.length - index - 1) * 0.05
                  }
                }}
                style={actionPositions[position](index)}
                className="absolute"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    action.onClick();
                    setIsOpen(false);
                  }}
                  className={`group relative w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
                    action.color || 'bg-card border border-border hover:border-matrix-primary/50'
                  }`}
                >
                  <action.icon className="w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  
                  {/* Tooltip */}
                  <span className={`absolute ${
                    position.includes('right') ? 'right-full mr-3' : 'left-full ml-3'
                  } top-1/2 transform -translate-y-1/2 px-3 py-1.5 bg-background/95 backdrop-blur-sm border border-border rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none`}>
                    {action.label}
                  </span>
                </motion.button>
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Main FAB button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-16 h-16 rounded-full bg-matrix-primary text-background shadow-2xl hover:shadow-matrix-primary/30 transition-all duration-300 overflow-hidden group"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-matrix-primary via-matrix-secondary to-matrix-primary opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
        
        {/* Ripple effect */}
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-full"
          initial={{ scale: 0, opacity: 1 }}
          animate={isOpen ? { scale: 2, opacity: 0 } : {}}
          transition={{ duration: 0.5 }}
        />
        
        {/* Icon */}
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </motion.div>
        
        {/* Pulse animation */}
        {!isOpen && (
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-matrix-primary"
            animate={{
              scale: [1, 1.5],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        )}
      </motion.button>
    </div>
  );
}