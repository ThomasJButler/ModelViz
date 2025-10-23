/**
 * @file enhanced-toast.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Enhanced toast notification component with animations and action buttons.
 */

"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface EnhancedToastProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

/**
 * @constructor
 */
export function EnhancedToast({ toasts, removeToast }: EnhancedToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
            index={index}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onRemove, index }: {
  toast: Toast;
  onRemove: () => void;
  index: number;
}) {
  const [isLeaving, setIsLeaving] = useState(false);

  /** @constructs */
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onRemove, 300);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.duration, onRemove]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  };

  const Icon = icons[toast.type];

  const colors = {
    success: 'border-green-500 bg-green-500/10 text-green-500',
    error: 'border-red-500 bg-red-500/10 text-red-500',
    info: 'border-blue-500 bg-blue-500/10 text-blue-500',
    warning: 'border-yellow-500 bg-yellow-500/10 text-yellow-500',
  };

  const glowColors = {
    success: 'rgba(34, 197, 94, 0.3)',
    error: 'rgba(239, 68, 68, 0.3)',
    info: 'rgba(59, 130, 246, 0.3)',
    warning: 'rgba(245, 158, 11, 0.3)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ 
        opacity: isLeaving ? 0 : 1, 
        y: isLeaving ? -20 : -index * 80,
        scale: isLeaving ? 0.8 : 1,
        x: isLeaving ? 100 : 0
      }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 40,
      }}
      className="pointer-events-auto mb-4"
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`
          relative overflow-hidden
          min-w-[300px] max-w-md p-4 rounded-lg border
          ${colors[toast.type]}
          backdrop-blur-sm shadow-lg
        `}
        style={{
          boxShadow: `0 10px 40px -10px ${glowColors[toast.type]}`
        }}
      >
        {/* Background animation */}
        <motion.div
          className="absolute inset-0 opacity-20"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "linear"
          }}
        >
          <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12" />
        </motion.div>

        {/* Content */}
        <div className="relative flex items-start gap-3">
          <motion.div
            initial={{ rotate: -90, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          </motion.div>

          <div className="flex-1">
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm font-medium"
            >
              {toast.message}
            </motion.p>

            {toast.action && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toast.action.onClick}
                className="mt-2 text-xs font-medium hover:underline"
              >
                {toast.action.label}
              </motion.button>
            )}
          </div>

          <motion.button
            initial={{ opacity: 0, rotate: 90 }}
            animate={{ opacity: 1, rotate: 0 }}
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setIsLeaving(true);
              setTimeout(onRemove, 300);
            }}
            className="flex-shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Success celebration */}
        {toast.type === 'success' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-6 h-6 text-green-400" />
          </motion.div>
        )}

        {/* Progress bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-current opacity-30"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{
            duration: (toast.duration || 4000) / 1000,
            ease: "linear"
          }}
        />
      </motion.div>
    </motion.div>
  );
}

// Hook for managing toasts
/**
 * @constructor
 */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    addToast,
    removeToast,
  };
}