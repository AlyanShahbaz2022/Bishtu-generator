"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { TextField } from "@/features/leads/components/fields";
import { updateSettings } from "@/features/admin/settings/actions";

export function SettingsForm({ values }: { values: Record<string, string> }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    start(async () => {
      await updateSettings({
        company_name: String(f.get("company_name") ?? ""),
        company_logo: String(f.get("company_logo") ?? ""),
        company_email: String(f.get("company_email") ?? ""),
        company_phone: String(f.get("company_phone") ?? ""),
        whatsapp_number: String(f.get("whatsapp_number") ?? ""),
        company_address: String(f.get("company_address") ?? ""),
        currency: String(f.get("currency") ?? ""),
      });
      toast.success("Settings saved");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <TextField
        name="company_name"
        label="Store name"
        defaultValue={values.company_name}
      />
      <TextField
        name="company_logo"
        label="Logo URL"
        defaultValue={values.company_logo}
      />
      <TextField
        name="company_email"
        label="Contact email"
        type="email"
        defaultValue={values.company_email}
      />
      <TextField
        name="company_phone"
        label="Contact phone"
        defaultValue={values.company_phone}
      />
      <TextField
        name="whatsapp_number"
        label="WhatsApp number"
        defaultValue={values.whatsapp_number}
      />
      <TextField
        name="company_address"
        label="Address"
        defaultValue={values.company_address}
      />
      <TextField
        name="currency"
        label="Currency"
        defaultValue={values.currency || "PKR"}
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
