import Link from "next/link";
import { ArrowLeft, Check, FileText, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

const benefits = [
  "Two free credits after registration",
  "Save and edit every generated letter",
  "Export finished letters as PDF files",
];

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  showBenefits?: boolean;
};

export default function AuthShell({
  title,
  description,
  children,
  footer,
  showBenefits = false,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#18181B]">
      <div className="mx-auto grid min-h-screen max-w-[1280px] px-4 py-6 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
        <section className="hidden border-r border-[#ECECEF] py-8 pr-10 lg:flex lg:flex-col">
          <Link href="/" className="flex w-fit items-center gap-3 rounded-lg focus-ring">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E4E4E7] bg-white">
              <FileText size={18} aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold">AI Cover Letter Generator</span>
          </Link>

          <div className="flex flex-1 flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-[#DDD8FF] bg-[#F1EFFE] px-3 py-1.5 text-sm font-medium text-[#5D4EEA]">
              <Sparkles size={14} aria-hidden="true" />
              Document-first AI
            </div>
            <h2 className="max-w-[480px] text-[36px] font-bold leading-[40px]">
              Write sharper cover letters with less blank-page friction.
            </h2>
            <p className="mt-5 max-w-[500px] text-base leading-6 text-[#52525B]">
              Keep your professional details, job context, and generated draft in
              one calm workspace designed for real applications.
            </p>

            <div className="mt-8 max-w-[480px] rounded-xl border border-[#E4E4E7] bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold">Draft quality checks</p>
                <span className="rounded-full border border-[#D4D4D8] px-2.5 py-1 text-xs font-medium text-[#52525B]">
                  Ready
                </span>
              </div>
              <div className="space-y-3">
                {["Matched role keywords", "Specific achievements", "Professional tone"].map(
                  (item) => (
                    <div key={item} className="flex items-center gap-3 text-sm">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F0FDF4] text-[#16A34A]">
                        <Check size={13} aria-hidden="true" />
                      </span>
                      {item}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-[calc(100vh-48px)] items-center justify-center py-8 lg:pl-10">
          <div className="w-full max-w-[440px]">
            <Link
              href="/"
              className="mb-8 inline-flex h-10 items-center gap-2 rounded-lg px-2 text-sm font-medium text-[#52525B] transition hover:bg-[#F7F7F8] hover:text-[#18181B] focus-ring lg:hidden"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back home
            </Link>

            <div className="rounded-xl border border-[#E4E4E7] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-8">
              <div>
                <h1 className="text-[28px] font-bold leading-[34px]">{title}</h1>
                <p className="mt-2 text-sm leading-[21px] text-[#52525B]">{description}</p>
              </div>

              {children}

              {showBenefits && (
                <ul className="mt-6 space-y-2 border-t border-[#ECECEF] pt-5">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm text-[#52525B]">
                      <Check size={15} className="text-[#16A34A]" aria-hidden="true" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              )}

              {footer && <div className="mt-6 text-center text-sm text-[#52525B]">{footer}</div>}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
