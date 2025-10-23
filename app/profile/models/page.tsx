/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description User models management page displaying custom, fine-tuned, and saved models with filtering and sorting
 */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  FileCode, 
  BrainCircuit, 
  Calculator, 
  Clock, 
  Edit, 
  Copy, 
  Trash2, 
  Play, 
  MoreVertical, 
  Download, 
  Archive,
  Check
} from "lucide-react";

interface ModelCardProps {
  id: string;
  name: string;
  description: string;
  type: "fine-tuned" | "custom" | "saved";
  baseModel: string;
  lastModified: string;
  status: "ready" | "training" | "failed" | "archived";
  size?: string;
  usage?: number;
}

function ModelCard({
  id,
  name,
  description,
  type,
  baseModel,
  lastModified,
  status,
  size,
  usage
}: ModelCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case "ready": return "text-green-500";
      case "training": return "text-blue-500";
      case "failed": return "text-red-500";
      case "archived": return "text-foreground/50";
      default: return "text-foreground/70";
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch(type) {
      case "fine-tuned": return BrainCircuit;
      case "custom": return FileCode;
      case "saved": return Archive;
      default: return FileCode;
    }
  };
  
  const TypeIcon = getTypeIcon(type);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg border border-matrix-primary/20 bg-card/80 backdrop-blur-sm hover:border-matrix-primary/40 transition-colors group"
    >
      <div className="flex justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-matrix-primary/10">
            <TypeIcon className="w-5 h-5 text-matrix-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground/90">{name}</h3>
            <p className="text-xs text-foreground/50">{baseModel}</p>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-md hover:bg-foreground/10 text-foreground/50"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-48 rounded-md border border-matrix-primary/20 bg-card/95 backdrop-blur-sm shadow-lg z-10 overflow-hidden">
              <div className="py-1">
                <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-matrix-primary/10">
                  <Play className="w-4 h-4 text-matrix-primary" />
                  Use in Playground
                </button>
                <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-matrix-primary/10">
                  <Edit className="w-4 h-4 text-matrix-primary" />
                  Edit Details
                </button>
                <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-matrix-primary/10">
                  <Copy className="w-4 h-4 text-matrix-primary" />
                  Duplicate
                </button>
                <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-matrix-primary/10">
                  <Download className="w-4 h-4 text-matrix-primary" />
                  Export
                </button>
                <div className="border-t border-matrix-primary/10 my-1"></div>
                <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-red-500 hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-sm text-foreground/70 mb-4 line-clamp-2">{description}</p>
      
      <div className="grid grid-cols-2 gap-y-2 text-xs mb-4">
        <div>
          <p className="text-foreground/50">Status</p>
          <p className={`font-medium ${getStatusColor(status)}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </p>
        </div>
        <div>
          <p className="text-foreground/50">Type</p>
          <p className="font-medium">
            {type === "fine-tuned" ? "Fine-tuned" : type === "custom" ? "Custom" : "Saved"}
          </p>
        </div>
        <div>
          <p className="text-foreground/50">Created</p>
          <p className="font-medium">{lastModified}</p>
        </div>
        <div>
          <p className="text-foreground/50">{size ? "Size" : "Usage"}</p>
          <p className="font-medium">{size || `${usage} requests`}</p>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1.5 rounded-md text-foreground/50 hover:text-matrix-primary hover:bg-matrix-primary/10 transition-colors">
          <Play className="w-4 h-4" />
        </button>
        <button className="p-1.5 rounded-md text-foreground/50 hover:text-matrix-primary hover:bg-matrix-primary/10 transition-colors">
          <Edit className="w-4 h-4" />
        </button>
        <button className="p-1.5 rounded-md text-foreground/50 hover:text-matrix-primary hover:bg-matrix-primary/10 transition-colors">
          <Copy className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

/**
 * @constructor
 */
export default function ModelsPage() {
  const [view, setView] = useState<"all" | "fine-tuned" | "custom" | "saved">("all");
  const [sortBy, setSortBy] = useState<"name" | "date" | "usage">("date");

  const models: ModelCardProps[] = [
    {
      id: "model-1",
      name: "Customer Support Assistant",
      description: "A fine-tuned model specialized in handling customer support inquiries for e-commerce products.",
      type: "fine-tuned",
      baseModel: "GPT-4 (OpenAI)",
      lastModified: "Mar 15, 2024",
      status: "ready",
      size: "1.2 GB",
      usage: 128
    },
    {
      id: "model-2",
      name: "SQL Query Generator",
      description: "Custom model that generates SQL queries based on natural language descriptions. Optimised for PostgreSQL syntax.",
      type: "custom",
      baseModel: "Claude 3 Sonnet (Anthropic)",
      lastModified: "Mar 22, 2024",
      status: "ready",
      size: "825 MB",
      usage: 243
    },
    {
      id: "model-3",
      name: "Legal Document Analyzer",
      description: "Currently training on a dataset of legal contracts to extract key clauses and provide summaries.",
      type: "fine-tuned",
      baseModel: "Claude 3 Opus (Anthropic)",
      lastModified: "Mar 28, 2024",
      status: "training",
      size: "3.4 GB"
    },
    {
      id: "model-4",
      name: "Technical Documentation Writer",
      description: "Saved model configuration optimised for generating technical documentation with proper formatting.",
      type: "saved",
      baseModel: "GPT-4o (OpenAI)",
      lastModified: "Mar 10, 2024",
      status: "ready",
      usage: 57
    },
    {
      id: "model-5",
      name: "Code Audit Assistant",
      description: "Failed training run that was attempting to build a code security auditing assistant. Issue with training data quality.",
      type: "fine-tuned",
      baseModel: "DeepSeek Coder (DeepSeek)",
      lastModified: "Mar 5, 2024",
      status: "failed",
      size: "982 MB"
    },
    {
      id: "model-6",
      name: "Marketing Copy Generator",
      description: "Archived model specialized in generating marketing copy. Superseded by newer version.",
      type: "custom",
      baseModel: "Claude 3 Haiku (Anthropic)",
      lastModified: "Feb 28, 2024",
      status: "archived",
      usage: 19
    }
  ];
  
  const filteredModels = view === "all" 
    ? models 
    : models.filter(model => model.type === view);
  
  const sortedModels = [...filteredModels].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "date") {
      return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    } else {
      return (b.usage || 0) - (a.usage || 0);
    }
  });
  
  const filterButtons = [
    { id: "all", label: "All Models" },
    { id: "fine-tuned", label: "Fine-tuned" },
    { id: "custom", label: "Custom" },
    { id: "saved", label: "Saved" }
  ];
  
  const sortOptions = [
    { id: "date", label: "Most Recent" },
    { id: "name", label: "Name" },
    { id: "usage", label: "Most Used" }
  ];
  
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-lg border border-matrix-primary/20 bg-card/80 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,0,0.1)]"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileCode className="w-6 h-6 text-matrix-primary" />
            <h2 className="text-2xl font-bold">My Models</h2>
          </div>
          
          <button className="px-4 py-2 bg-matrix-primary text-background rounded-md hover:bg-matrix-primary/90 transition-colors flex items-center gap-2">
            <BrainCircuit className="w-4 h-4" />
            <span>Create New Model</span>
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-foreground/70 mb-4">
            View, manage, and deploy your custom models. Fine-tune existing models or create custom configurations for specific tasks.
          </p>
          
          <div className="flex flex-wrap justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {filterButtons.map(button => (
                <button
                  key={button.id}
                  onClick={() => setView(button.id as any)}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    view === button.id 
                      ? "bg-matrix-primary/20 text-matrix-primary border border-matrix-primary/50" 
                      : "bg-foreground/5 text-foreground/70 border border-foreground/10 hover:border-matrix-primary/30"
                  }`}
                >
                  {button.label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground/50">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-background/50 border border-foreground/10 text-foreground/70 rounded-md text-sm px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-matrix-primary focus:border-matrix-primary"
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedModels.map(model => (
            <ModelCard key={model.id} {...model} />
          ))}
        </div>
        
        {sortedModels.length === 0 && (
          <div className="p-8 text-center text-foreground/50">
            <p>No models found matching your filters.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
