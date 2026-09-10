"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MailCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { postJson } from "@/app/shared/api";
import { Alert } from "@/app/shared/form";

type VerifyEmailClientProps = {
  token?: string;
  isAuthenticated: boolean;
  email?: string;
};

type Status =
  | { kind: "checking" }
  | { kind: "verified" }
  | { kind: "failed"; message: string };

export default function VerifyEmailClient({
  token,
  isAuthenticated,
  email,
}: VerifyEmailClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState<Status | null>(token ? { kind: "checking" } : null);
  const [resendState, setResendState] = useState<
    { kind: "idle" | "sending" } | { kind: "done" | "error"; message: string }
  >({ kind: "idle" });

  // React 18+ development mode mounts effects twice; the token is single-use,
  // so guard against the second call consuming it.
  const submitted = useRef(false);

  useEffect(() => {
    if (!token || submitted.current) return;
    submitted.current = true;

    void (async () => {
      const response = await postJson("/api/auth/verify-email", { token });

      if (response.ok) {
        setStatus({ kind: "verified" });
        // Let the protected layout see the newly verified account.
        router.refresh();
      } else {
        setStatus({ kind: "failed", message: response.error });
      }
    })();
  }, [token, router]);

  async function handleResend() {
    setResendState({ kind: "sending" });
    const response = await postJson("/api/auth/resend-verification", email ? { email } : {});

    setResendState(
      response.ok
        ? {
            kind: "done",
            message: "A new confirmation link is on its way. It expires in 24 hours.",
          }
        : { kind: "error", message: response.error },
    );
  }

  if (status?.kind === "checking") {
    return (
      <div className="mt-8 flex items-center gap-3 text-sm text-[#52525B]">
        <Loader2 size={16} className="animate-spin text-[#6D5DFB]" aria-hidden="true" />
        Confirming your email address…
      </div>
    );
  }

  if (status?.kind === "verified") {
    return (
      <div className="mt-8 space-y-4">
        <Alert variant="success">
          Your email address is confirmed. Your two free credits are ready to use.
        </Alert>
        <Link
          href={isAuthenticated ? "/dashboard" : "/login?verified=1"}
          className="focus-ring flex h-10 w-full items-center justify-center rounded-lg bg-[#6D5DFB] text-sm font-semibold text-white transition hover:bg-[#5D4EEA]"
        >
          {isAuthenticated ? "Go to dashboard" : "Log in to continue"}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {status?.kind === "failed" ? (
        <Alert variant="error">{status.message}</Alert>
      ) : (
        <div className="flex items-start gap-3 rounded-lg border border-[#E4E4E7] bg-[#F7F7F8] px-3.5 py-3">
          <MailCheck size={16} className="mt-0.5 shrink-0 text-[#6D5DFB]" aria-hidden="true" />
          <p className="text-sm leading-5 text-[#52525B]">
            {email ? (
              <>
                We sent a confirmation link to <strong className="text-[#18181B]">{email}</strong>.
                Open it to activate your account.
              </>
            ) : (
              "Open the confirmation link we emailed you to activate your account."
            )}
          </p>
        </div>
      )}

      {resendState.kind === "done" && <Alert variant="success">{resendState.message}</Alert>}
      {resendState.kind === "error" && <Alert variant="error">{resendState.message}</Alert>}

      {/* Resending needs a session or a known address; otherwise send them to
          log in first, which re-establishes both. */}
      {email ? (
        <button
          type="button"
          onClick={handleResend}
          disabled={resendState.kind === "sending"}
          className="focus-ring flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#E4E4E7] bg-white text-sm font-semibold text-[#18181B] transition hover:bg-[#F7F7F8] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resendState.kind === "sending" && (
            <Loader2 size={15} className="animate-spin" aria-hidden="true" />
          )}
          {resendState.kind === "sending" ? "Sending…" : "Resend confirmation email"}
        </button>
      ) : (
        <Link
          href="/login"
          className="focus-ring flex h-10 w-full items-center justify-center rounded-lg bg-[#6D5DFB] text-sm font-semibold text-white transition hover:bg-[#5D4EEA]"
        >
          Log in to resend
        </Link>
      )}
    </div>
  );
}
