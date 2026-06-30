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
  renameNavItem,
  toggleNavItem,
  updateNavHref,
} from "@/features/admin/navigation/actions";
import type { AdminNavItem } from "@/services/navigation";

const LEVEL_LABELS = ["Department", "Category", "Sub-category"];
const CHILD_LABELS = ["category", "sub-category"];

type Run = (fn: () => Promise<void>, ok?: string) => void;

export function NavManager({ tree }: { tree: AdminNavItem[] }) {
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
          />
        ))}
        {tree.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No navigation items yet. Add your first department below.
          </p>
        )}
      </div>
      <AddForm level={0} run={run} buttonLabel="Add department" />
    </div>
  );
}

function NavRow({
  item,
  index,
  count,
  run,
}: {
  item: AdminNavItem;
  index: number;
  count: number;
  run: Run;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(item.label);
  const [href, setHref] = useState(item.href ?? "");

  function saveEdits() {
    run(async () => {
      if (label.trim() && label !== item.label)
        await renameNavItem(item.id, label.trim());
      if (href !== (item.href ?? "")) await updateNavHref(item.id, href);
    }, "Saved");
    setEditing(false);
  }

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
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="h-8 w-44"
                placeholder="Label"
              />
              <Input
                value={href}
                onChange={(e) => setHref(e.target.value)}
                className="h-8 w-56"
                placeholder="/href (optional)"
              />
              <Button size="sm" onClick={saveEdits}>
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditing(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-medium">{item.label}</span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground uppercase">
                {LEVEL_LABELS[item.level]}
              </span>
              {item.href && (
                <span className="truncate text-xs text-muted-foreground">
                  {item.href}
                </span>
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
            description="This also deletes all of its sub-items. Linked categories are kept."
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
            />
          ))}
          <AddForm
            level={item.level + 1}
            parentId={item.id}
            run={run}
            buttonLabel={`Add ${CHILD_LABELS[item.level]}`}
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
}: {
  level: number;
  parentId?: string;
  run: Run;
  buttonLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");

  function submit() {
    const value = label.trim();
    if (!value) return;
    run(() => addNavItem({ label: value, level, parentId }), "Added");
    setLabel("");
    setOpen(false);
  }

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
    <div className="flex items-center gap-2 pt-1">
      <Input
        autoFocus
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder={buttonLabel}
        className="h-8 w-52"
      />
      <Button size="sm" onClick={submit}>
        Add
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
        <X className="size-4" />
      </Button>
    </div>
  );
}
