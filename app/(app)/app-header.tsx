"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, LogOut, Loader2 } from "lucide-react";
import { useState } from "react";

import { postJson } from "@/app/shared/api";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/account/password", label: "Password" },
];

export default function AppHeader({ credits }: { credits: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    await postJson("/api/auth/logout", {});
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-[#ECECEF] bg-white">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-6 px-4 sm:px-6 lg:px-10">
        <Link href="/dashboard" className="flex items-center gap-2.5 rounded-lg focus-ring">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E4E4E7]">
            <FileText size={16} aria-hidden="true" />
          </span>
          <span className="hidden text-sm font-semibold sm:block">
            AI Cover Letter Generator
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`focus-ring rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-[#F1EFFE] text-[#5D4EEA]"
                    : "text-[#52525B] hover:bg-[#F7F7F8] hover:text-[#18181B]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden rounded-full border border-[#E4E4E7] px-3 py-1 text-xs font-medium text-[#52525B] sm:block">
            {credits} {credits === 1 ? "credit" : "credits"}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            disabled={signingOut}
            className="focus-ring flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-[#52525B] transition hover:bg-[#F7F7F8] hover:text-[#18181B] disabled:opacity-60"
          >
            {signingOut ? (
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />
            ) : (
              <LogOut size={15} aria-hidden="true" />
            )}
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
