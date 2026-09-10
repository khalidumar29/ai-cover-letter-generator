import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getCurrentUser } from "@/lib/auth/session";
import AppHeader from "./app-header";

/**
 * Gate for every signed-in screen. Middleware already rejects requests without
 * a valid session cookie; this layer adds the checks that need the database —
 * the account still existing, and the email being confirmed.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.emailVerifiedAt) redirect("/verify-email");

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#18181B]">
      <AppHeader credits={user.credits} />
      <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10">{children}</main>
    </div>
  );
}
