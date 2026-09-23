/** Shared display formatting, so amounts and dates read the same everywhere. */

export function formatMoney(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    // Whole-dollar prices read better without the trailing ".00".
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

const dayFormat = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dayTimeFormat = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatDate(value: Date): string {
  return dayFormat.format(value);
}

export function formatDateTime(value: Date): string {
  return dayTimeFormat.format(value);
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60 * 1000],
  ["month", 30 * 24 * 60 * 60 * 1000],
  ["day", 24 * 60 * 60 * 1000],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
];

const relativeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "2 days ago", for document rows where the exact minute does not matter. */
export function formatRelative(value: Date, now = Date.now()): string {
  const elapsed = value.getTime() - now;

  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(elapsed) >= size) {
      return relativeFormat.format(Math.round(elapsed / size), unit);
    }
  }
  return "just now";
}
