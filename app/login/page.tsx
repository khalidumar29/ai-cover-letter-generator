import Link from "next/link";

import AuthForm from "../shared/auth-form";
import AuthShell from "../shared/auth-shell";
import { Alert } from "../shared/form";
import { safeNextPath } from "../shared/safe-path";

type LoginPageProps = {
  searchParams: Promise<{ next?: string; reset?: string; verified?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next, reset, verified } = await searchParams;

  return (
    <AuthShell
      title="Log in to your account"
      description="Continue working on saved cover letters and credit history."
      footer={
        <>
          New to the workspace?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[#5D4EEA] hover:text-[#6D5DFB] focus-ring rounded-md"
          >
            Create account
          </Link>
        </>
      }
    >
      {reset === "1" && (
        <div className="mt-6">
          <Alert variant="success">
            Your password has been changed. Log in with your new password.
          </Alert>
        </div>
      )}
      {verified === "1" && (
        <div className="mt-6">
          <Alert variant="success">
            Your email address is confirmed. Log in to continue.
          </Alert>
        </div>
      )}

      <AuthForm mode="login" nextPath={safeNextPath(next)} />
    </AuthShell>
  );
}
