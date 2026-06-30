"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type HeroBanner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image: string;
  ctaLabel: string | null;
  ctaHref: string | null;
};

export function HeroCarousel({ banners }: { banners: HeroBanner[] }) {
  const [index, setIndex] = useState(0);
  const count = banners.length;

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(timer);
  }, [count]);

  if (count === 0) return null;
  const active = banners[index];

  return (
    <section className="relative h-[70svh] min-h-[480px] w-full overflow-hidden">
      {banners.map((b, i) => (
        <div
          key={b.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            i === index ? "opacity-100" : "opacity-0",
          )}
          aria-hidden={i !== index}
        >
          <Image
            src={b.image}
            alt={b.title ?? "Tech & Tune"}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        </div>
      ))}

      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 lg:px-8">
        <div className="max-w-2xl">
          {active.title && (
            <h1 className="font-heading text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {active.title}
            </h1>
          )}
          {active.subtitle && (
            <p className="mt-5 max-w-xl text-lg text-pretty text-muted-foreground">
              {active.subtitle}
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-4">
            {active.ctaHref && active.ctaLabel && (
              <Button asChild size="xl">
                <Link href={active.ctaHref}>{active.ctaLabel}</Link>
              </Button>
            )}
            <Button asChild size="xl" variant="outline">
              <Link href="/quote">Request a Quote</Link>
            </Button>
          </div>
        </div>
      </div>

      {count > 1 && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                i === index ? "w-6 bg-primary" : "w-2 bg-foreground/30",
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
