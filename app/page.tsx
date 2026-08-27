import Link from "next/link";
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  FileText,
  LayoutDashboard,
  PenLine,
  Sparkles,
} from "lucide-react";

const features = [
  "Resume and job description inputs",
  "Tone and emphasis controls",
  "Editable document workspace",
  "Saved letters and PDF export",
];

const workflow = [
  {
    title: "Add context",
    description:
      "Capture profile details, role information, and the job description in a focused form.",
  },
  {
    title: "Generate a draft",
    description:
      "Create a tailored cover letter while keeping the document visible and editable.",
  },
  {
    title: "Refine and export",
    description:
      "Adjust tone, improve paragraphs, copy the result, or download a clean PDF.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#18181B]">
      <header className="sticky top-0 z-20 border-b border-[#ECECEF] bg-[#FAFAFA]/95 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-3 focus-ring rounded-lg">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E4E4E7] bg-white">
              <FileText size={18} aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold">AI Cover Letter Generator</span>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <a
              href="#workflow"
              className="rounded-lg px-3 py-2 text-sm text-[#52525B] transition hover:bg-[#F7F7F8] hover:text-[#18181B] focus-ring"
            >
              Workflow
            </a>
            <a
              href="#features"
              className="rounded-lg px-3 py-2 text-sm text-[#52525B] transition hover:bg-[#F7F7F8] hover:text-[#18181B] focus-ring"
            >
              Features
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden h-10 items-center rounded-lg border border-[#E4E4E7] bg-white px-4 text-sm font-medium text-[#18181B] transition hover:border-[#D4D4D8] hover:bg-[#F7F7F8] focus-ring sm:flex"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#6D5DFB] px-4 text-sm font-semibold text-white transition hover:bg-[#5D4EEA] focus-ring"
            >
              Create account
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </nav>
      </header>

      <section className="border-b border-[#ECECEF]">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-24">
          <div className="flex max-w-[620px] flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-[#DDD8FF] bg-[#F1EFFE] px-3 py-1.5 text-sm font-medium text-[#5D4EEA]">
              <Sparkles size={14} aria-hidden="true" />
              Professional writing workspace
            </div>
            <h1 className="max-w-[580px] text-[36px] font-bold leading-[40px] tracking-normal sm:text-[40px] sm:leading-[46px]">
              AI Cover Letter Generator
            </h1>
            <p className="mt-5 max-w-[560px] text-base leading-6 text-[#52525B]">
              Create tailored cover letters from your professional background and
              a target job description, then edit the result like a real
              document.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#6D5DFB] px-5 text-sm font-semibold text-white transition hover:bg-[#5D4EEA] focus-ring"
              >
                Start writing
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-[#E4E4E7] bg-white px-5 text-sm font-medium transition hover:border-[#D4D4D8] hover:bg-[#F7F7F8] focus-ring"
              >
                Open workspace
              </Link>
            </div>

            <ul className="mt-8 grid gap-3 text-sm text-[#52525B] sm:grid-cols-2">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F1EFFE] text-[#6D5DFB]">
                    <Check size={13} aria-hidden="true" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0 rounded-xl border border-[#E4E4E7] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex h-14 items-center justify-between border-b border-[#ECECEF] px-4 sm:px-5">
              <div className="flex items-center gap-2 text-sm font-medium">
                <LayoutDashboard size={16} aria-hidden="true" />
                Workspace
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E4E4E7] bg-white text-[#52525B] transition hover:bg-[#F7F7F8] focus-ring"
                  aria-label="Copy cover letter"
                >
                  <Copy size={16} aria-hidden="true" />
                </button>
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E4E4E7] bg-white text-[#52525B] transition hover:bg-[#F7F7F8] focus-ring"
                  aria-label="Download cover letter"
                >
                  <Download size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[240px_1fr]">
              <aside className="hidden border-r border-[#ECECEF] bg-[#FAFAFA] p-4 lg:block">
                <button className="mb-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#6D5DFB] text-sm font-semibold text-white transition hover:bg-[#5D4EEA] focus-ring">
                  <Sparkles size={16} aria-hidden="true" />
                  New cover letter
                </button>
                <div className="space-y-1">
                  {["Dashboard", "Saved letters", "Credits"].map((item, index) => (
                    <div
                      key={item}
                      className={`flex h-9 items-center rounded-lg px-3 text-sm ${
                        index === 0
                          ? "bg-[#F1EFFE] font-medium text-[#5D4EEA]"
                          : "text-[#71717A]"
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </aside>

              <div className="min-w-0 bg-[#F7F7F8] p-4 sm:p-6">
                <div className="mx-auto max-w-[760px] rounded-xl border border-[#E4E4E7] bg-white p-6 sm:p-8">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[#18181B]">
                        Product designer cover letter
                      </p>
                      <p className="mt-1 text-xs leading-4 text-[#71717A]">
                        Ready · Updated just now
                      </p>
                    </div>
                    <span className="rounded-full border border-[#DDD8FF] bg-[#F1EFFE] px-2.5 py-1 text-xs font-medium text-[#5D4EEA]">
                      Strong match · 84%
                    </span>
                  </div>

                  <div className="space-y-4 text-[15px] leading-7 text-[#18181B]">
                    <p>Dear hiring team,</p>
                    <p>
                      I am excited to apply for the product designer role at
                      Northstar Labs. My work has focused on turning complex
                      workflows into clear, usable interfaces for fast-moving
                      teams.
                    </p>
                    <p>
                      In my recent projects, I led research, prototyping, and
                      handoff for document-heavy tools where precision and speed
                      mattered. That experience aligns closely with your need
                      for a designer who can simplify collaboration without
                      losing depth.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2 border-t border-[#ECECEF] pt-5">
                    {["Rewrite", "Shorten", "More professional"].map((action) => (
                      <button
                        key={action}
                        className="inline-flex h-8 items-center gap-2 rounded-lg border border-[#E4E4E7] bg-white px-3 text-sm font-medium text-[#52525B] transition hover:border-[#D4D4D8] hover:bg-[#F7F7F8] focus-ring"
                      >
                        {action === "Rewrite" && (
                          <PenLine size={14} aria-hidden="true" />
                        )}
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-10">
        <div className="max-w-[680px]">
          <h2 className="text-xl font-semibold leading-7">
            A focused workflow from blank page to finished PDF.
          </h2>
          <p className="mt-3 text-sm leading-[21px] text-[#52525B]">
            The product centers the resume, job description, and letter itself,
            with AI actions placed where they help the writing process.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {workflow.map((item, index) => (
            <article
              key={item.title}
              className="rounded-[10px] border border-[#E4E4E7] bg-white p-5"
            >
              <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg border border-[#E4E4E7] bg-[#F7F7F8] text-sm font-semibold">
                {index + 1}
              </div>
              <h3 className="text-base font-semibold leading-6">{item.title}</h3>
              <p className="mt-2 text-sm leading-[21px] text-[#52525B]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="features" className="border-t border-[#ECECEF] bg-white">
        <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
          <div>
            <h2 className="text-xl font-semibold leading-7">
              Built for serious job applications.
            </h2>
            <p className="mt-3 text-sm leading-[21px] text-[#52525B]">
              Keep the interface quiet and useful while supporting the full
              academic project scope: auth, credits, AI generation, and exports.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Secure account access",
              "Free credits after registration",
              "Saved cover letter history",
              "Payment-ready credit packages",
              "Contextual AI editing actions",
              "Administrator-ready structure",
            ].map((item) => (
              <div
                key={item}
                className="flex min-h-12 items-center gap-3 rounded-[10px] border border-[#E4E4E7] bg-[#FAFAFA] px-4 py-3 text-sm font-medium"
              >
                <Check size={16} className="text-[#16A34A]" aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
