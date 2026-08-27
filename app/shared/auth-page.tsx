import Link from "next/link";
import {
  ArrowLeft,
  Check,
  FileText,
  LockKeyhole,
  Mail,
  Sparkles,
  User,
} from "lucide-react";

type AuthMode = "login" | "signup";

type AuthPageProps = {
  mode: AuthMode;
};

const benefits = [
  "Two free credits after registration",
  "Save and edit every generated letter",
  "Export finished letters as PDF files",
];

export default function AuthPage({ mode }: AuthPageProps) {
  const isSignup = mode === "signup";

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
            <h1 className="max-w-[480px] text-[36px] font-bold leading-[40px]">
              Write sharper cover letters with less blank-page friction.
            </h1>
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
                <h1 className="text-[28px] font-bold leading-[34px]">
                  {isSignup ? "Create your account" : "Log in to your account"}
                </h1>
                <p className="mt-2 text-sm leading-[21px] text-[#52525B]">
                  {isSignup
                    ? "Start with free credits and save your first cover letter."
                    : "Continue working on saved cover letters and credit history."}
                </p>
              </div>

              <form className="mt-8 space-y-4">
                {isSignup && (
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium text-[#18181B]"
                    >
                      Full name
                    </label>
                    <div className="relative">
                      <User
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
                        aria-hidden="true"
                      />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        className="focus-ring h-10 w-full rounded-lg border border-[#E4E4E7] bg-white pl-10 pr-3 text-sm text-[#18181B] placeholder:text-[#A1A1AA]"
                        placeholder="Khalid Umar"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-[#18181B]"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
                      aria-hidden="true"
                    />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="focus-ring h-10 w-full rounded-lg border border-[#E4E4E7] bg-white pl-10 pr-3 text-sm text-[#18181B] placeholder:text-[#A1A1AA]"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-[#18181B]"
                    >
                      Password
                    </label>
                    {!isSignup && (
                      <Link
                        href="#"
                        className="rounded-md text-sm font-medium text-[#5D4EEA] hover:text-[#6D5DFB] focus-ring"
                      >
                        Forgot password?
                      </Link>
                    )}
                  </div>
                  <div className="relative">
                    <LockKeyhole
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
                      aria-hidden="true"
                    />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete={isSignup ? "new-password" : "current-password"}
                      className="focus-ring h-10 w-full rounded-lg border border-[#E4E4E7] bg-white pl-10 pr-3 text-sm text-[#18181B] placeholder:text-[#A1A1AA]"
                      placeholder={isSignup ? "Create a password" : "Enter your password"}
                    />
                  </div>
                  {isSignup && (
                    <p className="mt-2 text-xs leading-4 text-[#71717A]">
                      Use at least 8 characters with a mix of letters and numbers.
                    </p>
                  )}
                </div>

                {isSignup && (
                  <div>
                    <label
                      htmlFor="confirm-password"
                      className="mb-2 block text-sm font-medium text-[#18181B]"
                    >
                      Confirm password
                    </label>
                    <div className="relative">
                      <LockKeyhole
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
                        aria-hidden="true"
                      />
                      <input
                        id="confirm-password"
                        name="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        className="focus-ring h-10 w-full rounded-lg border border-[#E4E4E7] bg-white pl-10 pr-3 text-sm text-[#18181B] placeholder:text-[#A1A1AA]"
                        placeholder="Repeat password"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="focus-ring mt-2 flex h-10 w-full items-center justify-center rounded-lg bg-[#6D5DFB] text-sm font-semibold text-white transition hover:bg-[#5D4EEA]"
                >
                  {isSignup ? "Create account" : "Log in"}
                </button>
              </form>

              {isSignup && (
                <ul className="mt-6 space-y-2 border-t border-[#ECECEF] pt-5">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm text-[#52525B]">
                      <Check size={15} className="text-[#16A34A]" aria-hidden="true" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-6 text-center text-sm text-[#52525B]">
                {isSignup ? "Already have an account?" : "New to the workspace?"}{" "}
                <Link
                  href={isSignup ? "/login" : "/signup"}
                  className="font-semibold text-[#5D4EEA] hover:text-[#6D5DFB] focus-ring rounded-md"
                >
                  {isSignup ? "Log in" : "Create account"}
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
