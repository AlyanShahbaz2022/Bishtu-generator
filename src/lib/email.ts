import "server-only";

import { Resend } from "resend";

import { siteConfig } from "@/constants/site";
import { env } from "@/lib/env";

/**
 * Transactional email via Resend (Phase 2 auth flows; reused by later phases).
 *
 * When `RESEND_API_KEY` is unset the helpers degrade gracefully: in development
 * they log the message (and any action URL) to the console so auth flows are
 * testable without a Resend account; in production a missing key throws.
 */
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

const FROM = env.EMAIL_FROM ?? `${siteConfig.name} <onboarding@resend.dev>`;

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  /** Plain-text fallback / dev-log hint (e.g. the action URL). */
  text: string;
};

async function send({ to, subject, html, text }: SendArgs): Promise<void> {
  if (!resend) {
    if (env.NODE_ENV === "production") {
      throw new Error(
        "RESEND_API_KEY is not configured — cannot send transactional email.",
      );
    }
    console.info(
      `\n📧 [dev email] to=${to}\n   subject=${subject}\n   ${text}\n`,
    );
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/** Branded wrapper around email body content. */
function layout(heading: string, body: string): string {
  return `
  <div style="background:#08170e;padding:32px 0;font-family:Inter,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#122c1d;border:1px solid #1c3b29;border-radius:16px;padding:32px;color:#e6f1ea;">
      <h1 style="margin:0 0 8px;font-size:20px;color:#76c043;">${siteConfig.name}</h1>
      <h2 style="margin:0 0 16px;font-size:16px;font-weight:600;color:#ffffff;">${heading}</h2>
      ${body}
      <p style="margin:32px 0 0;font-size:12px;color:#7c9486;">
        ${siteConfig.description}
      </p>
    </div>
  </div>`;
}

function button(label: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;background:#4caf50;color:#08170e;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:10px;margin:8px 0;">${label}</a>`;
}

export async function sendVerificationEmail(args: {
  to: string;
  name: string;
  url: string;
}): Promise<void> {
  const { to, name, url } = args;
  await send({
    to,
    subject: `Verify your ${siteConfig.name} account`,
    text: `Hi ${name}, verify your email: ${url}`,
    html: layout(
      "Confirm your email address",
      `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#cfe0d6;">
         Hi ${name}, welcome to ${siteConfig.name}. Please confirm your email
         address to activate your account.
       </p>
       ${button("Verify email", url)}
       <p style="margin:16px 0 0;font-size:12px;color:#7c9486;">
         If you didn't create this account, you can safely ignore this email.
       </p>`,
    ),
  });
}

export async function sendPasswordResetEmail(args: {
  to: string;
  name: string;
  url: string;
}): Promise<void> {
  const { to, name, url } = args;
  await send({
    to,
    subject: `Reset your ${siteConfig.name} password`,
    text: `Hi ${name}, reset your password: ${url}`,
    html: layout(
      "Reset your password",
      `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#cfe0d6;">
         Hi ${name}, we received a request to reset your password. Click below to
         choose a new one. This link expires in 1 hour.
       </p>
       ${button("Reset password", url)}
       <p style="margin:16px 0 0;font-size:12px;color:#7c9486;">
         If you didn't request this, you can safely ignore this email.
       </p>`,
    ),
  });
}

export async function sendOrderConfirmationEmail(args: {
  to: string;
  name: string;
  orderNumber: string;
  total: string;
  paymentMethod: string;
  url: string;
}): Promise<void> {
  const { to, name, orderNumber, total, paymentMethod, url } = args;
  await send({
    to,
    subject: `Order ${orderNumber} confirmed — ${siteConfig.name}`,
    text: `Hi ${name}, your order ${orderNumber} (${total}, ${paymentMethod}) is confirmed. Track it: ${url}`,
    html: layout(
      "Thank you for your order",
      `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#cfe0d6;">
         Hi ${name}, we've received your order and our team will be in touch
         shortly to confirm payment and delivery.
       </p>
       <p style="margin:0 0 4px;font-size:14px;color:#cfe0d6;">Order number: <strong style="color:#fff;">${orderNumber}</strong></p>
       <p style="margin:0 0 4px;font-size:14px;color:#cfe0d6;">Total: <strong style="color:#fff;">${total}</strong></p>
       <p style="margin:0 0 16px;font-size:14px;color:#cfe0d6;">Payment method: <strong style="color:#fff;">${paymentMethod}</strong></p>
       ${button("View your order", url)}`,
    ),
  });
}

/**
 * Internal notification to the sales inbox when a new lead (quote/rental/
 * service) is submitted. Sent to the configured company email.
 */
export async function sendLeadNotificationEmail(args: {
  type: "Quote" | "Rental" | "Service" | "Contact";
  rows: { label: string; value: string }[];
}): Promise<void> {
  const { type, rows } = args;
  const to = siteConfig.contact.email;
  const text = rows.map((r) => `${r.label}: ${r.value}`).join("\n");
  await send({
    to,
    subject: `New ${type} request — ${siteConfig.name}`,
    text: `New ${type} request:\n${text}`,
    html: layout(
      `New ${type} request`,
      `<table style="width:100%;border-collapse:collapse;font-size:14px;color:#cfe0d6;">
        ${rows
          .map(
            (r) =>
              `<tr><td style="padding:6px 0;color:#7c9486;">${r.label}</td><td style="padding:6px 0;color:#fff;font-weight:600;text-align:right;">${escapeHtml(r.value)}</td></tr>`,
          )
          .join("")}
      </table>`,
    ),
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
