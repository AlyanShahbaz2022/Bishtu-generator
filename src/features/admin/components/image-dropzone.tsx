"use client";

import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
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
 * Drag-and-drop image uploader backed by Cloudinary unsigned uploads. Shows
 * thumbnails with reorder/delete. When Cloudinary isn't configured it falls
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

  const atCapacity = max != null && value.length >= max;

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
    setDragging(false);
    if (atCapacity || uploading) return;
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
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
        <button
          type="button"
          disabled={atCapacity || uploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (!atCapacity && !uploading) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-sm transition-colors",
            dragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50",
            (atCapacity || uploading) && "cursor-not-allowed opacity-60",
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-muted-foreground">Uploading…</span>
            </>
          ) : atCapacity ? (
            <span className="text-muted-foreground">
              Maximum {max} image{max === 1 ? "" : "s"} reached
            </span>
          ) : (
            <>
              <ImagePlus className="size-6 text-muted-foreground" />
              <span className="font-medium">
                Drag &amp; drop or click to upload
              </span>
              <span className="text-xs text-muted-foreground">
                JPG, PNG, WebP or AVIF · up to {MAX_MB}MB
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
        </button>
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

      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((img, i) => (
            <li
              key={`${img}-${i}`}
              className="flex items-center gap-3 rounded-lg border border-border p-2"
            >
              <AdminImage src={img} className="size-12 rounded object-cover" />
              <span className="flex-1 truncate text-xs text-muted-foreground">
                {img}
              </span>
              {value.length > 1 && (
                <>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Move up"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Move down"
                    disabled={i === value.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                </>
              )}
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label="Remove"
                onClick={() => remove(i)}
              >
                <X className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
