import { History, Sparkles } from "lucide-react";

import { requirePageUser } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";
import { ButtonLink, Card, EmptyState, PageHeader } from "@/app/shared/ui";
import PackageList from "./package-list";

export const metadata = { title: "Credits" };

export default async function CreditsPage() {
  const user = await requirePageUser();

  const packages = await prisma.creditPackage.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { priceCents: "asc" }],
  });

  // The middle option by price, which is the one most people want.
  const recommendedSlug = packages[Math.floor(packages.length / 2)]?.slug;

  return (
    <>
      <PageHeader
        title="Credits"
        description="One credit generates or regenerates one cover letter. Editing and exporting are free."
        actions={
          <ButtonLink href="/credits/history" icon={History}>
            History
          </ButtonLink>
        }
      />

      <Card className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Sparkles size={18} className="text-[#6D5DFB]" aria-hidden="true" />
        <div>
          <p className="text-sm text-[#52525B]">Current balance</p>
          <p className="text-[22px] font-semibold leading-7 tabular-nums">
            {user.credits} {user.credits === 1 ? "credit" : "credits"}
          </p>
        </div>
      </Card>

      {packages.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No packages are on sale right now."
          description="Credit packages are managed by an administrator. Check back shortly."
        />
      ) : (
        <PackageList
          packages={packages.map(({ updatedAt, createdAt, active, sortOrder, ...rest }) => rest)}
          recommendedSlug={recommendedSlug}
        />
      )}

      <p className="mt-8 max-w-[70ch] text-[13px] leading-5 text-[#71717A]">
        Payments run through a sandbox gateway, so no money moves and no card details are
        collected. Credits are added only after the gateway&rsquo;s callback has been verified
        on the server.
      </p>
    </>
  );
}
