import { Loader2 } from "lucide-react";

/** Branded full-viewport loading state for route `loading.tsx` / Suspense. */
export function PageLoader() {
  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center gap-3">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}
