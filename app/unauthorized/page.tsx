/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Unauthorised access page displayed when users attempt to access restricted content
 */
"use client";

import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import Link from 'next/link';

/**
 * @constructor
 */
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Shield className="w-16 h-16 text-matrix-tertiary mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Unauthorised Access</h1>
        <p className="text-foreground/70 mb-6">
          You don&apos;t have permission to access this page.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-2 bg-matrix-primary text-background rounded-lg hover:bg-matrix-primary/90 transition-colors"
        >
          Return to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}