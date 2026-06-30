"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  LeadSuccess,
  SubmitButton,
  TextAreaField,
  TextField,
} from "@/features/leads/components/fields";
import { submitContact } from "@/features/marketing/contact-actions";

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    setLoading(true);
    const res = await submitContact({
      name: String(f.get("name") ?? ""),
      email: String(f.get("email") ?? ""),
      phone: String(f.get("phone") ?? ""),
      subject: String(f.get("subject") ?? ""),
      message: String(f.get("message") ?? ""),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <LeadSuccess message="Thanks for reaching out! We'll get back to you shortly." />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="name" label="Full name" required />
        <TextField name="email" label="Email" type="email" required />
        <TextField name="phone" label="Phone" type="tel" />
        <TextField name="subject" label="Subject" />
      </div>
      <TextAreaField name="message" label="Message" required rows={5} />
      <SubmitButton loading={loading} label="Send message" />
    </form>
  );
}
