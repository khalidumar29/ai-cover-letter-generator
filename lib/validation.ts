import { z } from "zod";

import type { FieldErrors } from "@/lib/http";

const email = z
  .string()
  .trim()
  .min(1, "Email address is required.")
  .email("Enter a valid email address.")
  .transform((value) => value.toLowerCase());

/**
 * Matches the hint shown under the signup password field: at least 8
 * characters mixing letters and numbers.
 */
const password = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(200, "Password must be 200 characters or fewer.")
  .regex(/[A-Za-z]/, "Password must include at least one letter.")
  .regex(/[0-9]/, "Password must include at least one number.");

const name = z
  .string()
  .trim()
  .min(2, "Enter your full name.")
  .max(80, "Name must be 80 characters or fewer.");

const token = z.string().trim().min(1, "This link is missing its token.");

export const signupSchema = z
  .object({
    name,
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const loginSchema = z.object({
  email,
  // Deliberately lax: an old account must still be able to log in if the
  // policy tightens later.
  password: z.string().min(1, "Password is required."),
});

export const emailOnlySchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    token,
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  })
  .refine((data) => data.currentPassword !== data.password, {
    path: ["password"],
    message: "Choose a password different from your current one.",
  });

export const verifyTokenSchema = z.object({ token });

/** Flattens a Zod error into the field-error shape the API returns. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fieldErrors;
}
