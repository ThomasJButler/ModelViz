/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Privacy settings page for controlling data processing, retention, sharing, and security preferences
 */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Eye, 
  Shield, 
  Lock,
  Database, 
  Share2,
  UserX,
  Cloud,
  HardDrive, 
  AlertTriangle,
  Info,
  ArrowRight,
  Check,
  Clock,
  LineChart as Chart
} from "lucide-react";

/**
 * @constructor
 */
export default function PrivacyPage() {
  const [localProcessing, setLocalProcessing] = useState<boolean>(true);
  const [dataRetention, setDataRetention] = useState<"7" | "30" | "90" | "365" | "forever">("30");
  const [anonymousAnalytics, setAnonymousAnalytics] = useState<boolean>(true);
  const [shareModelImprovements, setShareModelImprovements] = useState<boolean>(false);
  const [sendErrorReports, setSendErrorReports] = useState<boolean>(true);
  const [apiKeyWarningShown, setApiKeyWarningShown] = useState<boolean>(true);
  
  const dataRetentionOptions = [
    { value: "7", label: "7 days" },
    { value: "30", label: "30 days" },
    { value: "90", label: "90 days" },
    { value: "365", label: "1 year" },
    { value: "forever", label: "Forever" },
  ];
  
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-lg border border-matrix-primary/20 bg-card/80 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,0,0.1)]"
      >
        <div className="flex items-center gap-2 mb-6">
          <Eye className="w-6 h-6 text-matrix-primary" />
          <h2 className="text-2xl font-bold">Privacy Settings</h2>
        </div>
        
        <p className="text-foreground/70 mb-6">
          Control how your data is processed, stored, and shared within ModelViz.
          These settings help you balance functionality with privacy according to your preferences.
        </p>
        
        {/* Data Processing */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-matrix-primary" />
            <span>Data Processing</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background/50">
              <div>
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-foreground/70" />
                  <h4 className="font-medium">Local Processing</h4>
                </div>
                <p className="text-sm text-foreground/50 mt-1 ml-6">
                  When possible, process data locally on your device instead of sending to remote servers.
                </p>
              </div>
              <button
                onClick={() => setLocalProcessing(!localProcessing)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  localProcessing ? "bg-matrix-primary" : "bg-foreground/20"
                }`}
              >
                <span 
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-background transition-transform ${
                    localProcessing ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
            
            <div className="p-4 rounded-lg border border-border bg-background/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-foreground/70" />
                  <h4 className="font-medium">Data Retention Period</h4>
                </div>
              </div>
              <p className="text-sm text-foreground/50 mb-3 ml-6">
                Specify how long your data (prompts, responses, and custom models) is retained.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 ml-6">
                {dataRetentionOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setDataRetention(option.value as any)}
                    className={`px-3 py-2 rounded-md text-sm text-center ${
                      dataRetention === option.value
                        ? "bg-matrix-primary/20 text-matrix-primary border border-matrix-primary/50"
                        : "bg-foreground/5 text-foreground/70 border border-foreground/10 hover:border-matrix-primary/30"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Data Sharing */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-matrix-primary" />
            <span>Data Sharing</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background/50">
              <div>
                <div className="flex items-center gap-2">
                  <Chart className="w-4 h-4 text-foreground/70" />
                  <h4 className="font-medium">Anonymous Analytics</h4>
                </div>
                <p className="text-sm text-foreground/50 mt-1 ml-6">
                  Share anonymous usage data to help improve the AI Comparison tool.
                </p>
              </div>
              <button
                onClick={() => setAnonymousAnalytics(!anonymousAnalytics)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  anonymousAnalytics ? "bg-matrix-primary" : "bg-foreground/20"
                }`}
              >
                <span 
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-background transition-transform ${
                    anonymousAnalytics ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background/50">
              <div>
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-foreground/70" />
                  <h4 className="font-medium">Model Improvement Data</h4>
                </div>
                <p className="text-sm text-foreground/50 mt-1 ml-6">
                  Contribute to training data for improving AI models.
                </p>
              </div>
              <button
                onClick={() => setShareModelImprovements(!shareModelImprovements)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  shareModelImprovements ? "bg-matrix-primary" : "bg-foreground/20"
                }`}
              >
                <span 
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-background transition-transform ${
                    shareModelImprovements ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background/50">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-foreground/70" />
                  <h4 className="font-medium">Error Reports</h4>
                </div>
                <p className="text-sm text-foreground/50 mt-1 ml-6">
                  Automatically send error reports to help fix bugs.
                </p>
              </div>
              <button
                onClick={() => setSendErrorReports(!sendErrorReports)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  sendErrorReports ? "bg-matrix-primary" : "bg-foreground/20"
                }`}
              >
                <span 
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-background transition-transform ${
                    sendErrorReports ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
        
        {/* API Security */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-matrix-primary" />
            <span>Security Alerts</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background/50">
              <div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-foreground/70" />
                  <h4 className="font-medium">API Key Security Warnings</h4>
                </div>
                <p className="text-sm text-foreground/50 mt-1 ml-6">
                  Show warnings when API keys are used in insecure contexts.
                </p>
              </div>
              <button
                onClick={() => setApiKeyWarningShown(!apiKeyWarningShown)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  apiKeyWarningShown ? "bg-matrix-primary" : "bg-foreground/20"
                }`}
              >
                <span 
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-background transition-transform ${
                    apiKeyWarningShown ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
          </div>
          
          {/* Information Panel */}
          <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 flex gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-500 mb-1">About API Key Storage</h4>
              <p className="text-xs text-blue-500/80">
                ModelViz stores your API keys locally in your browser&apos;s secure storage.
                They are never sent to our servers and are only used to make requests directly
                from your browser to the respective AI service providers.
              </p>
              
              <div className="mt-2 text-xs text-blue-500/80">
                <a href="/docs/security" className="flex items-center gap-1 text-blue-500 hover:underline">
                  Learn more about our security practices
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Data Export & Deletion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-lg border border-matrix-primary/20 bg-card/80 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,0,0.1)]"
      >
        <h3 className="text-lg font-semibold mb-4">Data Control</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-matrix-primary/30 bg-matrix-primary/5">
            <h4 className="font-medium mb-2">Export Your Data</h4>
            <p className="text-sm text-foreground/70 mb-3">
              Download all your personal data in a portable format, including chat history, model settings, and usage statistics.
            </p>
            <button className="px-4 py-2 rounded-md bg-matrix-primary/20 text-matrix-primary border border-matrix-primary/50 hover:bg-matrix-primary/30 transition-colors">
              Export Data
            </button>
          </div>
          
          <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/5">
            <h4 className="font-medium mb-2 text-red-400">Delete Account Data</h4>
            <p className="text-sm text-foreground/70 mb-3">
              Permanently delete all your personal data from ModelViz. This action cannot be undone.
            </p>
            <button className="px-4 py-2 rounded-md bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 transition-colors flex items-center gap-2">
              <UserX className="w-4 h-4" />
              Delete All Data
            </button>
          </div>
        </div>
      </motion.div>
      
      <div className="flex justify-end">
        <button className="px-4 py-2 rounded-md bg-matrix-primary text-background hover:bg-matrix-primary/90 transition-colors flex items-center gap-2">
          <Check className="w-4 h-4" />
          Save Privacy Settings
        </button>
      </div>
    </div>
  );
}
