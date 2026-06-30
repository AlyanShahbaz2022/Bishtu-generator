"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  CheckboxField,
  LeadSuccess,
  SelectField,
  SubmitButton,
  TextAreaField,
  TextField,
} from "@/features/leads/components/fields";
import { submitQuote } from "@/features/leads/actions";
import { authClient } from "@/lib/auth-client";

export function QuoteForm() {
  const { data: session } = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const gt = String(f.get("generatorType") ?? "");
    const kva = String(f.get("requiredKVA") ?? "");

    setLoading(true);
    const res = await submitQuote({
      name: String(f.get("name") ?? ""),
      email: String(f.get("email") ?? ""),
      phone: String(f.get("phone") ?? ""),
      company: String(f.get("company") ?? ""),
      city: String(f.get("city") ?? ""),
      generatorType: gt
        ? (gt as "DIESEL" | "PETROL" | "SILENT" | "OPEN_TYPE")
        : undefined,
      requiredKVA: kva ? Number(kva) : undefined,
      purchaseType: f.get("purchaseType") === "RENTAL" ? "RENTAL" : "PURCHASE",
      budget: String(f.get("budget") ?? ""),
      installationRequired: f.get("installationRequired") === "on",
      message: String(f.get("message") ?? ""),
    });
    setLoading(false);

    if (!res.ok) return toast.error(res.error);
    setDone(true);
  }

  if (done) {
    return (
      <LeadSuccess message="Thanks! Our sales team will prepare your quotation and contact you shortly." />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          name="name"
          label="Full name"
          required
          defaultValue={session?.user?.name}
        />
        <TextField
          name="email"
          label="Email"
          type="email"
          required
          defaultValue={session?.user?.email}
        />
        <TextField name="phone" label="Phone" type="tel" required />
        <TextField name="company" label="Company" />
        <TextField name="city" label="City" />
        <SelectField
          name="generatorType"
          label="Generator type"
          defaultValue=""
          options={[
            { value: "", label: "Any / not sure" },
            { value: "DIESEL", label: "Diesel" },
            { value: "PETROL", label: "Petrol" },
            { value: "SILENT", label: "Silent" },
            { value: "OPEN_TYPE", label: "Open type" },
          ]}
        />
        <TextField
          name="requiredKVA"
          label="Required power (KVA)"
          type="number"
        />
        <SelectField
          name="purchaseType"
          label="Purchase or rental"
          defaultValue="PURCHASE"
          options={[
            { value: "PURCHASE", label: "Purchase" },
            { value: "RENTAL", label: "Rental" },
          ]}
        />
        <TextField name="budget" label="Budget (optional)" />
      </div>
      <TextAreaField name="message" label="Additional details" />
      <CheckboxField
        name="installationRequired"
        label="I need installation & commissioning"
      />
      <SubmitButton loading={loading} label="Request quote" />
    </form>
  );
}
