"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail, User } from "lucide-react";
import { useState, type FormEvent } from "react";

import { fieldError, postJson, type ApiResult } from "@/app/shared/api";
import { Alert, Field, SubmitButton } from "@/app/shared/form";

type AuthFormProps = {
  mode: "login" | "signup";
  /** Path to return to after login, supplied by middleware via ?next=. */
  nextPath?: string;
};

export default function AuthForm({ mode, nextPath }: AuthFormProps) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setResult(null);

    const form = new FormData(event.currentTarget);
    const payload = isSignup
      ? {
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          password: String(form.get("password") ?? ""),
          confirmPassword: String(form.get("confirmPassword") ?? ""),
        }
      : {
          email: String(form.get("email") ?? ""),
          password: String(form.get("password") ?? ""),
        };

    const response = await postJson(
      isSignup ? "/api/auth/signup" : "/api/auth/login",
      payload,
    );

    if (!response.ok) {
      setResult(response);
      setPending(false);
      return;
    }

    // Unverified accounts go to the notice page, which can resend the email.
    const verified = response.emailVerified === true;
    const destination = isSignup || !verified ? "/verify-email" : nextPath || "/dashboard";

    // refresh() lets server components pick up the new session cookie.
    router.replace(destination);
    router.refresh();
  }

  const formError = result && !result.ok && !result.fieldErrors ? result.error : null;

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
      {formError && <Alert variant="error">{formError}</Alert>}

      {isSignup && (
        <Field
          id="name"
          name="name"
          type="text"
          label="Full name"
          icon={User}
          autoComplete="name"
          placeholder="Khalid Umar"
          required
          error={fieldError(result, "name")}
        />
      )}

      <Field
        id="email"
        name="email"
        type="email"
        label="Email address"
        icon={Mail}
        autoComplete="email"
        placeholder="you@example.com"
        required
        error={fieldError(result, "email")}
      />

      <Field
        id="password"
        name="password"
        type="password"
        label="Password"
        icon={LockKeyhole}
        autoComplete={isSignup ? "new-password" : "current-password"}
        placeholder={isSignup ? "Create a password" : "Enter your password"}
        required
        hint={
          isSignup ? "Use at least 8 characters with a mix of letters and numbers." : undefined
        }
        error={fieldError(result, "password")}
        action={
          !isSignup && (
            <Link
              href="/forgot-password"
              className="rounded-md text-sm font-medium text-[#5D4EEA] hover:text-[#6D5DFB] focus-ring"
            >
              Forgot password?
            </Link>
          )
        }
      />

      {isSignup && (
        <Field
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm password"
          icon={LockKeyhole}
          autoComplete="new-password"
          placeholder="Repeat password"
          required
          error={fieldError(result, "confirmPassword")}
        />
      )}

      <SubmitButton pending={pending} pendingLabel={isSignup ? "Creating account…" : "Logging in…"}>
        {isSignup ? "Create account" : "Log in"}
      </SubmitButton>
    </form>
  );
}
