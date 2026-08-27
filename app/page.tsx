import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  CreditCard,
  Download,
  FileDown,
  FileText,
  LayoutDashboard,
  Lock,
  Mail,
  PenLine,
  Quote,
  RefreshCw,
  Save,
  Shield,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const stats = [
  { label: "Cover letters generated", value: "120k+" },
  { label: "Average time to first draft", value: "45s" },
  { label: "Interview-ready score", value: "94%" },
  { label: "Free credits on signup", value: "2" },
];

const features = [
  {
    icon: Target,
    title: "Tailored to the role",
    description:
      "Paste the job description and your background is matched against it, so every letter speaks to what the hiring team is looking for.",
  },
  {
    icon: PenLine,
    title: "Editable like a document",
    description:
      "The result is a real letter you can rewrite, shorten, or reword inline — not a chat message locked in a bubble.",
  },
  {
    icon: Shield,
    title: "Secure account access",
    description:
      "Hashed passwords and protected routes keep your letters and account private, with separate user and admin roles.",
  },
  {
    icon: Zap,
    title: "Fast, focused workflow",
    description:
      "Move from resume to a finished draft in one calm workspace, designed for the speed of an active job search.",
  },
  {
    icon: CreditCard,
    title: "Credit-based generation",
    description:
      "Get free credits when you register, then top up with simple credit packages when you need more generations.",
  },
  {
    icon: FileDown,
    title: "Copy or export as PDF",
    description:
      "Send a clean PDF or copy the text straight into any application. Your letters stay saved for future reference.",
  },
];

const steps = [
  {
    number: "01",
    title: "Add your context",
    description:
      "Enter your professional details and paste the job description. The workspace keeps everything in one focused form.",
  },
  {
    number: "02",
    title: "Generate a draft",
    description:
      "The AI writes a tailored cover letter around your experience while the document stays visible and editable.",
  },
  {
    number: "03",
    title: "Refine and export",
    description:
      "Adjust tone, rewrite paragraphs, copy the result, or download a clean PDF — all in the same place.",
  },
];

const aiActions = [
  "Rewrite",
  "Shorten",
  "More professional",
  "More confident",
  "Ask AI",
];

const testimonials = [
  {
    quote:
      "It cut my cover letters from an hour to a few minutes. I'd tweak a paragraph, export, and move on to the next application.",
    name: "Ayesha Rahman",
    role: "Product designer",
  },
  {
    quote:
      "The letters actually matched the job descriptions. It felt like having an editor who already read the posting.",
    name: "Daniel Chen",
    role: "Frontend engineer",
  },
  {
    quote:
      "I appreciated that it felt like a writing tool, not a chatbot. I could edit the document directly and it stayed professional.",
    name: "Priya Sharma",
    role: "Graduate, MSc Computer Science",
  },
];

const pricing = [
  {
    name: "Free",
    credits: "2 credits",
    price: "You get 2 credits on registration.",
    features: [
      "2 free generation credits",
      "Save and edit letters",
      "Export as PDF",
      "Standard quality (academic)",
    ],
    highlighted: false,
    cta: "Create free account",
  },
  {
    name: "Basic",
    credits: "10 credits",
    price: "For occasional use during a job search.",
    features: [
      "10 generation credits",
      "Save and edit letters",
      "Export as PDF",
      "Priority support",
    ],
    highlighted: true,
    cta: "Buy Basic",
  },
  {
    name: "Standard",
    credits: "25 credits",
    price: "For active job seekers who apply often.",
    features: [
      "25 generation credits",
      "Save and edit letters",
      "Export as PDF",
      "Priority support",
    ],
    highlighted: false,
    cta: "Buy Standard",
  },
];

const faqs = [
  {
    question: "How do the free credits work?",
    answer:
      "You receive 2 free credits when you create an account. Each successful cover letter generation uses one credit.",
  },
  {
    question: "Can I edit the generated letter?",
    answer:
      "Yes. The letter is a real editable document, so you can rewrite paragraphs, change tone, or add your own details inline before exporting.",
  },
  {
    question: "How do I get more credits?",
    answer:
      "You can purchase credit packages once you run out. Payments go through a sandbox payment gateway and credits are added only after the payment is verified.",
  },
  {
    question: "What happens to my saved letters?",
    answer:
      "Your generated letters are saved to your account so you can revisit, edit, or export them any time.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Passwords are stored securely using hashing, and private routes require authentication. User and administrator permissions are kept separate.",
  },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 rounded-lg focus-ring">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E4E4E7] bg-white">
        <FileText size={18} className="text-[#18181B]" aria-hidden="true" />
      </span>
      <span className="text-sm font-semibold text-[#18181B]">
        AI Cover Letter
      </span>
    </Link>
  );
}

