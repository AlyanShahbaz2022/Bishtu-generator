"use client";

import { ZoomIn } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type GalleryImage = { url: string; altText: string | null };

export function ProductGallery({
  images,
  name,
}: {
  images: GalleryImage[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  const list = images.length ? images : [{ url: "", altText: name }];
  const current = list[Math.min(active, list.length - 1)];

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => current.url && setZoom(true)}
        className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted"
        aria-label="Zoom image"
      >
        {current.url && (
          <Image
            src={current.url}
            alt={current.altText ?? name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 600px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <span className="absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
          <ZoomIn className="size-4" />
        </span>
      </button>

      {list.length > 1 && (
        <div className="flex gap-3">
          {list.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                "relative aspect-square w-20 overflow-hidden rounded-lg border-2 bg-muted transition-colors",
                i === active ? "border-primary" : "border-transparent",
              )}
            >
              {img.url && (
                <Image
                  src={img.url}
                  alt={img.altText ?? `${name} thumbnail ${i + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}

      <Dialog open={zoom} onOpenChange={setZoom}>
        <DialogContent className="max-w-4xl p-2">
          {current.url && (
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={current.url}
                alt={current.altText ?? name}
                fill
                sizes="100vw"
                className="rounded-lg object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
