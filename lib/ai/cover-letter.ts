import { complete } from "@/lib/ai/deepseek";
import { TONES, type RewriteAction } from "@/lib/domain";

export type LetterBrief = {
  applicantName: string;
  jobTitle: string;
  company: string;
  jobDescription: string;
  tone: string;
  skills: string;
  experience: string;
};

export type GeneratedLetter = {
  content: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
};

const SYSTEM_PROMPT = `You write cover letters for job applicants.

Rules:
- Write only what the applicant's own background supports. Never invent an
  employer, a degree, a metric or a date that was not supplied.
- Address the specific role and company, and draw a line from the applicant's
  stated experience to what the posting actually asks for.
- Three to five paragraphs, 250 to 400 words, unless the tone says otherwise.
- Open with the role being applied for. Close with a plain call to action.
- Plain prose. No markdown, no bullet points, no headings, no subject line, no
  placeholder brackets such as [Company] or [Date].
- Do not include the letterhead, date, or recipient address block. Start at the
  greeting and end at the sign-off.
- Avoid stock phrases: "I am writing to express my keen interest", "perfect
  fit", "team player", "think outside the box", "passionate about".`;

function toneInstruction(tone: string): string {
  const match = TONES.find((entry) => entry.value === tone);
  return match ? `${match.label} — ${match.hint}` : "Professional";
}

function buildUserPrompt(brief: LetterBrief): string {
  return [
    `Applicant name: ${brief.applicantName}`,
    `Target role: ${brief.jobTitle}`,
    `Company: ${brief.company}`,
    `Requested tone: ${toneInstruction(brief.tone)}`,
    "",
    "Applicant's skills:",
    brief.skills,
    "",
    "Applicant's experience and achievements:",
    brief.experience,
    "",
    "Job description:",
    brief.jobDescription,
    "",
    "Return a single JSON object with these keys:",
    '"letter": the finished cover letter as one string, paragraphs separated by \\n\\n.',
    '"matchScore": integer 0-100, how well this applicant fits this posting.',
    '"matchedSkills": array of up to 8 requirements from the posting the applicant clearly meets.',
    '"missingSkills": array of up to 6 requirements the applicant has not evidenced.',
    "",
    "Skill entries are short labels of one to four words, taken from the posting's own wording.",
  ].join("\n");
}

export async function generateCoverLetter(brief: LetterBrief): Promise<GeneratedLetter> {
  const raw = await complete({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(brief) },
    ],
    temperature: 0.7,
    maxTokens: 2000,
    json: true,
  });

  const parsed = parseJsonObject(raw);

  const content = cleanLetter(String(parsed.letter ?? ""));
  if (content.length < 80) {
    throw new Error("The AI service returned an unusably short letter.");
  }

  return {
    content,
    matchScore: clampScore(parsed.matchScore),
    matchedSkills: toStringList(parsed.matchedSkills, 8),
    missingSkills: toStringList(parsed.missingSkills, 6),
  };
}

const REWRITE_INSTRUCTIONS: Record<RewriteAction, string> = {
  rewrite: "Rewrite it so it reads better, keeping the same meaning and length.",
  shorten: "Cut it to roughly two thirds of its length without losing substance.",
  expand: "Add one or two concrete supporting sentences. Do not invent facts.",
  professional: "Make the register more formal and measured.",
  confident: "Make it more direct about the applicant's impact, without boasting.",
  natural: "Make it sound like a person wrote it. Remove stiff or stock phrasing.",
  specific: "Replace vague claims with the concrete detail already present.",
};

export async function rewritePassage(options: {
  passage: string;
  action: RewriteAction;
  instruction?: string;
  letter: string;
  tone: string;
}): Promise<string> {
  const { passage, action, instruction, letter, tone } = options;

  const result = await complete({
    messages: [
      {
        role: "system",
        content: [
          "You edit one passage of a cover letter.",
          "Return only the replacement text: no preamble, no quotes, no markdown, no explanation.",
          "Keep the applicant's facts exactly as they are. Never add an employer, metric or date.",
          `Hold the overall tone: ${toneInstruction(tone)}.`,
        ].join("\n"),
      },
      {
        role: "user",
        content: [
          "Full letter, for context only:",
          letter,
          "",
          "Passage to edit:",
          passage,
          "",
          "Instruction:",
          instruction?.trim() || REWRITE_INSTRUCTIONS[action],
        ].join("\n"),
      },
    ],
    temperature: 0.6,
    maxTokens: 900,
  });

  return cleanLetter(result);
}

function parseJsonObject(raw: string): Record<string, unknown> {
  const fenced = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");
  const candidate = start === -1 || end === -1 ? fenced : fenced.slice(start, end + 1);

  try {
    const value = JSON.parse(candidate);
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
  } catch {
  }
  throw new Error("The AI service returned a response that could not be read.");
}

function cleanLetter(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/^\s*```(?:\w+)?\s*|\s*```\s*$/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1$2")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function clampScore(value: unknown): number {
  const score = Math.round(Number(value));
  if (!Number.isFinite(score)) return 0;
  return Math.min(100, Math.max(0, score));
}

function toStringList(value: unknown, limit: number): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const result: string[] = [];

  for (const entry of value) {
    const text = String(entry ?? "").trim().slice(0, 60);
    const key = text.toLowerCase();
    if (!text || seen.has(key)) continue;
    seen.add(key);
    result.push(text);
    if (result.length === limit) break;
  }
  return result;
}