function HeroPreview() {
  return (
    <div className="rounded-xl border border-[#E4E4E7] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {/* Browser chrome */}
      <div className="flex h-11 items-center gap-3 border-b border-[#ECECEF] px-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#E4E4E7]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E4E4E7]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E4E4E7]" />
        </div>
        <div className="flex h-7 flex-1 items-center justify-center rounded-md border border-[#ECECEF] bg-[#FAFAFA] text-xs text-[#A1A1AA]">
          coverletter.app/workspace
        </div>
      </div>

      {/* Workspace */}
      <div className="grid lg:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <aside className="hidden border-r border-[#ECECEF] bg-[#FAFAFA] p-3 lg:block">
          <button className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#6D5DFB] text-sm font-semibold text-white transition hover:bg-[#5D4EEA]">
            <Sparkles size={15} aria-hidden="true" />
            New cover letter
          </button>
          <div className="mt-3 space-y-1">
            {[
              { label: "Dashboard", icon: LayoutDashboard },
              { label: "Saved letters", icon: FileText },
              { label: "Credits", icon: CreditCard },
            ].map((item, index) => (
              <div
                key={item.label}
                className={`flex h-8 items-center gap-2 rounded-lg px-3 text-sm ${
                  index === 0
                    ? "bg-[#F1EFFE] font-medium text-[#5D4EEA]"
                    : "text-[#71717A]"
                }`}
              >
                <item.icon size={15} className="shrink-0" aria-hidden="true" />
                {item.label}
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-[#E4E4E7] bg-white p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#71717A]">Credits</span>
              <span className="text-sm font-semibold">2</span>
            </div>
          </div>
        </aside>

        {/* Canvas */}
        <div className="min-w-0 bg-[#F7F7F8] p-4 sm:p-6">
          <div className="mx-auto max-w-[680px] rounded-lg border border-[#E4E4E7] bg-white p-6 sm:p-8">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#18181B]">
                  Product designer cover letter
                </p>
                <p className="mt-1 text-xs text-[#71717A]">
                  Ready · Updated just now
                </p>
              </div>
              <span className="rounded-full border border-[#DDD8FF] bg-[#F1EFFE] px-2.5 py-1 text-xs font-medium text-[#5D4EEA]">
                Strong match · 84%
              </span>
            </div>

            <div className="space-y-3.5 text-sm leading-6 text-[#18181B]">
              <p>Dear hiring team,</p>
              <p>
                I am excited to apply for the product designer role at Northstar
                Labs. My work has focused on turning complex workflows into
                clear, usable interfaces for fast-moving teams.
              </p>
              <p>
                Through research, prototyping, and handoff for document-heavy
                tools, I have learned to simplify collaboration without losing
                depth — the kind of experience your team is looking for.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#ECECEF] pt-4">
              <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-medium text-[#71717A]">
                <Sparkles size={13} className="text-[#6D5DFB]" aria-hidden="true" />
                Ask AI
              </span>
              {["Rewrite", "Shorten", "More professional"].map((action) => (
                <button
                  key={action}
                  className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[#E4E4E7] bg-white px-2.5 text-xs font-medium text-[#52525B] transition hover:border-[#D4D4D8] hover:bg-[#F7F7F8]"
                >
                  {action === "Rewrite" && (
                    <PenLine size={11} aria-hidden="true" />
                  )}
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="bg-[#FAFAFA] text-[#18181B]">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-[#ECECEF] bg-[#FAFAFA]/95 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <Logo />
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm text-[#52525B] transition hover:bg-[#F7F7F8] hover:text-[#18181B] focus-ring"
              >
                {link.label}
              </a>
            ))}
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
              Sign up
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="border-b border-[#ECECEF]">
        <div className="mx-auto max-w-[1280px] px-4 pb-16 pt-16 sm:px-6 sm:pt-20 lg:px-10 lg:pb-20 lg:pt-24">
          <div className="mx-auto flex max-w-[760px] flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#DDD8FF] bg-[#F1EFFE] px-3 py-1.5 text-sm font-medium text-[#5D4EEA]">
              <Sparkles size={14} aria-hidden="true" />
              A professional writing workspace
            </span>
            <h1 className="mt-6 max-w-[680px] text-[36px] font-bold leading-[42px] tracking-tight sm:text-[48px] sm:leading-[54px]">
              Cover letters that speak your experience.
            </h1>
            <p className="mt-5 max-w-[560px] text-base leading-7 text-[#52525B]">
              Turn your resume and a job description into a tailored, editable
              cover letter in minutes — with AI that supports the writing, not
              replaces it.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#6D5DFB] px-6 text-sm font-semibold text-white transition hover:bg-[#5D4EEA] focus-ring"
              >
                Get started — it's free
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#E4E4E7] bg-white px-6 text-sm font-medium text-[#18181B] transition hover:border-[#D4D4D8] hover:bg-[#F7F7F8] focus-ring"
              >
                See how it works
              </a>
            </div>
          </div>

          <div className="mt-14">
            <HeroPreview />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-[#ECECEF] bg-white">
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-8 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-10">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-[28px] font-bold leading-8 text-[#18181B]">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-[#71717A]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
        <div className="max-w-[680px]">
          <h2 className="text-[28px] font-bold leading-[34px]">
            Everything you need to apply with confidence.
          </h2>
          <p className="mt-4 text-base leading-7 text-[#52525B]">
            The product centers the resume, job description, and the letter
            itself, with AI actions placed exactly where they help the writing
            process.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-[10px] border border-[#E4E4E7] bg-white p-5 transition hover:border-[#D4D4D8]"
            >
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-[#E4E4E7] bg-[#F7F7F8]">
                <feature.icon size={18} className="text-[#18181B]" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold leading-6">{feature.title}</h3>
              <p className="mt-2 text-sm leading-[21px] text-[#52525B]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y border-[#ECECEF] bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
          <div className="max-w-[680px]">
            <h2 className="text-[28px] font-bold leading-[34px]">
              A focused workflow from blank page to finished PDF.
            </h2>
            <p className="mt-4 text-base leading-7 text-[#52525B]">
              Three steps, no clutter. Everything stays within reach so you can
              generate several letters during a busy job search.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-[10px] border border-[#E4E4E7] bg-[#FAFAFA] p-6"
              >
                <p className="text-sm font-semibold text-[#6D5DFB]">{step.number}</p>
                <h3 className="mt-3 text-base font-semibold leading-6">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-[21px] text-[#52525B]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product showcase / AI actions */}
      <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#DDD8FF] bg-[#F1EFFE] px-3 py-1.5 text-sm font-medium text-[#5D4EEA]">
              <Sparkles size={14} aria-hidden="true" />
              Contextual AI editing
            </span>
            <h2 className="mt-5 text-[28px] font-bold leading-[34px]">
              AI works where you type, not in a separate tab.
            </h2>
            <p className="mt-4 text-base leading-7 text-[#52525B]">
              Select a paragraph and the tools you need appear right there.
              Rewrite, shorten, or change the tone without losing your place —
              and keep the document visible the entire time.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {aiActions.map((action) => (
                <span
                  key={action}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#E4E4E7] bg-white px-3 text-sm font-medium text-[#52525B]"
                >
                  {action === "Ask AI" && (
                    <Sparkles size={14} className="text-[#6D5DFB]" aria-hidden="true" />
                  )}
                  {action}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="rounded-xl border border-[#E4E4E7] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex h-12 items-center justify-between border-b border-[#ECECEF] px-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <LayoutDashboard size={16} className="text-[#71717A]" aria-hidden="true" />
                  Workspace
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E4E4E7] bg-white text-[#52525B] transition hover:bg-[#F7F7F8]"
                    aria-label="Copy cover letter"
                  >
                    <Copy size={14} aria-hidden="true" />
                  </button>
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E4E4E7] bg-white text-[#52525B] transition hover:bg-[#F7F7F8]"
                    aria-label="Download cover letter"
                  >
                    <Download size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-3.5 text-sm leading-6 text-[#18181B]">
                  <p>Dear hiring team,</p>
                  <p>
                    My work has focused on turning complex workflows into clear,
                    usable interfaces for fast-moving teams. I led research,
                    prototyping, and handoff for document-heavy tools where
                    precision and speed mattered.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-2 border-t border-[#ECECEF] pt-4">
                  <span className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[#DDD8FF] bg-[#F1EFFE] px-2.5 text-xs font-medium text-[#5D4EEA]">
                    <RefreshCw size={11} aria-hidden="true" />
                    Regenerate
                  </span>
                  <span className="text-xs text-[#A1A1AA]">Deducts 1 credit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-[#ECECEF] bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
          <div className="mx-auto max-w-[680px] text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E4E4E7] bg-[#FAFAFA] px-3 py-1.5 text-sm font-medium text-[#52525B]">
              <Users size={14} aria-hidden="true" />
              Trusted by job seekers
            </span>
            <h2 className="mt-5 text-[28px] font-bold leading-[34px]">
              Built for real applications.
            </h2>
            <p className="mt-4 text-base leading-7 text-[#52525B]">
              Students, career changers, and active professionals use it to
              write letters they would actually send.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure
                key={testimonial.name}
                className="flex flex-col rounded-[10px] border border-[#E4E4E7] bg-[#FAFAFA] p-6"
              >
                <Quote size={20} className="text-[#D4D4D8]" aria-hidden="true" />
                <blockquote className="mt-4 flex-1 text-sm leading-6 text-[#18181B]">
                  {testimonial.quote}
                </blockquote>
                <figcaption className="mt-6 border-t border-[#ECECEF] pt-4">
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-xs text-[#71717A]">{testimonial.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-[680px] text-center">
          <h2 className="text-[28px] font-bold leading-[34px]">
            Simple, credit-based pricing.
          </h2>
          <p className="mt-4 text-base leading-7 text-[#52525B]">
            Start free, then top up when you need more generations. Each
            successful cover letter uses one credit.
          </p>
        </div>

        <div className="mt-12 grid items-stretch gap-4 md:grid-cols-3">
          {pricing.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-[10px] border p-6 ${
                plan.highlighted
                  ? "border-[#DDD8FF] bg-[#F1EFFE]"
                  : "border-[#E4E4E7] bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">{plan.name}</h3>
                {plan.highlighted && (
                  <span className="rounded-full border border-[#DDD8FF] bg-white px-2.5 py-1 text-xs font-medium text-[#5D4EEA]">
                    Most popular
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm font-medium text-[#6D5DFB]">{plan.credits}</p>
              <p className="mt-3 text-sm leading-6 text-[#52525B]">{plan.price}</p>

              <ul className="mt-6 flex-1 space-y-2.5 border-t border-[#E4E4E7] pt-5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-[#52525B]">
                    <Check size={15} className="shrink-0 text-[#16A34A]" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`mt-6 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold transition focus-ring ${
                  plan.highlighted
                    ? "bg-[#6D5DFB] text-white hover:bg-[#5D4EEA]"
                    : "border border-[#E4E4E7] bg-white text-[#18181B] hover:border-[#D4D4D8] hover:bg-[#F7F7F8]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-y border-[#ECECEF] bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
          <div className="mx-auto max-w-[760px]">
            <div className="text-center">
              <h2 className="text-[28px] font-bold leading-[34px]">
                Frequently asked questions.
              </h2>
              <p className="mt-4 text-base leading-7 text-[#52525B]">
                Everything you need to know before you start writing.
              </p>
            </div>

            <div className="mt-10 space-y-3">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-[10px] border border-[#E4E4E7] bg-[#FAFAFA] px-5"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-medium text-[#18181B] [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <ChevronDown
                      size={16}
                      className="shrink-0 text-[#71717A] transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="pb-4 text-sm leading-6 text-[#52525B]">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
        <div className="rounded-xl border border-[#E4E4E7] bg-[#F1EFFE] px-6 py-14 text-center sm:px-12">
          <h2 className="mx-auto max-w-[560px] text-[28px] font-bold leading-[34px]">
            Write your next cover letter in minutes.
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-base leading-7 text-[#52525B]">
            Create a free account, get 2 credits, and start with a draft that
            already sounds like you.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#6D5DFB] px-6 text-sm font-semibold text-white transition hover:bg-[#5D4EEA] focus-ring"
          >
            Create your account
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#ECECEF] bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-10">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
            <div className="max-w-[320px] text-center md:text-left">
              <Logo />
              <p className="mt-4 text-sm leading-6 text-[#71717A]">
                A professional writing workspace that uses powerful AI to help
                you apply with confidence.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
              <div>
                <p className="text-sm font-semibold text-[#18181B]">Product</p>
                <ul className="mt-3 space-y-2">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-sm text-[#71717A] transition hover:text-[#18181B]"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#18181B]">Account</p>
                <ul className="mt-3 space-y-2">
                  <li>
                    <Link
                      href="/login"
                      className="text-sm text-[#71717A] transition hover:text-[#18181B]"
                    >
                      Log in
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/signup"
                      className="text-sm text-[#71717A] transition hover:text-[#18181B]"
                    >
                      Sign up
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#18181B]">Contact</p>
                <ul className="mt-3 space-y-2">
                  <li>
                    <Link
                      href="#"
                      className="inline-flex items-center gap-2 text-sm text-[#71717A] transition hover:text-[#18181B]"
                    >
                      <Mail size={14} aria-hidden="true" />
                      support@coverletter.app
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-[#ECECEF] pt-6">
            <p className="text-center text-xs text-[#A1A1AA] md:text-left">
              © {new Date().getFullYear()} AI Cover Letter Generator. Built for
              academic use.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3 md:mt-2 md:justify-end">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#71717A]">
                <Lock size={12} aria-hidden="true" />
                Secure, hashed passwords
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#71717A]">
                <Save size={12} aria-hidden="true" />
                Letters auto-saved
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
