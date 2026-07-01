import { env } from "@/lib/env";

/** True when unsigned browser uploads are configured. */
export const cloudinaryEnabled = Boolean(
  env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
  env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
);

/**
 * Upload a single file to Cloudinary via the unsigned upload API and return the
 * secure hosted URL. The folder is applied by the upload preset (configured in
 * the Cloudinary dashboard), so nothing sensitive is sent from the browser.
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !preset) {
    throw new Error("Cloudinary is not configured.");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", preset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: form },
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Cloudinary upload failed (${res.status}). ${detail}`.trim(),
    );
  }

  const data = (await res.json()) as { secure_url?: string };
  if (!data.secure_url) throw new Error("Cloudinary returned no URL.");
  return data.secure_url;
}
