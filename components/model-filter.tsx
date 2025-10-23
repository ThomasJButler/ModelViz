/**
 * @file model-filter.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Model filtering component for searching and filtering AI models by various criteria.
 */

"use client";

import { Filter, Search, SortAsc } from 'lucide-react';

interface ModelFilterProps {
  searchQuery: string;
  selectedCategory: string;
  sortBy: string;
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
  categories: { value: string; label: string; }[];
  sortOptions: { value: string; label: string; }[];
}

/**
 * @constructor
 */
export function ModelFilter({
  searchQuery,
  selectedCategory,
  sortBy,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  categories,
  sortOptions
}: ModelFilterProps) {
  return (
    <div className="w-full flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Search models..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-matrix-primary focus:ring-1 focus:ring-matrix-primary outline-none"
        />
        <Search className="absolute right-3 top-2.5 h-5 w-5 text-foreground/50" />
      </div>

      <div className="flex gap-4">
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-40 px-4 py-2 rounded-lg bg-background border border-border focus:border-matrix-primary focus:ring-1 focus:ring-matrix-primary outline-none appearance-none"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          <Filter className="absolute right-3 top-2.5 h-5 w-5 text-foreground/50 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-40 px-4 py-2 rounded-lg bg-background border border-border focus:border-matrix-primary focus:ring-1 focus:ring-matrix-primary outline-none appearance-none"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                Sort by {option.label}
              </option>
            ))}
          </select>
          <SortAsc className="absolute right-3 top-2.5 h-5 w-5 text-foreground/50 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}