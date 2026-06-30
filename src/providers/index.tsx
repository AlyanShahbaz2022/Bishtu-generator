"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { LenisProvider } from "./lenis-provider";
import { Toaster } from "@/components/ui/sonner";

/** Root client providers: theme (dark-first), smooth scroll, toasts. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <LenisProvider>{children}</LenisProvider>
      <Toaster />
    </ThemeProvider>
  );
}
