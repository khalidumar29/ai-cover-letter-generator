import Link from "next/link";
import { Loader2, type LucideIcon } from "lucide-react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-[#6D5DFB] text-white hover:bg-[#5D4EEA] border border-transparent",
  secondary: "bg-white text-[#18181B] border border-[#E4E4E7] hover:border-[#D4D4D8] hover:bg-[#F7F7F8]",
  ghost: "bg-transparent text-[#52525B] border border-transparent hover:bg-[#F7F7F8] hover:text-[#18181B]",
  danger: "bg-white text-[#DC2626] border border-[#E4E4E7] hover:border-[#FBD5D5] hover:bg-[#FEF2F2]",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
};

const BASE =
  "focus-ring inline-flex items-center justify-center rounded-lg font-medium transition duration-[120ms] disabled:cursor-not-allowed disabled:opacity-55";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  loading?: boolean;
};

export function Button({
  variant = "secondary",
  size = "md",
  icon: Icon,
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const iconSize = size === "sm" ? 14 : 16;

  return (
    <button
      disabled={disabled || loading}
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={iconSize} className="animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon size={iconSize} aria-hidden="true" />
      )}
      {children}
    </button>
  );
}

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
};

export function ButtonLink({
  href,
  variant = "secondary",
  size = "md",
  icon: Icon,
  children,
  className = "",
}: ButtonLinkProps) {
  return (
    <Link href={href} className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}>
      {Icon && <Icon size={size === "sm" ? 14 : 16} aria-hidden="true" />}
      {children}
    </Link>
  );
}

export function Card({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={`rounded-[10px] border border-[#E4E4E7] bg-white ${padded ? "p-6" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

const BADGE_TONES = {
  neutral: "border-[#E4E4E7] bg-[#F7F7F8] text-[#52525B]",
  brand: "border-[#DDD8FF] bg-[#F1EFFE] text-[#5D4EEA]",
  success: "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]",
  warning: "border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]",
  error: "border-[#FBD5D5] bg-[#FEF2F2] text-[#B91C1C]",
  info: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
} as const;

export type BadgeTone = keyof typeof BADGE_TONES;

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-4 ${BADGE_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[28px] font-bold leading-[34px] tracking-[-0.01em]">{title}</h1>
        {description && (
          <p className="mt-2 max-w-[70ch] text-sm leading-[21px] text-[#52525B]">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-[10px] border border-dashed border-[#D4D4D8] bg-white px-6 py-14 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E4E4E7] text-[#71717A]">
        <Icon size={18} aria-hidden="true" />
      </span>
      <p className="mt-4 text-base font-semibold">{title}</p>
      <p className="mt-1.5 max-w-[46ch] text-sm leading-[21px] text-[#52525B]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  id: string;
  hint?: string;
  error?: string;
  counter?: string;
};

export function Textarea({
  label,
  id,
  hint,
  error,
  counter,
  className = "",
  ...props
}: TextareaProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label htmlFor={id} className="block text-sm font-medium text-[#18181B]">
          {label}
        </label>
        {counter && <span className="text-xs tabular-nums text-[#A1A1AA]">{counter}</span>}
      </div>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={[errorId, hintId].filter(Boolean).join(" ") || undefined}
        {...props}
        className={`focus-ring min-h-[120px] w-full rounded-lg border bg-white px-3 py-2.5 text-sm leading-[21px] text-[#18181B] placeholder:text-[#A1A1AA] ${
          error ? "border-[#DC2626]" : "border-[#E4E4E7]"
        } ${className}`}
      />
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

export function TextInput({
  label,
  id,
  hint,
  error,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  hint?: string;
  error?: string;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-[#18181B]">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={[errorId, hintId].filter(Boolean).join(" ") || undefined}
        {...props}
        className={`focus-ring h-10 w-full rounded-lg border bg-white px-3 text-sm text-[#18181B] placeholder:text-[#A1A1AA] ${
          error ? "border-[#DC2626]" : "border-[#E4E4E7]"
        } ${className}`}
      />
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

export function ChipGroup<T extends string>({
  name,
  options,
  value,
  onChange,
  describe,
}: {
  name: string;
  options: readonly { value: T; label: string; hint?: string }[];
  value: T;
  onChange: (value: T) => void;
  describe?: boolean;
}) {
  const selected = options.find((option) => option.value === value);

  return (
    <div>
      <div role="radiogroup" aria-label={name} className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={`focus-ring h-8 rounded-full border px-3.5 text-[13px] font-medium transition duration-[120ms] ${
                active
                  ? "border-[#DDD8FF] bg-[#F1EFFE] text-[#5D4EEA]"
                  : "border-[#E4E4E7] bg-white text-[#52525B] hover:border-[#D4D4D8] hover:bg-[#F7F7F8]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {describe && selected?.hint && (
        <p className="mt-2 text-xs leading-4 text-[#71717A]">{selected.hint}</p>
      )}
    </div>
  );
}

export function MatchBar({ score }: { score: number }) {
  const tone = score >= 80 ? "#16A34A" : score >= 60 ? "#6D5DFB" : score >= 40 ? "#D97706" : "#71717A";

  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-[#ECECEF]"
      role="img"
      aria-label={`Match score ${score} out of 100`}
    >
      <div
        className="h-full rounded-full transition-[width] duration-[250ms] ease-out"
        style={{ width: `${Math.max(score, 2)}%`, background: tone }}
      />
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-[#ECECEF] ${className}`} />;
}
