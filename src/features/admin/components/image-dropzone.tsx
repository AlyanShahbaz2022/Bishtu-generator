"use client";

import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminImage } from "@/features/admin/components/admin-image";
import { cloudinaryEnabled, uploadToCloudinary } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

const MAX_MB = 10;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

type Props = {
  label?: string;
  value: string[];
  onChange: (next: string[]) => void;
  /** Cap the number of images. Use 1 for a single-image field (e.g. category). */
  max?: number;
};

/**
 * Drag-and-drop image uploader backed by Cloudinary unsigned uploads. Shows a
 * thumbnail grid with reorder/delete. When Cloudinary isn't configured it falls
 * back to a paste-a-URL input so admins are never blocked.
 */
export function ImageDropzone({
  label = "Images",
  value,
  onChange,
  max,
}: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  // Ref-counter so drag state doesn't flicker when moving over child elements.
  const dragDepth = useRef(0);

  const atCapacity = max != null && value.length >= max;

  // Prevent the browser from navigating to a file if it's dropped just outside
  // the zone (the usual reason "drag & drop doesn't work").
  useEffect(() => {
    const prevent = (e: DragEvent) => e.preventDefault();
    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", prevent);
    return () => {
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", prevent);
    };
  }, []);

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;

    const room = max != null ? max - value.length : Infinity;
    const toUpload = list.slice(0, room);
    if (toUpload.length === 0) {
      toast.error(`You can add at most ${max} image${max === 1 ? "" : "s"}.`);
      return;
    }

    const valid = toUpload.filter((f) => {
      if (!ACCEPTED.includes(f.type)) {
        toast.error(`${f.name}: unsupported type`);
        return false;
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        toast.error(`${f.name}: larger than ${MAX_MB}MB`);
        return false;
      }
      return true;
    });
    if (valid.length === 0) return;

    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of valid) {
        urls.push(await uploadToCloudinary(file));
      }
      onChange([...value, ...urls]);
      toast.success(
        `Uploaded ${urls.length} image${urls.length === 1 ? "" : "s"}`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current = 0;
    setDragging(false);
    if (atCapacity || uploading) return;
    const files = e.dataTransfer.files;
    if (files?.length) handleFiles(files);
  }

  function openPicker() {
    if (atCapacity || uploading) return;
    inputRef.current?.click();
  }

  function addUrl() {
    const v = urlInput.trim();
    if (!v) return;
    if (max != null && value.length >= max) return;
    onChange([...value, v]);
    setUrlInput("");
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      {cloudinaryEnabled ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload images"
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openPicker();
            }
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            dragDepth.current += 1;
            if (!atCapacity && !uploading) setDragging(true);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => {
            e.preventDefault();
            dragDepth.current -= 1;
            if (dragDepth.current <= 0) setDragging(false);
          }}
          onDrop={onDrop}
          className={cn(
            "flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center text-sm transition-colors outline-none",
            dragging
              ? "border-primary bg-primary/10 ring-2 ring-primary/40"
              : "border-border hover:border-primary/50 hover:bg-muted/40",
            (atCapacity || uploading) && "pointer-events-none opacity-60",
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="size-7 animate-spin text-primary" />
              <span className="text-muted-foreground">Uploading…</span>
            </>
          ) : atCapacity ? (
            <span className="text-muted-foreground">
              Maximum {max} image{max === 1 ? "" : "s"} reached
            </span>
          ) : (
            <>
              <ImagePlus className="size-7 text-primary" />
              <span className="font-medium">
                {dragging
                  ? "Drop to upload"
                  : "Drag & drop images here, or click to browse"}
              </span>
              <span className="text-xs text-muted-foreground">
                JPG, PNG, WebP or AVIF · up to {MAX_MB}MB
                {max != null && max > 1 ? ` · up to ${max} images` : ""}
              </span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            multiple={max !== 1}
            hidden
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      ) : (
        // Fallback: Cloudinary not configured → paste an image URL.
        <div className="space-y-1">
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addUrl();
                }
              }}
              placeholder="https://image-url…"
              disabled={atCapacity}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addUrl}
              disabled={atCapacity}
            >
              <Plus className="size-4" />
              Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Image uploads are off — set NEXT_PUBLIC_CLOUDINARY_* to enable drag
            &amp; drop.
          </p>
        </div>
      )}

      {/* Thumbnail grid */}
      {value.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {value.map((img, i) => (
            <li
              key={`${img}-${i}`}
              className="group relative overflow-hidden rounded-lg border border-border"
            >
              <AdminImage
                src={img}
                className="aspect-square w-full object-cover"
              />
              {i === 0 && value.length > 1 && (
                <span className="absolute top-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                  Cover
                </span>
              )}

              {/* Hover controls */}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-1 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex gap-0.5">
                  {value.length > 1 && (
                    <>
                      <button
                        type="button"
                        aria-label="Move left"
                        disabled={i === 0}
                        onClick={() => move(i, -1)}
                        className="rounded bg-white/20 p-1 text-white hover:bg-white/40 disabled:opacity-30"
                      >
                        <ArrowLeft className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Move right"
                        disabled={i === value.length - 1}
                        onClick={() => move(i, 1)}
                        className="rounded bg-white/20 p-1 text-white hover:bg-white/40 disabled:opacity-30"
                      >
                        <ArrowRight className="size-3.5" />
                      </button>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => remove(i)}
                  className="rounded bg-destructive/80 p-1 text-white hover:bg-destructive"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
