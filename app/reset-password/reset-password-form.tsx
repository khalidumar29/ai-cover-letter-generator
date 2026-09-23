"use client";

import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { useState, type FormEvent } from "react";

import { fieldError, postJson, type ApiResult } from "@/app/shared/api";
import { Alert, Field, SubmitButton } from "@/app/shared/form";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setResult(null);

    const form = new FormData(event.currentTarget);
    const response = await postJson("/api/auth/reset-password", {
      token,
      password: String(form.get("password") ?? ""),
      confirmPassword: String(form.get("confirmPassword") ?? ""),
    });

    if (!response.ok) {
      setResult(response);
      setPending(false);
      return;
    }

    router.replace("/login?reset=1");
    router.refresh();
  }

  const formError = result && !result.ok && !result.fieldErrors ? result.error : null;

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
      {formError && <Alert variant="error">{formError}</Alert>}

      <Field
        id="password"
        name="password"
        type="password"
        label="New password"
        icon={LockKeyhole}
        autoComplete="new-password"
        placeholder="Create a password"
        required
        hint="Use at least 8 characters with a mix of letters and numbers."
        error={fieldError(result, "password")}
      />

      <Field
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        label="Confirm new password"
        icon={LockKeyhole}
        autoComplete="new-password"
        placeholder="Repeat password"
        required
        error={fieldError(result, "confirmPassword")}
      />

      <SubmitButton pending={pending} pendingLabel="Saving password…">
        Save new password
      </SubmitButton>
    </form>
  );
}
