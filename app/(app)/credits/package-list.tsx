"use client";

import { Check, Sparkles } from "lucide-react";
import { useState } from "react";

import { postJson } from "@/app/shared/api";
import { useToast } from "@/app/shared/toast";
import { Badge, Button } from "@/app/shared/ui";
import { formatMoney } from "@/lib/format";

export type PurchasablePackage = {
  id: string;
  slug: string;
  name: string;
  credits: number;
  priceCents: number;
  currency: string;
  description: string;
};

export default function PackageList({
  packages,
  recommendedSlug,
}: {
  packages: PurchasablePackage[];
  recommendedSlug?: string;
}) {
  const toast = useToast();
  const [buying, setBuying] = useState<string | null>(null);

  async function handleBuy(slug: string) {
    setBuying(slug);

    const response = await postJson("/api/checkout", { packageSlug: slug });
    if (!response.ok) {
      setBuying(null);
      toast(response.error, "error");
      return;
    }

    // Hand the browser to the gateway's hosted page. The app is not involved
    // again until its callback is verified.
    window.location.href = response.redirectUrl as string;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {packages.map((entry) => {
        const recommended = entry.slug === recommendedSlug;
        const perLetter = entry.priceCents / entry.credits;

        return (
          <div
            key={entry.id}
            className={`flex flex-col rounded-[10px] border bg-white p-6 ${
              recommended ? "border-[#DDD8FF]" : "border-[#E4E4E7]"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold">{entry.name}</h2>
              {recommended && <Badge tone="brand">Most popular</Badge>}
            </div>

            <p className="mt-1.5 text-sm leading-[21px] text-[#52525B]">{entry.description}</p>

            <p className="mt-5 text-[28px] font-bold leading-8 tracking-[-0.02em]">
              {formatMoney(entry.priceCents, entry.currency)}
            </p>
            <p className="mt-1 text-[13px] text-[#71717A]">
              {entry.credits} credits · {formatMoney(Math.round(perLetter), entry.currency)} per
              letter
            </p>

            <ul className="mt-5 space-y-2 text-[13px] text-[#52525B]">
              <Feature>{entry.credits} cover letters</Feature>
              <Feature>Unlimited edits and AI rewrites</Feature>
              <Feature>PDF export</Feature>
            </ul>

            <Button
              variant={recommended ? "primary" : "secondary"}
              icon={Sparkles}
              className="mt-6 w-full"
              onClick={() => handleBuy(entry.slug)}
              loading={buying === entry.slug}
              disabled={buying !== null && buying !== entry.slug}
            >
              Buy {entry.credits} credits
            </Button>
          </div>
        );
      })}
    </div>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check size={14} className="mt-0.5 shrink-0 text-[#16A34A]" aria-hidden="true" />
      {children}
    </li>
  );
}
