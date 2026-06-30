"use client";

import { ArrowUp, MessageCircle, Phone } from "lucide-react";
import { useEffect, useState } from "react";

import { siteConfig } from "@/constants/site";
import { cn } from "@/lib/utils";

const waLink = `https://wa.me/${siteConfig.contact.whatsapp.replace(/\D/g, "")}`;
const telLink = `tel:${siteConfig.contact.phone.replace(/\s/g, "")}`;

/** Fixed WhatsApp + call shortcuts and a scroll-triggered back-to-top button. */
export function FloatingActions() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-center gap-3">
      <button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={cn(
          "flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition-all duration-300 hover:-translate-y-0.5",
          showTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        <ArrowUp className="size-5" />
      </button>

      <a
        href={telLink}
        aria-label="Call us"
        className="flex size-12 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition-transform hover:-translate-y-0.5 sm:hidden"
      >
        <Phone className="size-5" />
      </a>

      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:-translate-y-0.5"
      >
        <MessageCircle className="size-6" />
      </a>
    </div>
  );
}
