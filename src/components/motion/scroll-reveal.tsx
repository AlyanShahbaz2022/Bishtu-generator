"use client";

import { motion, useReducedMotion } from "motion/react";

type ScrollRevealProps = {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  /** Fraction of the element that must be visible before revealing. */
  amount?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
};

/**
 * Reveals children once they scroll into view. Animates a single time
 * (`once: true`) and respects `prefers-reduced-motion`.
 */
export function ScrollReveal({
  children,
  delay = 0,
  y = 24,
  duration = 0.6,
  amount = 0.2,
  className,
  as = "div",
}: ScrollRevealProps) {
  const reduce = useReducedMotion();
  const Tag = motion[as];

  if (reduce) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </Tag>
  );
}
