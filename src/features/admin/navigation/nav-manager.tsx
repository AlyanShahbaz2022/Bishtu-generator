"use client";

import { ChevronDown, ChevronUp, Pencil, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDelete } from "@/features/admin/components/confirm-delete";
import { InlineToggle } from "@/features/admin/components/inline-toggle";
import {
  addNavItem,
  deleteNavItem,
  moveNavItem,
  toggleNavItem,
  updateNavItem,
} from "@/features/admin/navigation/actions";
import type { AdminNavItem, CategoryOption } from "@/services/navigation";

const LEVEL_LABELS = ["Department", "Category", "Sub-category"];
const CHILD_LABELS = ["category", "sub-category"];

type Run = (fn: () => Promise<void>, ok?: string) => void;

export function NavManager({
  tree,
  categories,
}: {
  tree: AdminNavItem[];
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [, start] = useTransition();

  const run: Run = (fn, ok) =>
    start(async () => {
      try {
        await fn();
        if (ok) toast.success(ok);
        router.refresh();
      } catch {
        toast.error("Action failed");
      }
    });

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {tree.map((dept, i) => (
          <NavRow
            key={dept.id}
            item={dept}
            index={i}
            count={tree.length}
            run={run}
            categories={categories}
          />
        ))}
        {tree.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No navigation items yet. Add your first department below.
          </p>
        )}
      </div>
      <AddForm
        level={0}
        run={run}
        buttonLabel="Add department"
        categories={categories}
      />
    </div>
  );
}

function NavRow({
  item,
  index,
  count,
  run,
  categories,
}: {
  item: AdminNavItem;
  index: number;
  count: number;
  run: Run;
  categories: CategoryOption[];
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="rounded-xl border border-border">
      <div className="flex items-center gap-2 p-3">
        <div className="flex flex-col">
          <button
            type="button"
            aria-label="Move up"
            disabled={index === 0}
            onClick={() => run(() => moveNavItem(item.id, "up"))}
            className="text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <ChevronUp className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Move down"
            disabled={index === count - 1}
            onClick={() => run(() => moveNavItem(item.id, "down"))}
            className="text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <ChevronDown className="size-4" />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          {editing ? (
            <LinkFields
              categories={categories}
              initialLabel={item.label}
              initialCategoryId={item.categoryId}
              initialHref={item.href}
              submitLabel="Save"
              onCancel={() => setEditing(false)}
              onSubmit={(values) =>
                run(async () => {
                  const res = await updateNavItem(item.id, values);
                  if (!res.ok) throw new Error(res.error);
                  setEditing(false);
                }, "Saved")
              }
            />
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-medium">{item.label}</span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground uppercase">
                {LEVEL_LABELS[item.level]}
              </span>
              {item.categoryName ? (
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                  Category · {item.categoryName}
                </span>
              ) : (
                item.href && (
                  <span className="truncate text-xs text-muted-foreground">
                    {item.href}
                  </span>
                )
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <InlineToggle
            checked={item.isEnabled}
            label="Visible"
            action={(next) => toggleNavItem(item.id, next)}
          />
          {!editing && (
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Edit"
              onClick={() => setEditing(true)}
            >
              <Pencil className="size-4" />
            </Button>
          )}
          <ConfirmDelete
            action={() => deleteNavItem(item.id)}
            title={`Delete “${item.label}”?`}
            description="Removes this menu item and all of its sub-items. The linked category (if any) is kept — manage it under Categories."
            successMessage="Deleted"
          />
        </div>
      </div>

      {/* Children + add control */}
      {item.level < 2 && (
        <div className="ml-6 space-y-2 border-l border-border pb-3 pl-4">
          {item.children.map((child, i) => (
            <NavRow
              key={child.id}
              item={child}
              index={i}
              count={item.children.length}
              run={run}
              categories={categories}
            />
          ))}
          <AddForm
            level={item.level + 1}
            parentId={item.id}
            run={run}
            buttonLabel={`Add ${CHILD_LABELS[item.level]}`}
            categories={categories}
          />
        </div>
      )}
    </div>
  );
}

function AddForm({
  level,
  parentId,
  run,
  buttonLabel,
  categories,
}: {
  level: number;
  parentId?: string;
  run: Run;
  buttonLabel: string;
  categories: CategoryOption[];
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setOpen(true)}
        className="text-muted-foreground"
      >
        <Plus className="size-4" />
        {buttonLabel}
      </Button>
    );
  }

  return (
    <div className="pt-1">
      <LinkFields
        categories={categories}
        submitLabel="Add"
        onCancel={() => setOpen(false)}
        onSubmit={(values) =>
          run(async () => {
            const res = await addNavItem({ ...values, level, parentId });
            if (!res.ok) throw new Error(res.error);
            setOpen(false);
          }, "Added")
        }
      />
    </div>
  );
}

/**
 * Shared editor for a nav item: choose "Category" (pick an existing category →
 * auto-routed) or "Custom link" (free label + href). Used by both add and edit.
 */
function LinkFields({
  categories,
  initialLabel = "",
  initialCategoryId = null,
  initialHref = null,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  categories: CategoryOption[];
  initialLabel?: string;
  initialCategoryId?: string | null;
  initialHref?: string | null;
  submitLabel: string;
  onSubmit: (values: {
    label: string;
    categoryId?: string;
    href?: string;
  }) => void;
  onCancel: () => void;
}) {
  const [mode, setMode] = useState<"category" | "custom">(
    initialCategoryId ? "category" : "custom",
  );
  const [label, setLabel] = useState(initialLabel);
  const [categoryId, setCategoryId] = useState(initialCategoryId ?? "");
  const [href, setHref] = useState(initialHref ?? "");
  const [pending, start] = useTransition();

  function submit() {
    if (mode === "category") {
      if (!categoryId) {
        toast.error("Pick a category");
        return;
      }
      start(() => onSubmit({ label: label.trim(), categoryId }));
    } else {
      if (!label.trim()) {
        toast.error("Enter a label");
        return;
      }
      start(() => onSubmit({ label: label.trim(), href: href.trim() }));
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-muted/40 p-2">
      {/* Mode toggle */}
      <div className="flex gap-1">
        <Button
          type="button"
          size="sm"
          variant={mode === "category" ? "default" : "outline"}
          onClick={() => setMode("category")}
          className="h-7"
        >
          Category
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "custom" ? "default" : "outline"}
          onClick={() => setMode("custom")}
          className="h-7"
        >
          Custom link
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {mode === "category" ? (
          <>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="">Select a category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="h-8 w-44"
              placeholder="Menu label (optional)"
            />
          </>
        ) : (
          <>
            <Input
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="h-8 w-44"
              placeholder="Label (e.g. Deals)"
            />
            <Input
              value={href}
              onChange={(e) => setHref(e.target.value)}
              className="h-8 w-56"
              placeholder="/path or https://… (optional)"
            />
          </>
        )}

        <Button size="sm" onClick={submit} disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          <X className="size-4" />
        </Button>
      </div>

      {mode === "category" && categories.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No categories yet — create one under Categories first.
        </p>
      )}
    </div>
  );
}
