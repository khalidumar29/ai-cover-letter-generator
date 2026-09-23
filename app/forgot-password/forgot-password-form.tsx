"use client";

import { Mail } from "lucide-react";
import { useState, type FormEvent } from "react";

import { fieldError, postJson, type ApiResult } from "@/app/shared/api";
import { Alert, Field, SubmitButton } from "@/app/shared/form";

export default function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setResult(null);

    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    const response = await postJson("/api/auth/forgot-password", { email });

    setResult(response);
    if (response.ok) setSentTo(email);
    setPending(false);
  }

  if (sentTo) {
    return (
      <div className="mt-8 space-y-4">
        <Alert variant="success">
          If an account exists for <strong>{sentTo}</strong>, a password reset link is on
          its way. The link expires in one hour.
        </Alert>
        <p className="text-sm leading-5 text-[#52525B]">
          Nothing in your inbox after a few minutes? Check the spam folder, or{" "}
          <button
            type="button"
            onClick={() => {
              setSentTo(null);
              setResult(null);
            }}
            className="rounded-md font-medium text-[#5D4EEA] hover:text-[#6D5DFB] focus-ring"
          >
            try a different address
          </button>
          .
        </p>
      </div>
    );
  }

  const formError = result && !result.ok && !result.fieldErrors ? result.error : null;

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
      {formError && <Alert variant="error">{formError}</Alert>}

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

      <SubmitButton pending={pending} pendingLabel="Sending link…">
        Send reset link
      </SubmitButton>
    </form>
  );
}
