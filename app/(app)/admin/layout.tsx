import type { ReactNode } from "react";

import { requireAdminPage } from "@/lib/auth/guard";
import AdminNav from "./admin-nav";

/**
 * Every admin screen is gated here rather than page by page, so a new page
 * added under this route is protected by default.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminPage();

  return (
    <>
      <AdminNav />
      {children}
    </>
  );
}
