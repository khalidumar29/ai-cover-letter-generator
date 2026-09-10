"use client";

import { LockKeyhole } from "lucide-react";
import { useState, type FormEvent } from "react";

import { fieldError, postJson, type ApiResult } from "@/app/shared/api";
import { Alert, Field, SubmitButton } from "@/app/shared/form";

export default function ChangePasswordForm() {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setResult(null);
    setSaved(false);

    const form = event.currentTarget;
    const data = new FormData(form);
    const response = await postJson("/api/auth/change-password", {
      currentPassword: String(data.get("currentPassword") ?? ""),
      password: String(data.get("password") ?? ""),
      confirmPassword: String(data.get("confirmPassword") ?? ""),
    });

    setResult(response);
    if (response.ok) {
      setSaved(true);
      // The server re-issues this device's session, so stay on the page and
      // just clear the inputs.
      form.reset();
    }
    setPending(false);
  }

  const formError = result && !result.ok && !result.fieldErrors ? result.error : null;

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {saved && (
        <Alert variant="success">
          Password updated. We emailed you a confirmation, and other devices have been
          signed out.
        </Alert>
      )}
      {formError && <Alert variant="error">{formError}</Alert>}

      <Field
        id="currentPassword"
        name="currentPassword"
        type="password"
        label="Current password"
        icon={LockKeyhole}
        autoComplete="current-password"
        placeholder="Enter your current password"
        required
        error={fieldError(result, "currentPassword")}
      />

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

      <SubmitButton pending={pending} pendingLabel="Updating password…">
        Update password
      </SubmitButton>
    </form>
  );
}
