/**
 * @file output-display.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Output display component showing AI model generation results.
 */

"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, ChevronDown, Copy, Check, Maximize2, Code, FileText, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { EnhancedLoading } from './enhanced-loading';
import 'highlight.js/styles/github-dark.css';

interface OutputDisplayProps {
  output: any;
  isProcessing: boolean;
  VisualisationType: 'json' | 'chart' | 'text';
}

/**
 * Detect if text contains markdown formatting
 */
function isMarkdown(text: string): boolean {
  if (!text || typeof text !== 'string') return false;

  // Check for common markdown patterns
  const markdownPatterns = [
    /^#{1,6}\s/m,           // Headers
    /\*\*.*?\*\*/,          // Bold
    /\*.*?\*/,              // Italic
    /`{3}[\s\S]*?`{3}/,     // Code blocks
    /`[^`]+`/,              // Inline code
    /^\s*[-*+]\s/m,         // Lists
    /^\s*\d+\.\s/m,         // Numbered lists
    /\[.*?\]\(.*?\)/,       // Links
    /!\[.*?\]\(.*?\)/,      // Images
  ];

  return markdownPatterns.some(pattern => pattern.test(text));
}

/**
 * @constructor
 */
export function OutputDisplay({
  output,
  isProcessing,
  VisualisationType,
}: OutputDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [currentView, setCurrentView] = useState(VisualisationType);
  /** @constructs */
  useEffect(() => {
    setCurrentView(VisualisationType);
  }, [VisualisationType]);

  const copyToClipboard = async () => {
    const outputContent = output.content !== undefined ? output.content : 
                         output.error !== undefined ? output.error : 
                         output;
    
    const textToCopy = typeof outputContent === 'object' 
      ? JSON.stringify(outputContent, null, 2)
      : String(outputContent);
    
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderVisualisation = () => {
    if (!output) return null;
    
    // Extract content from output if it's an object with content property
    const outputContent = output.content !== undefined ? output.content : 
                         output.error !== undefined ? output.error : 
                         output;

    const isError = output.error !== undefined;

    switch (currentView) {
      case 'chart':
        if (!Array.isArray(outputContent)) {
          return (
            <div className="h-full flex items-center justify-center text-foreground/50">
              <p>No chart data available</p>
            </div>
          );
        }
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="h-64"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={outputContent}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        );
      case 'json':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            {showLineNumbers && (
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-muted/30 border-r border-border text-right pr-2 pt-4 select-none">
                {(typeof outputContent === 'object' 
                  ? JSON.stringify(outputContent, null, 2)
                  : outputContent
                ).split('\n').map((_, i) => (
                  <div key={i} className="text-xs text-muted-foreground">
                    {i + 1}
                  </div>
                ))}
              </div>
            )}
            <pre className={`text-sm font-mono overflow-auto p-4 ${showLineNumbers ? 'pl-16' : ''} ${isError ? 'text-destructive' : ''}`}>
              <motion.code
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, staggerChildren: 0.1 }}
              >
                {typeof outputContent === 'object' 
                  ? JSON.stringify(outputContent, null, 2)
                  : outputContent}
              </motion.code>
            </pre>
          </motion.div>
        );
      default:
        // Check if content looks like markdown
        const textContent = typeof outputContent === 'object'
          ? JSON.stringify(outputContent, null, 2)
          : String(outputContent);
        const shouldRenderMarkdown = isMarkdown(textContent);

        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            {shouldRenderMarkdown ? (
              <div className={`prose prose-invert max-w-none p-4 ${isError ? 'text-destructive' : ''}`}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    // Custom components for better styling
                    code: ({node, inline, className, children, ...props}: any) => {
                      return inline ? (
                        <code className="px-1.5 py-0.5 rounded bg-matrix-primary/10 text-matrix-primary text-sm" {...props}>
                          {children}
                        </code>
                      ) : (
                        <code className={`${className} text-sm`} {...props}>
                          {children}
                        </code>
                      );
                    },
                    pre: ({node, children, ...props}: any) => (
                      <pre className="bg-black/50 rounded-lg p-4 overflow-x-auto border border-matrix-primary/20" {...props}>
                        {children}
                      </pre>
                    ),
                    a: ({node, children, ...props}: any) => (
                      <a className="text-matrix-primary hover:text-matrix-secondary underline" {...props}>
                        {children}
                      </a>
                    ),
                    h1: ({node, children, ...props}: any) => (
                      <h1 className="text-2xl font-bold text-matrix-primary mb-4" {...props}>
                        {children}
                      </h1>
                    ),
                    h2: ({node, children, ...props}: any) => (
                      <h2 className="text-xl font-bold text-matrix-primary mb-3" {...props}>
                        {children}
                      </h2>
                    ),
                    h3: ({node, children, ...props}: any) => (
                      <h3 className="text-lg font-bold text-matrix-secondary mb-2" {...props}>
                        {children}
                      </h3>
                    ),
                  }}
                >
                  {textContent}
                </ReactMarkdown>
              </div>
            ) : (
              <pre className={`text-sm font-mono whitespace-pre-wrap p-4 ${isError ? 'text-destructive' : ''}`}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={outputContent}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {textContent}
                  </motion.span>
                </AnimatePresence>
              </pre>
            )}
          </motion.div>
        );
    }
  };

  const downloadOutput = () => {
    // Extract content from output if it's an object with content property
    const outputContent = output.content !== undefined ? output.content : 
                         output.error !== undefined ? output.error : 
                         output;
    
    const data =
      VisualisationType === 'json' || typeof outputContent === 'object'
        ? JSON.stringify(outputContent, null, 2)
        : String(outputContent);
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const viewModeButtons = [
    { id: 'text', icon: FileText, label: 'Text' },
    { id: 'json', icon: Code, label: 'JSON' },
    { id: 'chart', icon: BarChart3, label: 'Chart' }
  ];

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {output && !isProcessing && (
            <motion.div
              className="flex gap-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {viewModeButtons.map((mode) => {
                const Icon = mode.icon;
                return (
                  <motion.button
                    key={mode.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentView(mode.id as any)}
                    className={`p-1.5 rounded-md transition-all duration-200 ${
                      currentView === mode.id
                        ? 'bg-matrix-primary/20 text-matrix-primary'
                        : 'hover:bg-matrix-primary/10 text-foreground/60'
                    }`}
                    title={mode.label}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </div>
        
        {output && !isProcessing && (
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              <motion.button
                key={copied ? 'check' : 'copy'}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyToClipboard}
                className={`p-2 rounded-lg border transition-all duration-200 ${
                  copied 
                    ? 'bg-green-500/10 border-green-500 text-green-500' 
                    : 'bg-card border-border hover:border-matrix-primary/50 text-foreground/70'
                }`}
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </motion.button>
            </AnimatePresence>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadOutput}
              className="p-2 rounded-lg bg-card border border-border hover:border-matrix-primary/50 text-foreground/70 transition-all duration-200"
            >
              <Download className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg bg-card border border-border hover:border-matrix-primary/50 text-foreground/70 transition-all duration-200"
            >
              <Maximize2 className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </div>

      <motion.div
        className={`relative rounded-lg bg-card border overflow-hidden transition-all duration-300 ${
          isExpanded ? 'fixed inset-4 z-50' : 'min-h-[20rem] sm:min-h-[24rem] lg:min-h-[28rem]'
        } ${output?.error ? 'border-destructive/50' : 'border-border hover:border-matrix-primary/30'}`}
        layout
      >
        {/* Glow effect on new output */}
        <AnimatePresence>
          {output && !isProcessing && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-matrix-primary/20 via-matrix-secondary/20 to-matrix-tertiary/20 blur-xl" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`relative ${isExpanded ? 'h-full' : 'h-full'}`}>
          {isProcessing ? (
            <div className="h-full flex items-center justify-center p-8">
              <EnhancedLoading
                variant="ai"
                message="Processing your request"
                submessages={[
                  "Analyzing input...",
                  "Querying AI model...",
                  "Generating response...",
                  "Formatting output..."
                ]}
              />
            </div>
          ) : output ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="h-full overflow-auto scrollbar-thin scrollbar-thumb-matrix-primary/30 scrollbar-track-transparent"
              style={{ maxHeight: isExpanded ? 'none' : '50rem' }}
            >
              {renderVisualisation()}
            </motion.div>
          ) : (
            <motion.div
              className="h-full flex items-center justify-center text-foreground/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center space-y-2">
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <FileText className="w-12 h-12 mx-auto text-foreground/30" />
                </motion.div>
                <p>Output will appear here...</p>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Close button for expanded view */}
        {isExpanded && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(false)}
            className="absolute top-4 right-4 p-2 rounded-lg bg-card border border-border hover:border-matrix-primary/50 text-foreground/70"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
