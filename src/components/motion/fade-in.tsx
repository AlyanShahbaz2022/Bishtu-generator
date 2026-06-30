"use client";

import { motion, useReducedMotion } from "motion/react";

type FadeInProps = {
  children: React.ReactNode;
  /** Seconds to wait before animating. */
  delay?: number;
  /** Initial vertical offset in px (slides up into place). */
  y?: number;
  duration?: number;
  className?: string;
};

/**
 * Fades (and gently slides) its children in on mount. Honors
 * `prefers-reduced-motion` by rendering statically.
 */
export function FadeIn({
  children,
  delay = 0,
  y = 12,
  duration = 0.5,
  className,
}: FadeInProps) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
