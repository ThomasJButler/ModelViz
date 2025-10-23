/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description User preferences page for customising theme, interface settings, and default model configuration
 */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  Moon, 
  Sun, 
  Monitor, 
  PaintBucket, 
  Eye, 
  Bell, 
  CircleDashed,
  ToggleLeft,
  Palette,
  Check
} from "lucide-react";

/**
 * @constructor
 */
export default function PreferencesPage() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("dark");
  const [accentColor, setAccentColor] = useState<string>("matrix");
  const [notifications, setNotifications] = useState<boolean>(true);
  const [animationReduced, setAnimationReduced] = useState<boolean>(false);
  const [autoSavePrompts, setAutoSavePrompts] = useState<boolean>(true);
  const [languageModel, setLanguageModel] = useState<string>("gpt-4");
  
  const themeOptions = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor }
  ];
  
  const colorOptions = [
    { id: "matrix", label: "Matrix", color: "#00ff00" },
    { id: "blue", label: "Ocean", color: "#00a2ff" },
    { id: "purple", label: "Lavender", color: "#a855f7" },
    { id: "amber", label: "Amber", color: "#ffbf00" },
    { id: "rose", label: "Rose", color: "#f43f5e" },
  ];
  
  const modelOptions = [
    { id: "gpt-4", label: "GPT-4 (OpenAI)" },
    { id: "claude-3-opus", label: "Claude 3 Opus (Anthropic)" },
    { id: "claude-3-sonnet", label: "Claude 3 Sonnet (Anthropic)" },
    { id: "claude-3-haiku", label: "Claude 3 Haiku (Anthropic)" }
  ];
  
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-lg border border-matrix-primary/20 bg-card/80 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,0,0.1)]"
      >
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-6 h-6 text-matrix-primary" />
          <h2 className="text-2xl font-bold">Interface Preferences</h2>
        </div>
        
        {/* Theme Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Theme</h3>
          <div className="grid grid-cols-3 gap-4">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => setTheme(option.id as "light" | "dark" | "system")}
                  className={`p-4 rounded-lg border ${
                    theme === option.id 
                      ? "border-matrix-primary bg-matrix-primary/10" 
                      : "border-border hover:border-matrix-primary/50 hover:bg-matrix-primary/5"
                  } transition-colors flex flex-col items-center gap-2`}
                >
                  <Icon className={`w-6 h-6 ${theme === option.id ? "text-matrix-primary" : "text-foreground/60"}`} />
                  <span className={theme === option.id ? "text-matrix-primary" : "text-foreground/70"}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Accent Color */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Accent Color</h3>
          <div className="flex flex-wrap gap-3">
            {colorOptions.map((color) => (
              <button
                key={color.id}
                onClick={() => setAccentColor(color.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  accentColor === color.id ? "ring-2 ring-offset-2 ring-offset-background" : ""
                }`}
                style={{ 
                  backgroundColor: color.color,
                  boxShadow: accentColor === color.id ? `0 0 10px ${color.color}` : "none"
                }}
                title={color.label}
              >
                {accentColor === color.id && (
                  <Check className="w-5 h-5 text-black drop-shadow-sm" />
                )}
              </button>
            ))}
            
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center bg-foreground/10 border border-border hover:border-foreground/30"
              title="Custom color"
            >
              <Palette className="w-5 h-5 text-foreground/70" />
            </button>
          </div>
        </div>
        
        {/* Accessibility & Interface Options */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Accessibility & Interface</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-matrix-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-foreground/70" />
                <div>
                  <p className="font-medium">Reduced animations</p>
                  <p className="text-sm text-foreground/50">Minimise motion for a more stable interface</p>
                </div>
              </div>
              <button
                onClick={() => setAnimationReduced(!animationReduced)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  animationReduced ? "bg-matrix-primary" : "bg-foreground/20"
                }`}
              >
                <span 
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-background transition-transform ${
                    animationReduced ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-matrix-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-foreground/70" />
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-sm text-foreground/50">Enable desktop notifications</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  notifications ? "bg-matrix-primary" : "bg-foreground/20"
                }`}
              >
                <span 
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-background transition-transform ${
                    notifications ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-matrix-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <CircleDashed className="w-5 h-5 text-foreground/70" />
                <div>
                  <p className="font-medium">Auto-save prompts</p>
                  <p className="text-sm text-foreground/50">Automatically save prompts in the playground</p>
                </div>
              </div>
              <button
                onClick={() => setAutoSavePrompts(!autoSavePrompts)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  autoSavePrompts ? "bg-matrix-primary" : "bg-foreground/20"
                }`}
              >
                <span 
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-background transition-transform ${
                    autoSavePrompts ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Default Model Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-lg border border-matrix-primary/20 bg-card/80 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,0,0.1)]"
      >
        <div className="flex items-center gap-2 mb-6">
          <ToggleLeft className="w-6 h-6 text-matrix-primary" />
          <h2 className="text-2xl font-bold">Default Settings</h2>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Default Language Model</h3>
          <p className="text-sm text-foreground/70 mb-4">
            This model will be automatically selected when you open the playground. You can change it at any time.
          </p>
          
          <div className="space-y-2">
            {modelOptions.map((model) => (
              <div
                key={model.id}
                onClick={() => setLanguageModel(model.id)}
                className={`p-3 rounded-lg border cursor-pointer ${
                  languageModel === model.id 
                    ? "border-matrix-primary bg-matrix-primary/10" 
                    : "border-border hover:border-matrix-primary/50 hover:bg-matrix-primary/5"
                } transition-colors`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border ${
                    languageModel === model.id 
                      ? "border-matrix-primary bg-matrix-primary" 
                      : "border-foreground/30"
                  } mr-3`} />
                  <span className={languageModel === model.id ? "text-matrix-primary" : "text-foreground/80"}>
                    {model.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            className="px-4 py-2 rounded-md bg-matrix-primary text-background hover:bg-matrix-primary/90 transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </motion.div>
    </div>
  );
}
