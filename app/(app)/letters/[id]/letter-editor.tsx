"use client";

import { useRouter } from "next/navigation";
import { Check, Copy, Download, RefreshCw, Save } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { postJson } from "@/app/shared/api";
import { useToast } from "@/app/shared/toast";
import { Badge, Button, ButtonLink, Card, ChipGroup, MatchBar } from "@/app/shared/ui";
import { LETTER_STATUSES, matchLabel, toneLabel, type LetterStatus, type RewriteAction } from "@/lib/domain";
import SelectionToolbar, { type ToolbarAnchor } from "./selection-toolbar";

export type EditorLetter = {
  id: string;
  jobTitle: string;
  company: string;
  tone: string;
  status: string;
  content: string;
  matchScore: number | null;
  matchedSkills: string[];
  missingSkills: string[];
  jobDescription: string;
};

export default function LetterEditor({
  letter,
  credits,
}: {
  letter: EditorLetter;
  credits: number;
}) {
  const router = useRouter();
  const toast = useToast();

  const documentRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<Range | null>(null);

  const [content, setContent] = useState(letter.content);
  const [savedContent, setSavedContent] = useState(letter.content);
  const [status, setStatus] = useState<LetterStatus>(letter.status as LetterStatus);
  const [anchor, setAnchor] = useState<ToolbarAnchor | null>(null);
  const [rewriting, setRewriting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const [documentKey, setDocumentKey] = useState(0);

  const dirty = content !== savedContent;

  const syncFromDocument = useCallback(() => {
    if (documentRef.current) setContent(readDocument(documentRef.current));
  }, []);

  const refreshSelection = useCallback(() => {
    const selection = window.getSelection();
    const container = documentRef.current;

    if (
      !selection ||
      selection.isCollapsed ||
      selection.rangeCount === 0 ||
      !container ||
      !container.contains(selection.anchorNode) ||
      !selection.toString().trim()
    ) {
      selectionRef.current = null;
      setAnchor(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    selectionRef.current = range.cloneRange();
    setAnchor({ top: Math.max(rect.top - 10, 56), left: rect.left + rect.width / 2 });
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", refreshSelection);
    return () => document.removeEventListener("selectionchange", refreshSelection);
  }, [refreshSelection]);

  useEffect(() => {
    if (!dirty) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  async function handleRewrite(action: RewriteAction, instruction?: string) {
    const range = selectionRef.current;
    const passage = range?.toString().trim();
    if (!range || !passage) return;

    setRewriting(true);
    const response = await postJson("/api/ai/rewrite", {
      letterId: letter.id,
      passage,
      action,
      ...(instruction ? { instruction } : {}),
    });
    setRewriting(false);

    if (!response.ok) {
      toast(response.error, "error");
      return;
    }

    range.deleteContents();
    range.insertNode(document.createTextNode(response.replacement as string));

    window.getSelection()?.removeAllRanges();
    selectionRef.current = null;
    setAnchor(null);
    syncFromDocument();
    toast("Selection rewritten.");
  }

  async function save(nextStatus: LetterStatus = status) {
    setSaving(true);

    const response = await fetch(`/api/cover-letters/${letter.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content, status: nextStatus }),
    });
    const data = await response.json().catch(() => null);
    setSaving(false);

    if (!response.ok) {
      toast(data?.error ?? "Could not save the letter.", "error");
      return;
    }

    setSavedContent(content);
    setStatus(nextStatus);
    toast("Cover letter saved.");
    router.refresh();
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast("Copied to clipboard.");
    } catch {
      toast("Your browser blocked clipboard access.", "error");
    }
  }

  async function handleRegenerate() {
    if (credits < 1) {
      toast("You are out of credits.", "error");
      return;
    }

    setRegenerating(true);
    const response = await postJson(`/api/cover-letters/${letter.id}/regenerate`, {});
    setRegenerating(false);

    if (!response.ok) {
      toast(response.error, "error");
      return;
    }

    const fresh = (response.letter as { content: string }).content;
    setContent(fresh);
    setSavedContent(fresh);
    setDocumentKey((key) => key + 1);
    toast("Letter regenerated. One credit used.");
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div>
        <div className="mb-3 flex items-center gap-3">
          <p className="text-[13px] text-[#71717A]">
            {dirty ? "Unsaved changes" : "All changes saved"}
          </p>
          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#D4D4D8]" />
          <p className="text-[13px] text-[#71717A]">
            Select any passage to rewrite it with AI
          </p>
        </div>

        <div className="rounded-[10px] border border-[#E4E4E7] bg-white">
          <div
            key={documentKey}
            ref={documentRef}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label="Cover letter body"
            spellCheck
            onInput={syncFromDocument}
            onBlur={syncFromDocument}
            className="focus-ring mx-auto max-w-[780px] px-6 py-10 text-[15px] leading-[1.65] text-[#18181B] sm:px-12 sm:py-14 [&>p]:mb-[1.1em] [&>p:last-child]:mb-0 [&>div]:mb-[1.1em]"
          >
            {letter.content.split(/\n{2,}/).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            icon={Save}
            onClick={() => save()}
            loading={saving}
            disabled={!dirty && status === letter.status}
          >
            Save
          </Button>
          <Button icon={copied ? Check : Copy} onClick={handleCopy}>
            {copied ? "Copied" : "Copy text"}
          </Button>
          <ButtonLink href={`/api/cover-letters/${letter.id}/pdf`} icon={Download}>
            Download PDF
          </ButtonLink>
          <Button
            icon={RefreshCw}
            onClick={handleRegenerate}
            loading={regenerating}
            disabled={credits < 1}
            className="ml-auto"
          >
            Regenerate · 1 credit
          </Button>
        </div>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-10 lg:self-start">
        {letter.matchScore !== null && (
          <Card>
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold">Job match</h2>
              <span className="text-sm tabular-nums text-[#52525B]">{letter.matchScore}%</span>
            </div>
            <p className="mt-1 text-[13px] text-[#71717A]">{matchLabel(letter.matchScore)}</p>
            <div className="mt-3">
              <MatchBar score={letter.matchScore} />
            </div>

            {letter.matchedSkills.length > 0 && (
              <SkillList title="Covered" skills={letter.matchedSkills} tone="success" />
            )}
            {letter.missingSkills.length > 0 && (
              <SkillList title="Not evidenced" skills={letter.missingSkills} tone="warning" />
            )}
          </Card>
        )}

        <Card>
          <h2 className="text-sm font-semibold">Status</h2>
          <div className="mt-3">
            <ChipGroup
              name="Letter status"
              options={LETTER_STATUSES}
              value={status}
              onChange={(next) => {
                setStatus(next);
                void save(next);
              }}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold">Brief</h2>
          <dl className="mt-3 space-y-2.5 text-[13px]">
            <Row label="Role" value={letter.jobTitle} />
            <Row label="Company" value={letter.company} />
            <Row label="Tone" value={toneLabel(letter.tone)} />
          </dl>
          <details className="mt-4 border-t border-[#ECECEF] pt-3">
            <summary className="focus-ring cursor-pointer list-none text-[13px] font-medium text-[#52525B] hover:text-[#18181B]">
              Job description
            </summary>
            <p className="mt-2.5 max-h-[260px] overflow-y-auto whitespace-pre-wrap text-[13px] leading-5 text-[#71717A]">
              {letter.jobDescription}
            </p>
          </details>
        </Card>
      </aside>

      {anchor && (
        <SelectionToolbar
          anchor={anchor}
          pending={rewriting}
          onAction={handleRewrite}
          onDismiss={() => {
            window.getSelection()?.removeAllRanges();
            setAnchor(null);
          }}
        />
      )}
    </div>
  );
}

function SkillList({
  title,
  skills,
  tone,
}: {
  title: string;
  skills: string[];
  tone: "success" | "warning";
}) {
  return (
    <div className="mt-4 border-t border-[#ECECEF] pt-3">
      <p className="text-xs font-medium text-[#71717A]">{title}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <Badge key={skill} tone={tone}>
            {skill}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-[70px] shrink-0 text-[#71717A]">{label}</dt>
      <dd className="min-w-0 flex-1 break-words font-medium">{value}</dd>
    </div>
  );
}

function readDocument(element: HTMLElement): string {
  return Array.from(element.childNodes)
    .map((node) => (node.textContent ?? "").replace(/ /g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
}
