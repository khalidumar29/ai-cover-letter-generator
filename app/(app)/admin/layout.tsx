import type { ReactNode } from "react";

import { requireAdminPage } from "@/lib/auth/guard";
import AdminNav from "./admin-nav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminPage();

  return (
    <>
      <AdminNav />
      {children}
    </>
  );
}
