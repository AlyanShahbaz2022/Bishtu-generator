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
import {
  SelectField,
  TextAreaField,
  TextField,
} from "@/features/leads/components/fields";
import {
  createCategory,
  updateCategory,
} from "@/features/admin/categories/actions";

type Category = {
  id: string;
  name: string;
  slug: string;
  fuelType: string | null;
  image: string | null;
  description: string | null;
  sortOrder: number;
};

export function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const input = {
      name: String(f.get("name") ?? ""),
      slug: String(f.get("slug") ?? ""),
      fuelType: (f.get("fuelType") as "DIESEL" | "PETROL" | "GAS") || undefined,
      image: String(f.get("image") ?? ""),
      description: String(f.get("description") ?? ""),
      sortOrder: Number(f.get("sortOrder") ?? 0),
    };
    start(async () => {
      const res = category
        ? await updateCategory(category.id, input)
        : await createCategory(input);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(category ? "Category updated" : "Category created");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {category ? (
          <Button variant="outline" size="sm">
            Edit
          </Button>
        ) : (
          <Button size="sm">
            <Plus className="size-4" />
            Add category
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit category" : "New category"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            name="name"
            label="Name"
            required
            defaultValue={category?.name}
          />
          <TextField
            name="slug"
            label="Slug (optional — generated from name)"
            defaultValue={category?.slug}
          />
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              name="fuelType"
              label="Fuel type"
              defaultValue={category?.fuelType ?? ""}
              options={[
                { value: "", label: "None" },
                { value: "DIESEL", label: "Diesel" },
                { value: "PETROL", label: "Petrol" },
                { value: "GAS", label: "Gas" },
              ]}
            />
            <TextField
              name="sortOrder"
              label="Sort order"
              type="number"
              defaultValue={String(category?.sortOrder ?? 0)}
            />
          </div>
          <TextField
            name="image"
            label="Image URL"
            defaultValue={category?.image ?? ""}
          />
          <TextAreaField name="description" label="Description" rows={3} />
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
