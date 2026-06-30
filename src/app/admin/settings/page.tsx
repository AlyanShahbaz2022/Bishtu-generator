import type { Metadata } from "next";

import { PageHeader } from "@/features/admin/components/page-header";
import { SettingsForm } from "@/features/admin/settings/settings-form";
import { SETTING_KEYS } from "@/features/admin/settings/constants";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await prisma.setting.findMany({
    where: { key: { in: [...SETTING_KEYS] } },
  });

  const values: Record<string, string> = {};
  for (const s of settings) {
    values[s.key] =
      typeof s.value === "string" ? s.value : String(s.value ?? "");
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Store identity and contact information."
      />
      <SettingsForm values={values} />
    </div>
  );
}
