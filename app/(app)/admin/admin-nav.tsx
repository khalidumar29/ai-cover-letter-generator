"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/packages", label: "Packages" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex gap-1 border-b border-[#ECECEF]" aria-label="Admin sections">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`focus-ring -mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition duration-[120ms] ${
              active
                ? "border-[#6D5DFB] text-[#18181B]"
                : "border-transparent text-[#71717A] hover:text-[#18181B]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
