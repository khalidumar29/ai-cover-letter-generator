"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  Files,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Plus,
  Settings2,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { postJson } from "@/app/shared/api";

type NavItem = { href: string; label: string; icon: LucideIcon };

const MAIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/letters", label: "Cover letters", icon: Files },
  { href: "/credits", label: "Credits", icon: Wallet },
];

const ACCOUNT_NAV: NavItem[] = [{ href: "/account/password", label: "Settings", icon: Settings2 }];

const ADMIN_NAV: NavItem[] = [{ href: "/admin", label: "Admin", icon: ShieldCheck }];

export type SidebarUser = {
  name: string;
  email: string;
  credits: number;
  isAdmin: boolean;
};

export default function AppSidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => setDrawerOpen(false), [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open navigation"
        className="focus-ring fixed left-4 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-lg border border-[#E4E4E7] bg-white text-[#52525B] lg:hidden"
      >
        <Menu size={18} aria-hidden="true" />
      </button>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col border-r border-[#ECECEF] bg-[#FAFAFA] transition-transform duration-[180ms] ease-out lg:translate-x-0 ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center gap-2.5 px-4">
          <Link href="/dashboard" className="focus-ring flex min-w-0 items-center gap-2.5 rounded-lg">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#18181B] text-white">
              <FileText size={15} aria-hidden="true" />
            </span>
            <span className="truncate text-sm font-semibold">Cover Letter AI</span>
          </Link>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation"
            className="focus-ring ml-auto rounded-lg p-1.5 text-[#71717A] lg:hidden"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="px-3 pb-3 pt-1">
          <Link
            href="/letters/new"
            className="focus-ring flex h-9 items-center justify-center gap-2 rounded-lg bg-[#6D5DFB] text-[13px] font-semibold text-white transition duration-[120ms] hover:bg-[#5D4EEA]"
          >
            <Plus size={15} aria-hidden="true" />
            New cover letter
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3">
          <NavGroup items={MAIN_NAV} pathname={pathname} />

          {user.isAdmin && (
            <>
              <p className="px-2.5 pb-1.5 pt-5 text-[11px] font-medium uppercase tracking-wide text-[#A1A1AA]">
                Administration
              </p>
              <NavGroup items={ADMIN_NAV} pathname={pathname} />
            </>
          )}

          <div className="pt-5">
            <NavGroup items={ACCOUNT_NAV} pathname={pathname} />
          </div>
        </nav>

        <SidebarFooter user={user} />
      </aside>
    </>
  );
}

function NavGroup({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <ul className="space-y-0.5">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={`focus-ring flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm transition duration-[120ms] ${
                active
                  ? "bg-white font-medium text-[#18181B] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  : "text-[#52525B] hover:bg-[#F1F1F3] hover:text-[#18181B]"
              }`}
            >
              <Icon size={17} aria-hidden="true" className={active ? "text-[#6D5DFB]" : ""} />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SidebarFooter({ user }: { user: SidebarUser }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    await postJson("/api/auth/logout", {});
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="border-t border-[#ECECEF] p-3">
      <Link
        href="/credits"
        className="focus-ring mb-2 flex items-center gap-2 rounded-lg border border-[#E4E4E7] bg-white px-2.5 py-2 transition duration-[120ms] hover:border-[#D4D4D8]"
      >
        <Sparkles size={15} className="shrink-0 text-[#6D5DFB]" aria-hidden="true" />
        <span className="text-[13px] font-medium">
          {user.credits} {user.credits === 1 ? "credit" : "credits"}
        </span>
        <span className="ml-auto text-xs text-[#71717A]">Top up</span>
      </Link>

      <div className="flex items-center gap-2 px-1">
        <span
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F1EFFE] text-[11px] font-semibold text-[#5D4EEA]"
        >
          {initials(user.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium leading-4">{user.name}</p>
          <p className="truncate text-[11px] leading-4 text-[#71717A]">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={signingOut}
          aria-label="Log out"
          className="focus-ring rounded-lg p-1.5 text-[#71717A] transition hover:bg-[#F1F1F3] hover:text-[#18181B] disabled:opacity-60"
        >
          {signingOut ? (
            <Loader2 size={15} className="animate-spin" aria-hidden="true" />
          ) : (
            <LogOut size={15} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}
