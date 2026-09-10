import Link from "next/link";

import AuthShell from "../shared/auth-shell";
import { Alert } from "../shared/form";
import ResetPasswordForm from "./reset-password-form";

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <AuthShell
      title="Choose a new password"
      description="Set a new password for your account. You'll be signed out on every device."
      footer={
        <Link
          href="/login"
          className="font-semibold text-[#5D4EEA] hover:text-[#6D5DFB] focus-ring rounded-md"
        >
          Back to log in
        </Link>
      }
    >
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        // The token is only ever delivered by email, so a bare visit to this
        // page has nothing to act on.
        <div className="mt-8 space-y-4">
          <Alert variant="error">
            This page needs a reset link. Request a new one to continue.
          </Alert>
          <Link
            href="/forgot-password"
            className="focus-ring flex h-10 w-full items-center justify-center rounded-lg bg-[#6D5DFB] text-sm font-semibold text-white transition hover:bg-[#5D4EEA]"
          >
            Request a reset link
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
