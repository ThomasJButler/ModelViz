/**
 * @author Tom Butler
 * @date 2025-11-25
 * @description Animated counter component with spring animation
 */

"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = ''
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);

  const springValue = useSpring(0, {
    stiffness: 100,
    damping: 30,
    duration: duration * 1000
  });

  const display = useTransform(springValue, (latest) => {
    if (decimals > 0) {
      return latest.toFixed(decimals);
    }
    return Math.round(latest).toLocaleString();
  });

  useEffect(() => {
    springValue.set(value);
    prevValueRef.current = value;
  }, [value, springValue]);

  useEffect(() => {
    const unsubscribe = display.on('change', (v) => {
      setDisplayValue(parseFloat(v.replace(/,/g, '')));
    });
    return unsubscribe;
  }, [display]);

  return (
    <motion.span
      className={`counter-animate ${className}`}
      initial={{ scale: 1 }}
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 0.3,
        times: [0, 0.5, 1],
      }}
      key={value}
    >
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </motion.span>
  );
}

/**
 * Simple animated number that counts up from 0
 */
export function CountUp({
  end,
  start = 0,
  duration = 2,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = ''
}: {
  end: number;
  start?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const [count, setCount] = useState(start);
  const countRef = useRef(start);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);

      const currentValue = start + (end - start) * eased;
      countRef.current = currentValue;
      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    startTimeRef.current = null;
    requestAnimationFrame(animate);

    return () => {
      startTimeRef.current = null;
    };
  }, [end, start, duration]);

  const displayValue = decimals > 0
    ? count.toFixed(decimals)
    : Math.round(count).toLocaleString();

  return (
    <span className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}
