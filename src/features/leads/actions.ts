"use server";

import { z } from "zod";

import { sendLeadNotificationEmail } from "@/lib/email";
import { getServerSession } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

export type LeadResult = { ok: true } | { ok: false; error: string };

const contact = {
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(6, "Phone is required").max(20),
};
const opt = z.string().max(300).optional().or(z.literal(""));
const blankToNull = (v: string | undefined) => (v ? v : null);
const dateOrNull = (v: string | undefined) => (v ? new Date(v) : null);

function fail(error: z.ZodError): LeadResult {
  return { ok: false, error: error.issues[0]?.message ?? "Invalid submission" };
}

/* ----------------------------- Quote ----------------------------- */

const quoteSchema = z.object({
  ...contact,
  company: opt,
  city: opt,
  generatorType: z.enum(["DIESEL", "PETROL", "SILENT", "OPEN_TYPE"]).optional(),
  requiredKVA: z.coerce.number().int().positive().max(100000).optional(),
  brandPreference: opt,
  purchaseType: z.enum(["PURCHASE", "RENTAL"]).default("PURCHASE"),
  budget: opt,
  installationRequired: z.boolean().default(false),
  message: z.string().max(2000).optional().or(z.literal("")),
});
export type QuoteInput = z.input<typeof quoteSchema>;

export async function submitQuote(input: QuoteInput): Promise<LeadResult> {
  const parsed = quoteSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error);
  const d = parsed.data;

  await prisma.quote.create({
    data: {
      name: d.name,
      email: d.email,
      phone: d.phone,
      company: blankToNull(d.company),
      city: blankToNull(d.city),
      generatorType: d.generatorType,
      requiredKVA: d.requiredKVA ?? null,
      brandPreference: blankToNull(d.brandPreference),
      purchaseType: d.purchaseType,
      budget: blankToNull(d.budget),
      installationRequired: d.installationRequired,
      message: blankToNull(d.message),
    },
  });

  await notify("Quote", [
    { label: "Name", value: d.name },
    { label: "Email", value: d.email },
    { label: "Phone", value: d.phone },
    { label: "Company", value: d.company || "—" },
    {
      label: "Required KVA",
      value: d.requiredKVA ? String(d.requiredKVA) : "—",
    },
    { label: "Type", value: d.purchaseType },
    { label: "Budget", value: d.budget || "—" },
  ]);

  return { ok: true };
}

/* ----------------------------- Rental ----------------------------- */

const rentalSchema = z.object({
  ...contact,
  location: z.string().min(2, "Location is required").max(200),
  rentalStart: z.string().optional().or(z.literal("")),
  rentalEnd: z.string().optional().or(z.literal("")),
  expectedLoad: opt,
  installationRequired: z.boolean().default(false),
  transportRequired: z.boolean().default(false),
  notes: z.string().max(2000).optional().or(z.literal("")),
});
export type RentalInput = z.input<typeof rentalSchema>;

export async function submitRental(input: RentalInput): Promise<LeadResult> {
  const parsed = rentalSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error);
  const d = parsed.data;
  const session = await getServerSession();

  await prisma.rental.create({
    data: {
      customerId: session?.user?.id ?? undefined,
      name: d.name,
      email: d.email,
      phone: d.phone,
      location: d.location,
      rentalStart: dateOrNull(d.rentalStart),
      rentalEnd: dateOrNull(d.rentalEnd),
      expectedLoad: blankToNull(d.expectedLoad),
      installationRequired: d.installationRequired,
      transportRequired: d.transportRequired,
      notes: blankToNull(d.notes),
    },
  });

  await notify("Rental", [
    { label: "Name", value: d.name },
    { label: "Email", value: d.email },
    { label: "Phone", value: d.phone },
    { label: "Location", value: d.location },
    {
      label: "Period",
      value: `${d.rentalStart || "?"} → ${d.rentalEnd || "?"}`,
    },
    { label: "Expected load", value: d.expectedLoad || "—" },
  ]);

  return { ok: true };
}

/* ----------------------------- Service ----------------------------- */

const serviceSchema = z.object({
  ...contact,
  generatorBrand: opt,
  generatorModel: opt,
  serialNumber: opt,
  problem: z.string().min(5, "Please describe the problem").max(2000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "EMERGENCY"]).default("MEDIUM"),
  preferredDate: z.string().optional().or(z.literal("")),
  address: opt,
});
export type ServiceInput = z.input<typeof serviceSchema>;

export async function submitService(input: ServiceInput): Promise<LeadResult> {
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error);
  const d = parsed.data;
  const session = await getServerSession();

  await prisma.serviceRequest.create({
    data: {
      customerId: session?.user?.id ?? undefined,
      name: d.name,
      email: d.email,
      phone: d.phone,
      generatorBrand: blankToNull(d.generatorBrand),
      generatorModel: blankToNull(d.generatorModel),
      serialNumber: blankToNull(d.serialNumber),
      problem: d.problem,
      priority: d.priority,
      preferredDate: dateOrNull(d.preferredDate),
      address: blankToNull(d.address),
    },
  });

  await notify("Service", [
    { label: "Name", value: d.name },
    { label: "Email", value: d.email },
    { label: "Phone", value: d.phone },
    {
      label: "Brand / Model",
      value: `${d.generatorBrand || "—"} / ${d.generatorModel || "—"}`,
    },
    { label: "Priority", value: d.priority },
    { label: "Problem", value: d.problem },
  ]);

  return { ok: true };
}

async function notify(
  type: "Quote" | "Rental" | "Service",
  rows: { label: string; value: string }[],
) {
  try {
    await sendLeadNotificationEmail({ type, rows });
  } catch {
    // Never fail a lead submission because of an email hiccup.
  }
}
