/**
 * Values the database stores as plain strings, because SQLite has no native
 * enum type. Everything that renders or validates one of these reads it from
 * here, so adding a tone or status is a single edit.
 */

export const TONES = [
  {
    value: "professional",
    label: "Professional",
    hint: "Measured and formal. Safe for most corporate roles.",
  },
  {
    value: "confident",
    label: "Confident",
    hint: "Direct about impact, without overstating.",
  },
  {
    value: "friendly",
    label: "Friendly",
    hint: "Warm and personable. Suits smaller teams and startups.",
  },
  {
    value: "enthusiastic",
    label: "Enthusiastic",
    hint: "Leads with motivation for the role and the company.",
  },
  {
    value: "concise",
    label: "Concise",
    hint: "Short paragraphs, no filler. Around 200 words.",
  },
] as const;

export type Tone = (typeof TONES)[number]["value"];

export const TONE_VALUES = TONES.map((tone) => tone.value);

export function toneLabel(value: string): string {
  return TONES.find((tone) => tone.value === value)?.label ?? value;
}

export const LETTER_STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "READY", label: "Ready" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "ARCHIVED", label: "Archived" },
] as const;

export type LetterStatus = (typeof LETTER_STATUSES)[number]["value"];

export const LETTER_STATUS_VALUES = LETTER_STATUSES.map((status) => status.value);

export function statusLabel(value: string): string {
  return LETTER_STATUSES.find((status) => status.value === value)?.label ?? value;
}

/**
 * Contextual edits offered on a selected passage in the editor. Rewrites are
 * refinements of a letter already paid for, so they do not cost a credit.
 */
export const REWRITE_ACTIONS = [
  { value: "rewrite", label: "Rewrite" },
  { value: "shorten", label: "Shorten" },
  { value: "expand", label: "Expand" },
  { value: "professional", label: "More professional" },
  { value: "confident", label: "More confident" },
  { value: "natural", label: "More natural" },
  { value: "specific", label: "More specific" },
] as const;

export type RewriteAction = (typeof REWRITE_ACTIONS)[number]["value"];

export const REWRITE_ACTION_VALUES = REWRITE_ACTIONS.map((action) => action.value);

export const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "CANCELLED"] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const CREDIT_REASONS = {
  SIGNUP_BONUS: "SIGNUP_BONUS",
  PURCHASE: "PURCHASE",
  GENERATION: "GENERATION",
  REFUND: "REFUND",
  ADMIN_ADJUSTMENT: "ADMIN_ADJUSTMENT",
} as const;

export type CreditReason = (typeof CREDIT_REASONS)[keyof typeof CREDIT_REASONS];

/** Every successful generation, including a regenerate, costs this much. */
export const GENERATION_COST = 1;

/** Skills and keywords are stored as one delimited string per column. */
export const LIST_SEPARATOR = "|";

export function packList(values: string[]): string {
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .join(LIST_SEPARATOR);
}

export function unpackList(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(LIST_SEPARATOR)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/** Wording for a match percentage; deliberately coarse rather than precise. */
export function matchLabel(score: number): string {
  if (score >= 80) return "Strong match";
  if (score >= 60) return "Good match";
  if (score >= 40) return "Partial match";
  return "Weak match";
}
