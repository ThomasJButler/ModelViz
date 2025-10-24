/**
 * @file file-upload.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description File upload component with drag-and-drop support and progress tracking.
 */

"use client";

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Check, Loader2 } from 'lucide-react';

interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  onUpload: (file: File) => Promise<void>;
}

/**
 * @constructor
 */
export function FileUpload({ accept = '*', maxSize = 5242880, onUpload }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const validateFile = (file: File) => {
    if (!file.type.match(accept) && accept !== '*') {
      throw new Error('Invalid file type');
    }
    if (file.size > maxSize) {
      throw new Error('File too large');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);
    setSuccess(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    try {
      validateFile(file);
      setIsUploading(true);
      await onUpload(file);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateFile(file);
      setIsUploading(true);
      await onUpload(file);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <motion.div
        whileHover={{ scale: 1.01 }}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging
            ? 'border-matrix-primary bg-matrix-primary/10'
            : 'border-border'
        } transition-colors`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileSelect}
        />

        <div className="flex flex-col items-center gap-4">
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-matrix-primary animate-spin" />
          ) : success ? (
            <Check className="w-8 h-8 text-matrix-primary" />
          ) : (
            <Upload className="w-8 h-8 text-foreground/50" />
          )}

          <div className="text-sm">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-matrix-primary hover:text-matrix-secondary"
            >
              Click to upload
            </button>
            <span className="text-foreground/70"> or drag and drop</span>
          </div>

          <p className="text-xs text-foreground/50">
            Maximum file size: {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded bg-red-500/10 text-red-500 text-sm"
          >
            {error}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}