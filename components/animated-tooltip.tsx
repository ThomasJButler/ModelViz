/**
 * @file animated-tooltip.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description Animated tooltip component providing contextual information on hover.
 */

"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delayDuration?: number;
}

/**
 * @constructor
 */
export function AnimatedTooltip({
  children,
  content,
  side = "top",
  align = "center",
  delayDuration = 200,
}: AnimatedTooltipProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root open={open} onOpenChange={setOpen} delayDuration={delayDuration}>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <AnimatePresence>
          {open && (
            <TooltipPrimitive.Portal forceMount>
              <TooltipPrimitive.Content
                side={side}
                align={align}
                sideOffset={8}
                asChild
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="relative z-50 overflow-hidden rounded-md bg-background/95 backdrop-blur-sm px-3 py-2 text-sm text-foreground shadow-lg border border-matrix-primary/20"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-matrix-primary/10 via-matrix-secondary/10 to-matrix-primary/10 opacity-50" />
                  
                  <div className="relative z-10">
                    {content}
                  </div>
                  
                  <TooltipPrimitive.Arrow className="fill-background/95" />
                </motion.div>
              </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
          )}
        </AnimatePresence>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}