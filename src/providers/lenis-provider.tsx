"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

/** Lenis smooth scroll (TRD §Animations). */
export function LenisProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ duration: 1.2, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
