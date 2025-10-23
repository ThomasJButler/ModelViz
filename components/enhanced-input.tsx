/**
 * @file enhanced-input.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Enhanced input component with validation, autocomplete, and formatting.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { 
  motion, 
  AnimatePresence 
} from "framer-motion";
import { 
  ChevronUp, 
  Send, 
  HelpCircle, 
  Settings,
  Loader2, 
  MessageSquarePlus,
  Copy,
  Trash2,
  Check,
  BookOpen,
  FileText,
  Sparkles,
  Braces,
  Terminal
} from "lucide-react";
import { ProviderBadge } from "./provider-selector";

interface EnhancedInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  isProcessing?: boolean;
  provider?: string;
  model?: string;
  inputFormat?: 'json' | 'text' | 'code';
  formatPlaceholders?: Record<string, string>;
  maxHeight?: string;
  className?: string;
}

// Sample templates that could be expanded later
const templates = [
  {
    id: "simple-question",
    name: "Simple Question",
    icon: HelpCircle,
    description: "Ask a direct question",
    template: "What is {{topic}}?",
  },
  {
    id: "explain-concept",
    name: "Explain Concept",
    icon: BookOpen,
    description: "Request an explanation of a concept",
    template: "Explain {{concept}} in simple terms."
  },
  {
    id: "code-review",
    name: "Code Review",
    icon: Braces,
    description: "Request a code review",
    template: "Review this code and suggest improvements:\n\n```{{language}}\n{{code}}\n```"
  },
  {
    id: "creative-writing",
    name: "Creative Writing",
    icon: FileText,
    description: "Generate creative content",
    template: "Write a short {{content_type}} about {{topic}} in the style of {{style}}."
  },
  {
    id: "system-prompt",
    name: "Custom System",
    icon: Sparkles,
    description: "Use a custom system prompt",
    template: "{\n  \"system\": \"{{system_prompt}}\",\n  \"input\": \"{{user_prompt}}\"\n}"
  }
];

/**
 * @constructor
 */
export function EnhancedInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Type your message here...",
  isProcessing = false,
  provider,
  model,
  inputFormat = 'text',
  formatPlaceholders,
  maxHeight = "200px",
  className = ""
}: EnhancedInputProps) {
  const [height, setHeight] = useState<number>(0);
  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Automatically adjust the height of the textarea based on content
  /** @constructs */
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = "auto";
      // Set the height to scrollHeight to accommodate the content
      const newHeight = Math.min(parseInt(maxHeight), textareaRef.current.scrollHeight);
      textareaRef.current.style.height = `${newHeight}px`;
      setHeight(newHeight);
    }
  }, [value, maxHeight]);

  // Handle Enter key press to submit, but allow Shift+Enter for new lines
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isProcessing && value.trim()) {
        onSubmit();
      }
    }
  };

  const applyTemplate = (template: string) => {
    // Simple placeholder replacement
    const processedTemplate = template.replace(/\{\{([^}]+)\}\}/g, (_, placeholder) => {
      return `[${placeholder}]`;
    });
    
    onChange(processedTemplate);
    setShowTemplates(false);
    
    // Focus and place cursor at the first placeholder
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const placeholderPos = processedTemplate.indexOf('[');
        if (placeholderPos > -1) {
          textareaRef.current.setSelectionRange(placeholderPos + 1, placeholderPos + processedTemplate.substring(placeholderPos + 1).indexOf(']') + 1);
        }
      }
    }, 0);
  };

  const handleCopyInput = () => {
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const clearInput = () => {
    onChange("");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Determine the format icon
  const FormatIcon = inputFormat === 'json' 
    ? Braces 
    : inputFormat === 'code' 
      ? Terminal 
      : MessageSquarePlus;

  return (
    <div className={`relative ${className}`}>
      {/* Templates panel */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-card/95 backdrop-blur-sm border border-matrix-primary/20 rounded-lg shadow-lg z-10 overflow-hidden"
          >
            <div className="p-3 border-b border-border/50">
              <h3 className="text-sm font-medium text-foreground/90">Message Templates</h3>
              <p className="text-xs text-foreground/50">Select a template to get started quickly</p>
            </div>
            <div className="p-2 max-h-[300px] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {templates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <motion.button
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-start gap-3 p-3 rounded-md hover:bg-matrix-primary/10 text-left transition-colors"
                      onClick={() => applyTemplate(template.template)}
                    >
                      <div className="p-2 rounded-md bg-matrix-primary/10 text-matrix-primary">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground/90">{template.name}</p>
                        <p className="text-xs text-foreground/50">{template.description}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
            <div className="p-3 border-t border-border/50 text-right">
              <button
                className="text-xs text-foreground/50 hover:text-foreground/70"
                onClick={() => setShowTemplates(false)}
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input container */}
      <div className="relative flex flex-col rounded-lg border border-matrix-primary/20 bg-background/70 backdrop-blur-sm overflow-hidden">
        {/* Provider & model info bar */}
        {(provider || model) && (
          <div className="flex items-center justify-between p-2 border-b border-matrix-primary/10 bg-matrix-primary/5">
            <div className="flex items-center gap-2">
              {provider && <ProviderBadge provider={provider} />}
              {model && (
                <span className="text-xs text-foreground/70 font-mono">
                  {model}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-foreground/50">
                {inputFormat === 'json' ? 'JSON' : inputFormat === 'code' ? 'Code' : 'Text'} Format
              </span>
              <FormatIcon className="w-3 h-3 text-foreground/50" />
            </div>
          </div>
        )}

        {/* Textarea and buttons */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isProcessing}
            className="w-full p-4 pr-12 bg-transparent text-foreground/90 placeholder-foreground/40 outline-none resize-none overflow-y-auto"
            style={{ 
              minHeight: "80px",
              maxHeight: maxHeight
            }}
          />

          {/* Action buttons that appear when text is entered */}
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            {value && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex gap-1"
              >
                <button
                  className="p-1.5 rounded-md hover:bg-foreground/10 text-foreground/50 hover:text-foreground/70 transition-colors"
                  onClick={clearInput}
                  title="Clear input"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  className="p-1.5 rounded-md hover:bg-foreground/10 text-foreground/50 hover:text-foreground/70 transition-colors"
                  onClick={handleCopyInput}
                  title="Copy to clipboard"
                >
                  {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </motion.div>
            )}
            <button
              className="p-1.5 rounded-md hover:bg-matrix-primary/10 text-foreground/50 hover:text-matrix-primary transition-colors"
              onClick={() => setShowTemplates(!showTemplates)}
              title="Message templates"
            >
              <MessageSquarePlus className="w-4 h-4" />
            </button>
            <button
              className={`p-2 rounded-full ${
                value.trim() && !isProcessing
                  ? "bg-matrix-primary text-background hover:bg-matrix-primary/90"
                  : "bg-foreground/10 text-foreground/30"
              } transition-colors`}
              onClick={onSubmit}
              disabled={!value.trim() || isProcessing}
              title="Send message"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
