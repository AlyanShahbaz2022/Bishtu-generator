import type { Metadata } from "next";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · Tech & Tune" },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  return <AdminShell userName={session.user.name}>{children}</AdminShell>;
}
