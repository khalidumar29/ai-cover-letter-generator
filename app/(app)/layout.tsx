import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { isAdmin } from "@/lib/auth/guard";
import { getCurrentUser } from "@/lib/auth/session";
import { ToastProvider } from "@/app/shared/toast";
import AppSidebar from "./app-sidebar";

/**
 * Gate for every signed-in screen. The proxy already rejects requests without
 * a valid session cookie; this layer adds the checks that need the database —
 * the account still existing, and the email being confirmed.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.emailVerifiedAt) redirect("/verify-email");

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#FAFAFA] text-[#18181B]">
        <AppSidebar
          user={{
            name: user.name,
            email: user.email,
            credits: user.credits,
            isAdmin: isAdmin(user),
          }}
        />
        <div className="lg:pl-[240px]">
          <main className="mx-auto max-w-[1280px] px-4 pb-16 pt-16 sm:px-6 lg:px-10 lg:pt-10">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
