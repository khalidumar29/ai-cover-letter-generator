"use client";

import { Loader2, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { REWRITE_ACTIONS, type RewriteAction } from "@/lib/domain";

export type ToolbarAnchor = { top: number; left: number };

/**
 * Contextual AI actions for the selected passage.
 *
 * Positioned against the live selection rectangle and dismissed as soon as the
 * selection goes away, so the editor is not permanently ringed with controls.
 * Buttons suppress mousedown because taking focus would collapse the very
 * selection they are about to act on.
 */
export default function SelectionToolbar({
  anchor,
  pending,
  onAction,
  onDismiss,
}: {
  anchor: ToolbarAnchor;
  pending: boolean;
  onAction: (action: RewriteAction, instruction?: string) => void;
  onDismiss: () => void;
}) {
  const [asking, setAsking] = useState(false);
  const [instruction, setInstruction] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (asking) inputRef.current?.focus();
  }, [asking]);

  const keepSelection = (event: React.MouseEvent) => event.preventDefault();

  return (
    <div
      style={{ top: anchor.top, left: anchor.left }}
      onMouseDown={keepSelection}
      className="pointer-events-auto fixed z-30 -translate-x-1/2 -translate-y-full"
    >
      <div className="rounded-lg border border-[#E4E4E7] bg-white p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
        {pending ? (
          <div className="flex items-center gap-2 px-2.5 py-1.5 text-[13px] text-[#52525B]">
            <Loader2 size={14} className="animate-spin text-[#6D5DFB]" aria-hidden="true" />
            Rewriting the selection…
          </div>
        ) : asking ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (instruction.trim()) onAction("rewrite", instruction);
            }}
            className="flex items-center gap-1.5"
          >
            <input
              ref={inputRef}
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              onMouseDown={(event) => event.stopPropagation()}
              placeholder="Tell the model what to change"
              maxLength={300}
              className="focus-ring h-8 w-[260px] rounded-md border border-[#E4E4E7] px-2.5 text-[13px] placeholder:text-[#A1A1AA]"
            />
            <button
              type="submit"
              disabled={!instruction.trim()}
              className="focus-ring flex h-8 items-center gap-1.5 rounded-md bg-[#6D5DFB] px-2.5 text-[13px] font-medium text-white transition hover:bg-[#5D4EEA] disabled:opacity-50"
            >
              <Sparkles size={13} aria-hidden="true" />
              Apply
            </button>
            <button
              type="button"
              onClick={() => setAsking(false)}
              aria-label="Cancel instruction"
              className="focus-ring flex h-8 w-8 items-center justify-center rounded-md text-[#71717A] transition hover:bg-[#F7F7F8]"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-0.5">
            {REWRITE_ACTIONS.map((action) => (
              <button
                key={action.value}
                type="button"
                onClick={() => onAction(action.value as RewriteAction)}
                className="focus-ring h-8 whitespace-nowrap rounded-md px-2.5 text-[13px] font-medium text-[#52525B] transition hover:bg-[#F7F7F8] hover:text-[#18181B]"
              >
                {action.label}
              </button>
            ))}
            <span aria-hidden="true" className="mx-1 h-5 w-px bg-[#ECECEF]" />
            <button
              type="button"
              onClick={() => setAsking(true)}
              className="focus-ring flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-[#5D4EEA] transition hover:bg-[#F1EFFE]"
            >
              <Sparkles size={13} aria-hidden="true" />
              Ask AI
            </button>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Hide AI actions"
              className="focus-ring flex h-8 w-8 items-center justify-center rounded-md text-[#A1A1AA] transition hover:bg-[#F7F7F8] hover:text-[#52525B]"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
