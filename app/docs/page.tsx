/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Documentation page with searchable sidebar navigation
 */
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Book, Code, Terminal, FileText, ChevronRight } from 'lucide-react';
import { DocsSidebar } from '@/components/docs-sidebar';
import { DocsContent } from '@/components/docs-content';
import { DocSearch } from '@/components/doc-search';

/**
 * Documentation page component
 * @constructor
 */
export default function DocsPage() {
  const [selectedSection, setSelectedSection] = useState('getting-started');

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-matrix-primary to-matrix-secondary text-transparent bg-clip-text">
            Documentation
          </h1>
          <p className="text-foreground/70">
            Learn how to use the AI Comparison Showcase
          </p>
        </motion.div>

        <DocSearch />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          <DocsSidebar
            selectedSection={selectedSection}
            onSelectSection={setSelectedSection}
          />
          <DocsContent selectedSection={selectedSection} />
        </div>
      </div>
    </div>
  );
}