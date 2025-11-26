/**
 * @file code-editor.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Code editor component with syntax highlighting and execution capabilities.
 */

"use client";

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, RefreshCw } from 'lucide-react';
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  isProcessing: boolean;
  onProcess: () => void;
  inputFormat: 'json' | 'text' | 'code';
  language: string;
}

/**
 * @constructor
 */
export function CodeEditor({
  value,
  onChange,
  isProcessing,
  onProcess,
  inputFormat,
  language,
}: CodeEditorProps) {
  const editorRef = useRef(null);

  const getPlaceholder = () => {
    switch (inputFormat) {
      case 'json':
        return '{\n  "key": "value"\n}';
      case 'code':
        return '# Enter your code here\ndef example():\n    return "Hello, World!"';
      default:
        return 'Enter your input here...';
    }
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  return (
    <div className="w-full space-y-4">
      <div className="relative w-full">
        <div className="absolute right-2 sm:right-4 top-2 sm:top-4 z-10 flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange('')}
            className="p-2 rounded-lg bg-card border border-border hover:border-matrix-secondary/50 text-foreground/70"
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onProcess}
            disabled={isProcessing}
            className="px-3 sm:px-4 py-2 rounded-lg bg-matrix-primary text-background font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Run</span>
          </motion.button>
        </div>

        <div className="relative w-full font-mono rounded-lg overflow-hidden border border-matrix-primary/20 bg-background/70">
          <Editor
            height="300px"
            width="100%"
            defaultValue={getPlaceholder()}
            value={value}
            onChange={(val) => onChange(val || '')}
            language={language === 'json' ? 'json' : language === 'code' ? 'python' : 'plaintext'}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              fontFamily: 'JetBrains Mono, monospace',
              tabSize: 2,
              wordWrap: 'on',
            }}
            onMount={handleEditorDidMount}
          />
        </div>
      </div>
    </div>
  );
}