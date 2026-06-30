"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  LeadSuccess,
  SelectField,
  SubmitButton,
  TextAreaField,
  TextField,
} from "@/features/leads/components/fields";
import { submitService } from "@/features/leads/actions";
import { authClient } from "@/lib/auth-client";

export function ServiceForm() {
  const { data: session } = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    setLoading(true);
    const res = await submitService({
      name: String(f.get("name") ?? ""),
      email: String(f.get("email") ?? ""),
      phone: String(f.get("phone") ?? ""),
      generatorBrand: String(f.get("generatorBrand") ?? ""),
      generatorModel: String(f.get("generatorModel") ?? ""),
      serialNumber: String(f.get("serialNumber") ?? ""),
      problem: String(f.get("problem") ?? ""),
      priority:
        (f.get("priority") as "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY") ??
        "MEDIUM",
      preferredDate: String(f.get("preferredDate") ?? ""),
      address: String(f.get("address") ?? ""),
    });
    setLoading(false);
    if (!res.ok) return toast.error(res.error);
    setDone(true);
  }

  if (done) {
    return (
      <LeadSuccess message="Thanks! Our service team will assign an engineer and confirm your appointment." />
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
        <SelectField
          name="priority"
          label="Priority"
          defaultValue="MEDIUM"
          options={[
            { value: "LOW", label: "Low" },
            { value: "MEDIUM", label: "Medium" },
            { value: "HIGH", label: "High" },
            { value: "EMERGENCY", label: "Emergency" },
          ]}
        />
        <TextField name="generatorBrand" label="Generator brand" />
        <TextField name="generatorModel" label="Generator model" />
        <TextField name="serialNumber" label="Serial number" />
        <TextField name="preferredDate" label="Preferred date" type="date" />
      </div>
      <TextField name="address" label="Service address" />
      <TextAreaField name="problem" label="Describe the problem" required />
      <SubmitButton loading={loading} label="Book service" />
    </form>
  );
}
