import Link from "next/link";
import { BadgeCheck, KeyRound, Sparkles } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/session";

const dateFormat = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function DashboardPage() {
  // The layout has already redirected anyone who is not signed in and verified.
  const user = (await getCurrentUser())!;

  return (
    <div className="max-w-[760px]">
      <h1 className="text-[28px] font-bold leading-[34px]">
        Welcome back, {user.name.split(" ")[0]}.
      </h1>
      <p className="mt-2 text-sm leading-[21px] text-[#52525B]">
        Your account is active. Cover letter generation arrives in the next milestone.
      </p>

      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E4E4E7] bg-white p-5">
          <dt className="text-sm text-[#52525B]">Credits</dt>
          <dd className="mt-1.5 flex items-center gap-2 text-[22px] font-semibold">
            <Sparkles size={17} className="text-[#6D5DFB]" aria-hidden="true" />
            {user.credits}
          </dd>
        </div>
        <div className="rounded-xl border border-[#E4E4E7] bg-white p-5">
          <dt className="text-sm text-[#52525B]">Email</dt>
          <dd className="mt-1.5 flex items-center gap-2 text-sm font-medium text-[#16A34A]">
            <BadgeCheck size={16} aria-hidden="true" />
            Confirmed
          </dd>
          <p className="mt-1 truncate text-xs text-[#71717A]" title={user.email}>
            {user.email}
          </p>
        </div>
        <div className="rounded-xl border border-[#E4E4E7] bg-white p-5">
          <dt className="text-sm text-[#52525B]">Member since</dt>
          <dd className="mt-1.5 text-sm font-medium">{dateFormat.format(user.createdAt)}</dd>
        </div>
      </dl>

      <div className="mt-6 flex items-start gap-4 rounded-xl border border-[#E4E4E7] bg-white p-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E4E4E7]">
          <KeyRound size={16} aria-hidden="true" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold">Account security</p>
          <p className="mt-1 text-sm leading-5 text-[#52525B]">
            Changing your password signs you out on every other device.
          </p>
        </div>
        <Link
          href="/account/password"
          className="focus-ring flex h-9 shrink-0 items-center rounded-lg border border-[#E4E4E7] px-3.5 text-sm font-medium transition hover:bg-[#F7F7F8]"
        >
          Change password
        </Link>
      </div>
    </div>
  );
}
