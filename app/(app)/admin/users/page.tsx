import { requireAdminPage } from "@/lib/auth/guard";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Badge, PageHeader } from "@/app/shared/ui";
import AdjustCredits from "./adjust-credits";

export const metadata = { title: "Users · Admin" };

export default async function AdminUsersPage() {
  const admin = await requireAdminPage();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      credits: true,
      emailVerifiedAt: true,
      createdAt: true,
      _count: { select: { coverLetters: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="Users"
        description={`${users.length} ${users.length === 1 ? "account" : "accounts"}, newest first.`}
      />

      <ul className="divide-y divide-[#ECECEF] overflow-hidden rounded-[10px] border border-[#E4E4E7] bg-white">
        {users.map((user) => (
          <li key={user.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                {user.name}
                {user.role === "ADMIN" && <Badge tone="brand">Admin</Badge>}
                {user.id === admin.id && <Badge tone="neutral">You</Badge>}
                {!user.emailVerifiedAt && <Badge tone="warning">Unconfirmed</Badge>}
              </p>
              <p className="mt-0.5 truncate text-[13px] text-[#71717A]">
                {user.email} · joined {formatDate(user.createdAt)}
              </p>
            </div>

            <span className="w-[84px] text-right text-[13px] text-[#52525B]">
              {user._count.coverLetters}{" "}
              {user._count.coverLetters === 1 ? "letter" : "letters"}
            </span>

            <span className="w-[76px] text-right text-sm font-medium tabular-nums">
              {user.credits} cr
            </span>

            <AdjustCredits userId={user.id} userName={user.name} />
          </li>
        ))}
      </ul>
    </>
  );
}
