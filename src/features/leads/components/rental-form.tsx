"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  CheckboxField,
  LeadSuccess,
  SubmitButton,
  TextAreaField,
  TextField,
} from "@/features/leads/components/fields";
import { submitRental } from "@/features/leads/actions";
import { authClient } from "@/lib/auth-client";

export function RentalForm() {
  const { data: session } = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    setLoading(true);
    const res = await submitRental({
      name: String(f.get("name") ?? ""),
      email: String(f.get("email") ?? ""),
      phone: String(f.get("phone") ?? ""),
      location: String(f.get("location") ?? ""),
      rentalStart: String(f.get("rentalStart") ?? ""),
      rentalEnd: String(f.get("rentalEnd") ?? ""),
      expectedLoad: String(f.get("expectedLoad") ?? ""),
      installationRequired: f.get("installationRequired") === "on",
      transportRequired: f.get("transportRequired") === "on",
      notes: String(f.get("notes") ?? ""),
    });
    setLoading(false);
    if (!res.ok) return toast.error(res.error);
    setDone(true);
  }

  if (done) {
    return (
      <LeadSuccess message="Thanks! We'll review your rental requirements and send a rental quotation shortly." />
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
        <TextField name="location" label="Delivery location" required />
        <TextField name="rentalStart" label="Start date" type="date" />
        <TextField name="rentalEnd" label="End date" type="date" />
        <TextField name="expectedLoad" label="Expected load (e.g. 50 KVA)" />
      </div>
      <TextAreaField name="notes" label="Additional details" />
      <div className="flex flex-col gap-2">
        <CheckboxField
          name="installationRequired"
          label="Installation & commissioning required"
        />
        <CheckboxField
          name="transportRequired"
          label="Transport / delivery required"
        />
      </div>
      <SubmitButton loading={loading} label="Request rental" />
    </form>
  );
}
