import { z } from "zod";

import {
  LETTER_STATUS_VALUES,
  REWRITE_ACTION_VALUES,
  TONE_VALUES,
} from "@/lib/domain";

import type { FieldErrors } from "@/lib/http";

const email = z
  .string()
  .trim()
  .min(1, "Email address is required.")
  .email("Enter a valid email address.")
  .transform((value) => value.toLowerCase());

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

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fieldErrors;
}

const jobTitle = z
  .string()
  .trim()
  .min(2, "Enter the job title.")
  .max(120, "Job title must be 120 characters or fewer.");

const company = z
  .string()
  .trim()
  .min(1, "Enter the company name.")
  .max(120, "Company name must be 120 characters or fewer.");

export const generateLetterSchema = z.object({
  jobTitle,
  company,
  jobDescription: z
    .string()
    .trim()
    .min(80, "Paste at least a paragraph of the job description.")
    .max(12000, "Job description must be 12,000 characters or fewer."),
  tone: z.enum(TONE_VALUES as [string, ...string[]], {
    message: "Choose a writing tone.",
  }),
  skills: z
    .string()
    .trim()
    .min(3, "List a few relevant skills.")
    .max(1500, "Skills must be 1,500 characters or fewer."),
  experience: z
    .string()
    .trim()
    .min(40, "Describe your experience in a sentence or two.")
    .max(6000, "Experience must be 6,000 characters or fewer."),
});

export const updateLetterSchema = z
  .object({
    jobTitle: jobTitle.optional(),
    company: company.optional(),
    content: z
      .string()
      .trim()
      .min(80, "A cover letter needs more than a line.")
      .max(20000, "Cover letter must be 20,000 characters or fewer.")
      .optional(),
    status: z
      .enum(LETTER_STATUS_VALUES as [string, ...string[]], { message: "Unknown status." })
      .optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "Nothing to update.",
  });

export const rewriteSchema = z.object({
  letterId: z.string().trim().min(1, "Unknown cover letter."),
  passage: z
    .string()
    .trim()
    .min(10, "Select a little more text to rewrite.")
    .max(4000, "Select a shorter passage."),
  action: z.enum(REWRITE_ACTION_VALUES as [string, ...string[]], {
    message: "Unknown rewrite action.",
  }),
  instruction: z
    .string()
    .trim()
    .max(300, "Keep the instruction under 300 characters.")
    .optional(),
});

export const checkoutSchema = z.object({
  packageSlug: z.string().trim().min(1, "Choose a credit package."),
});

export const packageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter a package name.")
    .max(60, "Name must be 60 characters or fewer."),
  slug: z
    .string()
    .trim()
    .min(2, "Enter a slug.")
    .max(40, "Slug must be 40 characters or fewer.")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only."),
  credits: z
    .number()
    .int("Credits must be a whole number.")
    .min(1, "A package needs at least one credit.")
    .max(10000, "That is more credits than a package should hold."),
  priceCents: z
    .number()
    .int("Price must be a whole number of cents.")
    .min(0, "Price cannot be negative.")
    .max(10_000_00, "Price must be $10,000 or less."),
  description: z
    .string()
    .trim()
    .min(3, "Describe who the package is for.")
    .max(160, "Description must be 160 characters or fewer."),
  active: z.boolean(),
  sortOrder: z.number().int().min(0).max(999),
});

export const adjustCreditsSchema = z.object({
  userId: z.string().trim().min(1, "Unknown user."),
  delta: z
    .number()
    .int("Enter a whole number of credits.")
    .refine((value) => value !== 0, "Enter a non-zero adjustment.")
    .refine((value) => Math.abs(value) <= 1000, "Adjust by 1,000 credits or fewer."),
  description: z
    .string()
    .trim()
    .min(3, "Record a reason for the adjustment.")
    .max(160, "Reason must be 160 characters or fewer."),
});
