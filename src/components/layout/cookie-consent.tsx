"use client";

import { Cookie } from "lucide-react";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "tt-cookie-consent";
const EVENT = "tt-cookie-consent-change";

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/**
 * Bottom cookie-consent banner; choice persisted to localStorage and read via
 * `useSyncExternalStore` (hydration-safe, no mount-effect). The server snapshot
 * hides the banner so it only ever appears after hydration.
 */
export function CookieConsent() {
  const consent = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(STORAGE_KEY),
    () => "server",
  );

  function decide(value: "accepted" | "declined") {
    localStorage.setItem(STORAGE_KEY, value);
    window.dispatchEvent(new Event(EVENT));
  }

  if (consent !== null) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-xl sm:flex-row">
        <Cookie className="size-6 shrink-0 text-accent" />
        <p className="flex-1 text-sm text-muted-foreground">
          We use cookies to enhance your browsing experience and analyze site
          traffic. By clicking &ldquo;Accept&rdquo;, you consent to our use of
          cookies.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" size="sm" onClick={() => decide("declined")}>
            Decline
          </Button>
          <Button size="sm" onClick={() => decide("accepted")}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
