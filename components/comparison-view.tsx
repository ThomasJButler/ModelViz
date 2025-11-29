/**
 * @file comparison-view.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description AI model comparison view for side-by-side analysis of capabilities and performance.
 */

"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ArrowLeftRight, Maximize2, Copy, Download, Share2, Sparkles, Layers, Eye, EyeOff } from 'lucide-react';

interface ComparisonViewProps {
  leftContent: {
    model: string;
    output: string;
    metadata?: any;
  };
  rightContent: {
    model: string;
    output: string;
    metadata?: any;
  };
  onClose?: () => void;
}

/**
 * @constructor
 */
export function ComparisonView({ leftContent, rightContent, onClose }: ComparisonViewProps) {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'overlay' | 'diff'>('side-by-side');
  const [showDifferences, setShowDifferences] = useState(true);
  const [splitPosition, setSplitPosition] = useState(50);
  const [isComparing, setIsComparing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Motion values for smooth dragging
  const x = useMotionValue(0);
  const splitPercentage = useTransform(x, (value) => {
    if (!containerRef.current) return 50;
    const width = containerRef.current.offsetWidth;
    return Math.max(20, Math.min(80, 50 + (value / width) * 100));
  });

  /** @constructs */
  useEffect(() => {
    const unsubscribe = splitPercentage.onChange((value) => {
      if (isDragging.current) {
        setSplitPosition(value);
      }
    });
    return unsubscribe;
  }, [splitPercentage]);

  const handleMouseDown = () => {
    isDragging.current = true;
    document.body.style.cursor = 'ew-resize';
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.body.style.cursor = 'default';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - rect.width / 2;
    x.set(newX);
  };

  /** @constructs */
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    // Add toast notification here
  };

  const downloadComparison = () => {
    const comparison = {
      left: leftContent,
      right: rightContent,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(comparison, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparison-${Date.now()}.json`;
    a.click();
  };

  // Highlight differences between outputs
  const getDifferences = (left: string, right: string) => {
    const leftLines = left.split('\n');
    const rightLines = right.split('\n');
    const maxLines = Math.max(leftLines.length, rightLines.length);
    
    const differences: Array<{ line: number; type: 'added' | 'removed' | 'modified' }> = [];
    
    for (let i = 0; i < maxLines; i++) {
      if (!leftLines[i] && rightLines[i]) {
        differences.push({ line: i, type: 'added' });
      } else if (leftLines[i] && !rightLines[i]) {
        differences.push({ line: i, type: 'removed' });
      } else if (leftLines[i] !== rightLines[i]) {
        differences.push({ line: i, type: 'modified' });
      }
    }
    
    return differences;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md overflow-hidden"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="p-4 border-b border-matrix-primary/20 bg-card/80"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ rotate: -180 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <ArrowLeftRight className="w-6 h-6 text-matrix-primary" />
            </motion.div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-matrix-primary to-matrix-secondary text-transparent bg-clip-text">
              AI Model Comparison
            </h2>
          </div>

          {/* View mode selector */}
          <div className="flex items-center gap-2">
            {['side-by-side', 'overlay', 'diff'].map((mode) => (
              <motion.button
                key={mode}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode(mode as any)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                  viewMode === mode
                    ? 'bg-matrix-primary/20 text-matrix-primary border border-matrix-primary'
                    : 'border border-matrix-primary/30 hover:border-matrix-primary/50'
                }`}
              >
                {mode === 'side-by-side' && <Layers className="w-4 h-4 inline mr-1" />}
                {mode === 'overlay' && <Eye className="w-4 h-4 inline mr-1" />}
                {mode === 'diff' && <Sparkles className="w-4 h-4 inline mr-1" />}
                {mode.charAt(0).toUpperCase() + mode.slice(1).replace('-', ' ')}
              </motion.button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDifferences(!showDifferences)}
              className="p-2 rounded-lg border border-matrix-primary/30 hover:border-matrix-primary/50 transition-colors"
            >
              {showDifferences ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadComparison}
              className="p-2 rounded-lg border border-matrix-primary/30 hover:border-matrix-primary/50 transition-colors"
            >
              <Download className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 rounded-lg border border-matrix-primary/30 hover:border-matrix-primary/50 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Comparison Content */}
      <div ref={containerRef} className="relative h-[calc(100vh-80px)] overflow-hidden">
        <AnimatePresence mode="wait">
          {viewMode === 'side-by-side' && (
            <motion.div
              key="side-by-side"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex h-full relative"
            >
              {/* Left Panel */}
              <motion.div
                style={{ width: `${splitPosition}%` }}
                className="h-full overflow-hidden border-r border-matrix-primary/20"
              >
                <ComparisonPanel
                  content={leftContent}
                  side="left"
                  onCopy={() => copyToClipboard(leftContent.output)}
                />
              </motion.div>

              {/* Drag Handle */}
              <motion.div
                onMouseDown={handleMouseDown}
                className="absolute top-0 bottom-0 w-1 bg-matrix-primary cursor-ew-resize hover:w-2 transition-all duration-200"
                style={{ left: `${splitPosition}%`, transform: 'translateX(-50%)' }}
                whileHover={{ scale: 1.2 }}
              >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-matrix-primary rounded-full opacity-0 hover:opacity-20 transition-opacity" />
              </motion.div>

              {/* Right Panel */}
              <motion.div
                style={{ width: `${100 - splitPosition}%` }}
                className="h-full overflow-hidden"
              >
                <ComparisonPanel
                  content={rightContent}
                  side="right"
                  onCopy={() => copyToClipboard(rightContent.output)}
                />
              </motion.div>
            </motion.div>
          )}

          {viewMode === 'overlay' && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -90 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative h-full"
            >
              <div className="absolute inset-0">
                <ComparisonPanel
                  content={leftContent}
                  side="left"
                  onCopy={() => copyToClipboard(leftContent.output)}
                />
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.3 }}
                className="absolute inset-0 mix-blend-difference"
              >
                <ComparisonPanel
                  content={rightContent}
                  side="right"
                  onCopy={() => copyToClipboard(rightContent.output)}
                />
              </motion.div>
            </motion.div>
          )}

          {viewMode === 'diff' && (
            <motion.div
              key="diff"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="h-full overflow-auto p-6"
            >
              <DiffView
                left={leftContent}
                right={rightContent}
                showDifferences={showDifferences}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Individual comparison panel component
function ComparisonPanel({ content, side, onCopy }: {
  content: { model: string; output: string; metadata?: any };
  side: 'left' | 'right';
  onCopy: () => void;
}) {
  return (
    <div className="h-full flex flex-col">
      <motion.div
        initial={{ x: side === 'left' ? -20 : 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="p-4 border-b border-matrix-primary/10 bg-card/50"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-matrix-primary">{content.model}</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onCopy}
            className="p-1.5 rounded-md hover:bg-matrix-primary/10 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </motion.button>
        </div>
        {content.metadata && (
          <div className="mt-2 flex gap-4 text-sm text-foreground/60">
            <span>Tokens: {content.metadata.tokens_used}</span>
            <span>Time: {content.metadata.processing_time}</span>
          </div>
        )}
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex-1 overflow-auto p-6"
      >
        <pre className="whitespace-pre-wrap font-mono text-sm">{content.output}</pre>
      </motion.div>
    </div>
  );
}

// Diff view component
function DiffView({ left, right, showDifferences }: {
  left: { model: string; output: string; metadata?: any };
  right: { model: string; output: string; metadata?: any };
  showDifferences: boolean;
}) {
  const leftLines = left.output.split('\n');
  const rightLines = right.output.split('\n');
  const maxLines = Math.max(leftLines.length, rightLines.length);

  return (
    <div className="space-y-2">
      {Array.from({ length: maxLines }).map((_, index) => {
        const leftLine = leftLines[index] || '';
        const rightLine = rightLines[index] || '';
        const isDifferent = leftLine !== rightLine;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.01, duration: 0.2 }}
            className={`grid grid-cols-2 gap-4 p-2 rounded-lg ${
              isDifferent && showDifferences ? 'bg-matrix-primary/5' : ''
            }`}
          >
            <div className={`font-mono text-sm ${
              !leftLine && rightLine ? 'text-destructive/50' : ''
            } ${isDifferent && showDifferences ? 'diff-removed' : ''}`}>
              {leftLine || <span className="text-foreground/30">{'<empty>'}</span>}
            </div>
            <div className={`font-mono text-sm ${
              leftLine && !rightLine ? 'text-destructive/50' : ''
            } ${isDifferent && showDifferences ? 'diff-added' : ''}`}>
              {rightLine || <span className="text-foreground/30">{'<empty>'}</span>}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}