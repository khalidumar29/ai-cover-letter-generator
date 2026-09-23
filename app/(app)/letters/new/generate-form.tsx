"use client";

import { useRouter } from "next/navigation";
import { Sparkles, Wallet } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { fieldError, postJson, type ApiResult } from "@/app/shared/api";
import { Alert } from "@/app/shared/form";
import { Button, ButtonLink, Card, ChipGroup, Textarea, TextInput } from "@/app/shared/ui";
import { TONES, type Tone } from "@/lib/domain";

const STEPS = [
  "Reading your background",
  "Analysing the job description",
  "Matching requirements",
  "Drafting the letter",
  "Refining the language",
];

const STEP_INTERVAL_MS = 2600;

export default function GenerateForm({ credits }: { credits: number }) {
  const router = useRouter();
  const [tone, setTone] = useState<Tone>("professional");
  const [jobDescription, setJobDescription] = useState("");
  const [pending, setPending] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<ApiResult | null>(null);

  useEffect(() => {
    if (!pending) return;

    const timer = setInterval(() => {
      setStep((current) => Math.min(current + 1, STEPS.length - 1));
    }, STEP_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [pending]);

  const outOfCredits = credits < 1;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || outOfCredits) return;

    setPending(true);
    setStep(0);
    setResult(null);

    const data = new FormData(event.currentTarget);
    const response = await postJson("/api/cover-letters", {
      jobTitle: String(data.get("jobTitle") ?? ""),
      company: String(data.get("company") ?? ""),
      jobDescription: String(data.get("jobDescription") ?? ""),
      skills: String(data.get("skills") ?? ""),
      experience: String(data.get("experience") ?? ""),
      tone,
    });

    if (response.ok) {
      router.push(`/letters/${response.letterId as string}`);
      return;
    }

    setResult(response);
    setPending(false);
  }

  const formError = result && !result.ok && !result.fieldErrors ? result.error : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-6">
        {outOfCredits && (
          <Alert variant="info">
            You have no credits left. Top up to generate another letter — your existing
            letters stay editable.
          </Alert>
        )}
        {formError && <Alert variant="error">{formError}</Alert>}

        <Card>
          <h2 className="text-base font-semibold">The role</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <TextInput
              id="jobTitle"
              name="jobTitle"
              label="Job title"
              placeholder="Frontend Engineer"
              required
              error={fieldError(result, "jobTitle")}
            />
            <TextInput
              id="company"
              name="company"
              label="Company"
              placeholder="Northwind"
              required
              error={fieldError(result, "company")}
            />
          </div>

          <div className="mt-4">
            <Textarea
              id="jobDescription"
              name="jobDescription"
              label="Job description"
              placeholder="Paste the posting — responsibilities, requirements, anything about the team."
              className="min-h-[200px]"
              required
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              counter={`${jobDescription.length.toLocaleString()} / 12,000`}
              hint="The more of the posting you paste, the more specific the letter can be."
              error={fieldError(result, "jobDescription")}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold">Your background</h2>
          <p className="mt-1.5 text-sm leading-[21px] text-[#52525B]">
            Only what you write here is used. Nothing is invented on your behalf.
          </p>

          <div className="mt-5 space-y-4">
            <Textarea
              id="skills"
              name="skills"
              label="Relevant skills"
              placeholder="React, TypeScript, design systems, accessibility, mentoring"
              className="min-h-[80px]"
              required
              hint="A comma-separated list is fine."
              error={fieldError(result, "skills")}
            />
            <Textarea
              id="experience"
              name="experience"
              label="Experience and achievements"
              placeholder="Four years building product UI at a fintech startup. Led the migration to a shared component library used by six teams, cutting new-page build time roughly in half."
              className="min-h-[160px]"
              required
              hint="Concrete results give the letter something to point at."
              error={fieldError(result, "experience")}
            />
          </div>
        </Card>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-10 lg:self-start">
        <Card>
          <h2 className="text-sm font-semibold">Writing tone</h2>
          <div className="mt-3">
            <ChipGroup
              name="Writing tone"
              options={TONES}
              value={tone}
              onChange={setTone}
              describe
            />
          </div>
        </Card>

        <Card>
          {pending ? (
            <div>
              <p className="text-sm font-semibold">Generating</p>
              <ol className="mt-3 space-y-2">
                {STEPS.map((label, index) => (
                  <li
                    key={label}
                    className={`flex items-center gap-2.5 text-[13px] transition-colors duration-[180ms] ${
                      index <= step ? "text-[#18181B]" : "text-[#A1A1AA]"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        index < step
                          ? "bg-[#16A34A]"
                          : index === step
                            ? "animate-pulse bg-[#6D5DFB]"
                            : "bg-[#D4D4D8]"
                      }`}
                    />
                    {label}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-xs leading-4 text-[#71717A]">
                This usually takes 15 to 30 seconds.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-[#52525B]">Cost</span>
                <span className="text-sm font-medium">1 credit</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-sm text-[#52525B]">Balance</span>
                <span className="text-sm font-medium tabular-nums">{credits}</span>
              </div>

              {outOfCredits ? (
                <ButtonLink href="/credits" variant="primary" icon={Wallet} className="mt-5 w-full">
                  Buy credits
                </ButtonLink>
              ) : (
                <Button type="submit" variant="primary" icon={Sparkles} className="mt-5 w-full">
                  Generate cover letter
                </Button>
              )}
            </div>
          )}
        </Card>
      </aside>
    </form>
  );
}
