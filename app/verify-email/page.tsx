import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import AuthShell from "../shared/auth-shell";
import VerifyEmailClient from "./verify-email-client";

type VerifyEmailPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token } = await searchParams;
  const user = await getCurrentUser();

  if (!token && user?.emailVerifiedAt) redirect("/dashboard");

  return (
    <AuthShell
      title={token ? "Confirming your email" : "Confirm your email address"}
      description={
        token
          ? "Hold on while we activate your account."
          : "One more step before you can generate cover letters."
      }
    >
      <VerifyEmailClient
        token={token}
        isAuthenticated={Boolean(user)}
        email={user?.email}
      />
    </AuthShell>
  );
}
