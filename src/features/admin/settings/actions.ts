"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import {
  SETTING_KEYS,
  type SettingsInput,
} from "@/features/admin/settings/constants";

export async function updateSettings(input: SettingsInput) {
  await requireAdmin();
  for (const key of SETTING_KEYS) {
    const value = (input[key] ?? "").trim();
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value, group: "general" },
    });
  }
  revalidatePath("/admin/settings");
  return { ok: true as const };
}
