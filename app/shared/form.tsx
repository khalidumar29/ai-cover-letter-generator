"use client";

import { AlertCircle, CheckCircle2, Loader2, type LucideIcon } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  icon: LucideIcon;
  error?: string;
  hint?: string;
  /** Rendered opposite the label, e.g. a "Forgot password?" link. */
  action?: ReactNode;
};

export function Field({
  label,
  id,
  icon: Icon,
  error,
  hint,
  action,
  ...inputProps
}: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label htmlFor={id} className="block text-sm font-medium text-[#18181B]">
          {label}
        </label>
        {action}
      </div>
      <div className="relative">
        <Icon
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
          aria-hidden="true"
        />
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={[errorId, hintId].filter(Boolean).join(" ") || undefined}
          className={`focus-ring h-10 w-full rounded-lg border bg-white pl-10 pr-3 text-sm text-[#18181B] placeholder:text-[#A1A1AA] ${
            error ? "border-[#DC2626]" : "border-[#E4E4E7]"
          }`}
          {...inputProps}
        />
      </div>
      {error ? (
        <p id={errorId} className="mt-2 text-xs leading-4 text-[#DC2626]">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="mt-2 text-xs leading-4 text-[#71717A]">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

type AlertProps = {
  variant: "error" | "success" | "info";
  children: ReactNode;
};

const alertStyles = {
  error: {
    box: "border-[#FBD5D5] bg-[#FEF2F2] text-[#B91C1C]",
    Icon: AlertCircle,
  },
  success: {
    box: "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]",
    Icon: CheckCircle2,
  },
  info: {
    box: "border-[#DDD8FF] bg-[#F1EFFE] text-[#5D4EEA]",
    Icon: AlertCircle,
  },
} as const;

export function Alert({ variant, children }: AlertProps) {
  const { box, Icon } = alertStyles[variant];

  return (
    <div
      // Errors interrupt; confirmations are announced politely.
      role={variant === "error" ? "alert" : "status"}
      className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm leading-5 ${box}`}
    >
      <Icon size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

type SubmitButtonProps = {
  pending: boolean;
  children: ReactNode;
  pendingLabel: string;
};

export function SubmitButton({ pending, children, pendingLabel }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#6D5DFB] text-sm font-semibold text-white transition hover:bg-[#5D4EEA] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
      {pending ? pendingLabel : children}
    </button>
  );
}
