"use server";

import { z } from "zod";

import { sendLeadNotificationEmail } from "@/lib/email";

export type ContactResult = { ok: true } | { ok: false; error: string };

const schema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Enter a valid email"),
  phone: z.string().max(20).optional().or(z.literal("")),
  subject: z.string().max(150).optional().or(z.literal("")),
  message: z.string().min(5, "Please enter a message").max(2000),
});

export type ContactInput = z.input<typeof schema>;

export async function submitContact(
  input: ContactInput,
): Promise<ContactResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const d = parsed.data;
  try {
    await sendLeadNotificationEmail({
      type: "Contact",
      rows: [
        { label: "Name", value: d.name },
        { label: "Email", value: d.email },
        { label: "Phone", value: d.phone || "—" },
        { label: "Subject", value: d.subject || "—" },
        { label: "Message", value: d.message },
      ],
    });
  } catch {
    return {
      ok: false,
      error: "Could not send your message. Please try again.",
    };
  }
  return { ok: true };
}
