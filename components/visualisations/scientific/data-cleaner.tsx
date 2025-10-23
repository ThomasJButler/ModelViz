/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Data privacy scanner visualisation displaying sensitive data detection and warnings
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Check } from 'lucide-react';
import { generatePrivacyData } from '@/lib/data';

/**
 * @constructor
 */
export default function DataCleaner() {
  const [data, setData] = useState(generatePrivacyData());

  /** @constructs */
  useEffect(() => {
    const interval = setInterval(() => {
      setData(generatePrivacyData());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {data.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`p-4 rounded-lg border ${
            item.type === 'sensitive'
              ? 'border-red-500/20 bg-red-500/10'
              : item.type === 'warning'
              ? 'border-yellow-500/20 bg-yellow-500/10'
              : 'border-green-500/20 bg-green-500/10'
          }`}
        >
          <div className="flex items-center gap-3">
            {item.type === 'sensitive' ? (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            ) : item.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            ) : (
              <Check className="w-5 h-5 text-green-500" />
            )}
            <div>
              <p className={`text-sm ${
                item.type === 'sensitive'
                  ? 'text-red-500'
                  : item.type === 'warning'
                  ? 'text-yellow-500'
                  : 'text-green-500'
              }`}>
                {item.value}
              </p>
              {item.reason && (
                <p className="text-xs text-foreground/50 mt-1">{item.reason}</p>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}