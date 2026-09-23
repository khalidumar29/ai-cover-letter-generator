import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/app/shared/ui";
import PackageManager from "./package-manager";

export const metadata = { title: "Packages · Admin" };

export default async function AdminPackagesPage() {
  const packages = await prisma.creditPackage.findMany({
    orderBy: [{ sortOrder: "asc" }, { priceCents: "asc" }],
    include: { _count: { select: { payments: true } } },
  });

  return (
    <>
      <PageHeader
        title="Credit packages"
        description="What appears on the credits page. Hiding a package leaves past purchases untouched."
      />

      <PackageManager
        packages={packages.map(({ _count, createdAt, updatedAt, ...rest }) => ({
          ...rest,
          sold: _count.payments,
        }))}
      />
    </>
  );
}
