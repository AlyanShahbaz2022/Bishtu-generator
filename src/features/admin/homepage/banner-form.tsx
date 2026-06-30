"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TextAreaField, TextField } from "@/features/leads/components/fields";
import { createBanner, updateBanner } from "@/features/admin/homepage/actions";

export type BannerData = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  sortOrder: number;
};

export function BannerForm({ banner }: { banner?: BannerData }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const input = {
      title: String(f.get("title") ?? ""),
      subtitle: String(f.get("subtitle") ?? ""),
      image: String(f.get("image") ?? ""),
      ctaLabel: String(f.get("ctaLabel") ?? ""),
      ctaHref: String(f.get("ctaHref") ?? ""),
      sortOrder: Number(f.get("sortOrder") ?? 0),
    };
    start(async () => {
      const res = banner
        ? await updateBanner(banner.id, input)
        : await createBanner(input);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(banner ? "Banner updated" : "Banner created");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {banner ? (
          <Button variant="outline" size="sm">
            Edit
          </Button>
        ) : (
          <Button size="sm">
            <Plus className="size-4" />
            Add banner
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{banner ? "Edit banner" : "New banner"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            name="image"
            label="Image URL"
            required
            defaultValue={banner?.image}
          />
          <TextField
            name="title"
            label="Title"
            defaultValue={banner?.title ?? ""}
          />
          <TextAreaField
            name="subtitle"
            label="Subtitle"
            rows={2}
            defaultValue={banner?.subtitle ?? ""}
          />
          <div className="grid grid-cols-2 gap-4">
            <TextField
              name="ctaLabel"
              label="Button label"
              defaultValue={banner?.ctaLabel ?? ""}
            />
            <TextField
              name="ctaHref"
              label="Button link"
              defaultValue={banner?.ctaHref ?? ""}
            />
          </div>
          <TextField
            name="sortOrder"
            label="Sort order"
            type="number"
            defaultValue={String(banner?.sortOrder ?? 0)}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
