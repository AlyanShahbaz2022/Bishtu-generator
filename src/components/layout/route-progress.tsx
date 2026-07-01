"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Top-of-viewport green progress bar that gives immediate feedback on every
 * client navigation. App Router has no public router events, so we intercept
 * same-origin link clicks / history changes to *start* the bar, and complete it
 * once the new pathname (or search params) has committed.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Kick the bar off when a navigation is initiated.
  useEffect(() => {
    const clearTimers = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };

    const start = () => {
      clearTimers();
      setVisible(true);
      setProgress(10);
      // Creep forward so it feels responsive without ever reaching 100%.
      timers.current.push(setTimeout(() => setProgress(45), 120));
      timers.current.push(setTimeout(() => setProgress(70), 400));
      timers.current.push(setTimeout(() => setProgress(85), 900));
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        (target && target !== "_self") ||
        anchor.hasAttribute("download")
      ) {
        return;
      }
      // External links open a real navigation — the bar isn't meaningful there.
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        ) {
          return;
        }
      } catch {
        return;
      }
      start();
    };

    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener("popstate", start);
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("popstate", start);
      clearTimers();
    };
  }, []);

  // Complete the bar once the route has actually changed. State updates are
  // scheduled (not synchronous in the effect body) to avoid cascading renders.
  useEffect(() => {
    if (!visible) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const fill = setTimeout(() => setProgress(100), 0);
    const done = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);
    return () => {
      clearTimeout(fill);
      clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-0.5"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 200ms" }}
    >
      <div
        className="h-full bg-primary shadow-[0_0_8px_var(--color-primary)]"
        style={{
          width: `${progress}%`,
          transition: "width 200ms ease-out",
        }}
      />
    </div>
  );
}
