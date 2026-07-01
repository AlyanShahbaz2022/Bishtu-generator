"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ImageDropzone } from "@/features/admin/components/image-dropzone";
import {
  CheckboxField,
  SelectField,
  TextAreaField,
  TextField,
} from "@/features/leads/components/fields";
import {
  createProduct,
  updateProduct,
  type ProductInput,
} from "@/features/admin/products/actions";

const DRAFT_KEY = "tt-admin-product-draft";

export type ProductFormData = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  brandId: string | null;
  price: number;
  salePrice: number | null;
  costPrice: number | null;
  stock: number;
  minimumStock: number;
  kva: number | null;
  fuelType: string | null;
  generatorType: string | null;
  engineModel: string | null;
  alternator: string | null;
  voltage: string | null;
  frequency: string | null;
  phase: string | null;
  warranty: string | null;
  datasheetUrl: string | null;
  shortDescription: string | null;
  description: string | null;
  featured: boolean;
  published: boolean;
  images: string[];
};

type Option = { id: string; name: string };

const numOpt = (v: FormDataEntryValue | null) =>
  v && String(v).trim() ? Number(v) : undefined;
const str = (v: FormDataEntryValue | null) => String(v ?? "");

export function ProductForm({
  product,
  categories,
  brands,
}: {
  product?: ProductFormData;
  categories: Option[];
  brands: Option[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [pending, start] = useTransition();

  // Restore draft (new product only) — DOM writes, no setState.
  useEffect(() => {
    if (product || !formRef.current) return;
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as Record<string, string>;
      for (const [k, v] of Object.entries(data)) {
        const el = formRef.current.elements.namedItem(k) as
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
        if (!el) continue;
        if (el instanceof HTMLInputElement && el.type === "checkbox")
          el.checked = v === "on";
        else el.value = v;
      }
    } catch {
      /* ignore malformed draft */
    }
  }, [product]);

  function saveDraft() {
    if (product || !formRef.current) return;
    const data = Object.fromEntries(new FormData(formRef.current).entries());
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const input: ProductInput = {
      name: str(f.get("name")),
      slug: str(f.get("slug")),
      sku: str(f.get("sku")),
      categoryId: str(f.get("categoryId")),
      brandId: str(f.get("brandId")),
      price: Number(f.get("price") || 0),
      salePrice: numOpt(f.get("salePrice")),
      costPrice: numOpt(f.get("costPrice")),
      stock: Number(f.get("stock") || 0),
      minimumStock: Number(f.get("minimumStock") || 0),
      kva: numOpt(f.get("kva")),
      fuelType: (str(f.get("fuelType")) ||
        undefined) as ProductInput["fuelType"],
      generatorType: (str(f.get("generatorType")) ||
        undefined) as ProductInput["generatorType"],
      engineModel: str(f.get("engineModel")),
      alternator: str(f.get("alternator")),
      voltage: str(f.get("voltage")),
      frequency: str(f.get("frequency")),
      phase: str(f.get("phase")),
      warranty: str(f.get("warranty")),
      datasheetUrl: str(f.get("datasheetUrl")),
      shortDescription: str(f.get("shortDescription")),
      description: str(f.get("description")),
      featured: f.get("featured") === "on",
      published: f.get("published") === "on",
      images,
    };

    start(async () => {
      const res = product
        ? await updateProduct(product.id, input)
        : await createProduct(input);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      if (!product) localStorage.removeItem(DRAFT_KEY);
      toast.success(product ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onInput={saveDraft}
      className="space-y-8"
    >
      <Section title="Basics">
        <TextField
          name="name"
          label="Name"
          required
          defaultValue={product?.name}
        />
        <TextField
          name="sku"
          label="SKU"
          required
          defaultValue={product?.sku}
        />
        <TextField
          name="slug"
          label="Slug (optional)"
          defaultValue={product?.slug}
        />
        <SelectField
          name="categoryId"
          label="Category"
          defaultValue={product?.categoryId ?? ""}
          options={[
            { value: "", label: "Select category…" },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <SelectField
          name="brandId"
          label="Brand"
          defaultValue={product?.brandId ?? ""}
          options={[
            { value: "", label: "No brand" },
            ...brands.map((b) => ({ value: b.id, label: b.name })),
          ]}
        />
      </Section>

      <Section title="Pricing & stock">
        <TextField
          name="price"
          label="Price (PKR)"
          type="number"
          required
          defaultValue={numStr(product?.price)}
        />
        <TextField
          name="salePrice"
          label="Sale price"
          type="number"
          defaultValue={numStr(product?.salePrice)}
        />
        <TextField
          name="costPrice"
          label="Cost price"
          type="number"
          defaultValue={numStr(product?.costPrice)}
        />
        <TextField
          name="stock"
          label="Stock"
          type="number"
          defaultValue={numStr(product?.stock)}
        />
        <TextField
          name="minimumStock"
          label="Minimum stock"
          type="number"
          defaultValue={numStr(product?.minimumStock)}
        />
      </Section>

      <Section title="Specifications">
        <TextField
          name="kva"
          label="Power (KVA)"
          type="number"
          defaultValue={numStr(product?.kva)}
        />
        <SelectField
          name="fuelType"
          label="Fuel type"
          defaultValue={product?.fuelType ?? ""}
          options={[
            { value: "", label: "None" },
            { value: "DIESEL", label: "Diesel" },
            { value: "PETROL", label: "Petrol" },
            { value: "GAS", label: "Gas" },
          ]}
        />
        <SelectField
          name="generatorType"
          label="Generator type"
          defaultValue={product?.generatorType ?? ""}
          options={[
            { value: "", label: "None" },
            { value: "DIESEL", label: "Diesel" },
            { value: "PETROL", label: "Petrol" },
            { value: "SILENT", label: "Silent" },
            { value: "OPEN_TYPE", label: "Open type" },
          ]}
        />
        <TextField
          name="engineModel"
          label="Engine model"
          defaultValue={product?.engineModel ?? ""}
        />
        <TextField
          name="alternator"
          label="Alternator"
          defaultValue={product?.alternator ?? ""}
        />
        <TextField
          name="voltage"
          label="Voltage"
          defaultValue={product?.voltage ?? ""}
        />
        <TextField
          name="frequency"
          label="Frequency"
          defaultValue={product?.frequency ?? ""}
        />
        <TextField
          name="phase"
          label="Phase"
          defaultValue={product?.phase ?? ""}
        />
        <TextField
          name="warranty"
          label="Warranty"
          defaultValue={product?.warranty ?? ""}
        />
      </Section>

      <Section title="Media" full>
        <ImageDropzone value={images} onChange={setImages} label="Images" />
        <div className="mt-4">
          <TextField
            name="datasheetUrl"
            label="Datasheet PDF URL"
            defaultValue={product?.datasheetUrl ?? ""}
          />
        </div>
      </Section>

      <Section title="Content" full>
        <TextField
          name="shortDescription"
          label="Short description"
          defaultValue={product?.shortDescription ?? ""}
        />
        <div className="mt-4">
          <TextAreaField
            name="description"
            label="Full description"
            rows={5}
            defaultValue={product?.description ?? ""}
          />
        </div>
        <div className="mt-4 flex flex-col gap-3">
          <CheckboxField
            name="published"
            label="Published (visible on storefront)"
            defaultChecked={product?.published}
          />
          <CheckboxField
            name="featured"
            label="Featured"
            defaultChecked={product?.featured}
          />
        </div>
      </Section>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : product ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  );
}

function numStr(n: number | null | undefined) {
  return n == null ? "" : String(n);
}

function Section({
  title,
  children,
  full,
}: {
  title: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <section className="rounded-xl border border-border p-5">
      <h2 className="mb-4 font-heading font-semibold">{title}</h2>
      <div className={full ? "" : "grid gap-4 sm:grid-cols-2"}>{children}</div>
    </section>
  );
}
