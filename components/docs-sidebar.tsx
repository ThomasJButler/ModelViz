/**
 * @file docs-sidebar.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Documentation sidebar navigation component with search and category filtering.
 */

"use client";

import { Book, Code, Terminal, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Book,
    subsections: [
      { id: 'quick-start', label: 'Quick Start' },
      { id: 'installation', label: 'Installation' },
      { id: 'basic-usage', label: 'Basic Usage' },
      { id: 'key-features', label: 'Key Features' }
    ]
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    icon: Code,
    subsections: [
      { id: 'authentication', label: 'Authentication' },
      { id: 'endpoints', label: 'Endpoints' },
      { id: 'parameters', label: 'Parameters' },
      { id: 'response-types', label: 'Response Types' }
    ]
  },
  {
    id: 'models',
    title: 'Models',
    icon: Terminal,
    subsections: [
      { id: 'language-models', label: 'Language Models' },
      { id: 'vision-models', label: 'Vision Models' },
      { id: 'audio-models', label: 'Audio Models' },
      { id: 'model-selection', label: 'Model Selection' }
    ]
  },
  {
    id: 'guides',
    title: 'API Key Setup',
    icon: FileText,
    subsections: [
      { id: 'openai', label: 'OpenAI' },
      { id: 'anthropic', label: 'Anthropic' },
      { id: 'google-gemini-', label: 'Google (Gemini)' },
      { id: 'perplexity', label: 'Perplexity' }
    ]
  }
];

interface DocsSidebarProps {
  selectedSection: string;
  onSelectSection: (section: string) => void;
}

/**
 * @constructor
 */
export function DocsSidebar({ selectedSection, onSelectSection }: DocsSidebarProps) {
  const scrollToSection = (sectionId: string, subsectionId?: string) => {
    onSelectSection(sectionId);
    
    setTimeout(() => {
      const element = document.getElementById(subsectionId || sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <nav className="lg:sticky lg:top-24 space-y-1 max-h-[calc(100vh-6rem)] overflow-y-auto">
      {sections.map((section) => (
        <div key={section.id}>
          <motion.button
            whileHover={{ x: 4 }}
            onClick={() => scrollToSection(section.id)}
            className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-left ${
              selectedSection === section.id
                ? 'bg-matrix-primary/10 text-matrix-primary'
                : 'hover:bg-card text-foreground/70'
            }`}
          >
            <section.icon className="w-4 h-4" />
            <span className="flex-1 text-sm sm:text-base">{section.title}</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${
              selectedSection === section.id ? 'rotate-90' : ''
            }`} />
          </motion.button>
          
          {selectedSection === section.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="ml-6 mt-1 space-y-1"
            >
              {section.subsections.map((subsection) => (
                <button
                  key={subsection.id}
                  onClick={() => scrollToSection(section.id, subsection.id)}
                  className="w-full px-4 py-1.5 text-xs sm:text-sm text-foreground/60 hover:text-matrix-primary text-left"
                >
                  {subsection.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      ))}
    </nav>
  );
}