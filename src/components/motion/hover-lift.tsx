"use client";

import { motion, useReducedMotion } from "motion/react";

type HoverLiftProps = {
  children: React.ReactNode;
  /** Pixels to lift on hover. */
  lift?: number;
  className?: string;
};

/**
 * Wraps content with a subtle hover elevation (lift + scale). Pair with a
 * `shadow` utility on the child for the full card-elevation effect from the
 * design brief.
 */
export function HoverLift({ children, lift = 6, className }: HoverLiftProps) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      whileHover={{ y: -lift, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}
