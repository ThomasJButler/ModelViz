/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Utility functions for class name management and styling operations
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names with Tailwind CSS conflict resolution
 * @param inputs - Class values to merge
 * @return Merged class string with conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
