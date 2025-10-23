/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Custom React hooks for UI interactions including magnetic cursor effects,
 *              parallax scrolling, scroll reveals, keyboard shortcuts, drag and drop,
 *              ripple effects, hover delays, counter animations, and typewriter effects
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * Creates magnetic cursor effect that attracts elements towards mouse position
 * @param {number} [strength=0.3] - Magnetic pull strength (0-1 range recommended)
 * @return {{
 *   elementRef: React.RefObject<HTMLElement>,
 *   x: MotionValue<number>,
 *   y: MotionValue<number>
 * }}
 */
export function useMagneticCursor(strength = 0.3) {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const elementRef = useRef<HTMLElement>(null);

  // Spring configuration provides smooth damped animation
  const springConfig = { damping: 15, stiffness: 150 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  /**
   * @constructs - Initialises mouse tracking and magnetic effect calculations
   */
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate distance from cursor to element centre
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;

      // Apply magnetic pull based on strength parameter
      cursorX.set(distanceX * strength);
      cursorY.set(distanceY * strength);
    };

    const handleMouseLeave = () => {
      // Reset position when cursor leaves element
      cursorX.set(0);
      cursorY.set(0);
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cursorX, cursorY, strength]);

  return { elementRef, x, y };
}

/**
 * Creates parallax scrolling effect with configurable offset
 * @param {number} [offset=50] - Maximum parallax offset in pixels
 * @return {MotionValue<number>} Transformed Y position for parallax effect
 */
export function useParallax(offset = 50) {
  const [scrollY, setScrollY] = useState(0);

  // Transform scroll position to parallax offset
  const parallaxY = useTransform(useMotionValue(scrollY), [0, 1000], [0, -offset]);

  /**
   * @constructs - Initialises scroll position tracking
   */
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return parallaxY;
}

/**
 * Reveals element when scrolled into viewport using IntersectionObserver
 * @param {number} [threshold=0.1] - Percentage of element visibility to trigger reveal (0-1)
 * @return {{
 *   elementRef: React.RefObject<HTMLElement>,
 *   isVisible: boolean
 * }}
 */
export function useScrollReveal(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  /**
   * @listens threshold - Re-initialises observer when threshold changes
   */
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Unobserve after first reveal to prevent re-triggering
          observer.unobserve(element);
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { elementRef, isVisible };
}

/**
 * Manages keyboard shortcuts with common command key combinations
 * @return {{
 *   activeShortcut: string | null,
 *   setActiveShortcut: Function
 * }}
 */
export function useKeyboardShortcuts() {
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null);

  /**
   * @constructs - Initialises global keyboard event listeners
   */
  useEffect(() => {
    // Common keyboard shortcuts for application navigation
    const shortcuts: Record<string, () => void> = {
      'cmd+k': () => setActiveShortcut('search'),
      'cmd+/': () => setActiveShortcut('help'),
      'cmd+,': () => setActiveShortcut('settings'),
      'esc': () => setActiveShortcut(null),
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = `${e.metaKey ? 'cmd+' : ''}${e.key.toLowerCase()}`;

      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { activeShortcut, setActiveShortcut };
}

/**
 * Manages drag and drop interactions with zone-based drop targets
 * @return {{
 *   isDragging: boolean,
 *   draggedItem: any,
 *   dropZone: string | null,
 *   handleDragStart: Function,
 *   handleDragEnd: Function,
 *   handleDragEnter: Function,
 *   handleDragLeave: Function,
 *   handleDrop: Function
 * }}
 */
export function useDragAndDrop() {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [dropZone, setDropZone] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, item: any) => {
    setIsDragging(true);
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedItem(null);
    setDropZone(null);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, zone: string) => {
    e.preventDefault();
    setDropZone(zone);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDropZone(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, zone: string, onDrop: (item: any) => void) => {
    e.preventDefault();
    if (draggedItem) {
      onDrop(draggedItem);
    }
    handleDragEnd();
  }, [draggedItem, handleDragEnd]);

  return {
    isDragging,
    draggedItem,
    dropZone,
    handleDragStart,
    handleDragEnd,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
  };
}

/**
 * Creates material design ripple effect on click
 * @return {{
 *   ripples: Array<{x: number, y: number, id: number}>,
 *   addRipple: Function
 * }}
 */
export function useRipple() {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const addRipple = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);

    // Auto-remove ripple after animation completes (600ms)
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, 600);
  }, []);

  return { ripples, addRipple };
}

/**
 * Delays hover state change to prevent flickering on quick mouse movements
 * @param {number} [delay=300] - Delay in milliseconds before hover activates
 * @return {{
 *   isHovered: boolean,
 *   handleMouseEnter: Function,
 *   handleMouseLeave: Function
 * }}
 */
export function useHoverDelay(delay = 300) {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, delay);
  }, [delay]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovered(false);
  }, []);

  return { isHovered, handleMouseEnter, handleMouseLeave };
}

/**
 * Animates number from current value to target with smooth easing
 * @param {number} target - Target number to animate towards
 * @param {number} [duration=2000] - Animation duration in milliseconds
 * @return {number} Current animated count value
 */
export function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);

  /**
   * @listens target, duration - Re-animates counter when target or duration changes
   */
  useEffect(() => {
    const startTime = Date.now();
    const startValue = count;
    const difference = target - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Exponential easing out for smooth deceleration
      const easeOutExpo = 1 - Math.pow(2, -10 * progress);

      setCount(Math.round(startValue + difference * easeOutExpo));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return count;
}

/**
 * Creates typewriter effect for text animation
 * @param {string} text - Text to display with typewriter effect
 * @param {number} [speed=50] - Typing speed in milliseconds per character
 * @return {{
 *   displayedText: string,
 *   isTyping: boolean
 * }}
 */
export function useTypewriter(text: string, speed = 50) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  /**
   * @listens text, speed - Restarts typewriter animation when text or speed changes
   */
  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(prev => prev + text[currentIndex]);
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayedText, isTyping };
}
