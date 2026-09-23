"use client";

import { useRouter } from "next/navigation";
import { Download, MoreHorizontal, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useToast } from "@/app/shared/toast";
import { Button } from "@/app/shared/ui";

export default function LetterActions({
  letterId,
  title,
}: {
  letterId: string;
  title: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function handleDelete() {
    setDeleting(true);
    const response = await fetch(`/api/cover-letters/${letterId}`, { method: "DELETE" });
    setDeleting(false);

    if (!response.ok) {
      toast("Could not delete that letter.", "error");
      return;
    }

    setConfirming(false);
    toast("Cover letter deleted.");
    router.refresh();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${title}`}
        className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-[#71717A] transition hover:bg-[#F7F7F8] hover:text-[#18181B]"
      >
        <MoreHorizontal size={16} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-9 z-20 w-[184px] rounded-lg border border-[#E4E4E7] bg-white p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
        >
          <a
            role="menuitem"
            href={`/api/cover-letters/${letterId}/pdf`}
            onClick={() => setOpen(false)}
            className="focus-ring flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] text-[#52525B] transition hover:bg-[#F7F7F8] hover:text-[#18181B]"
          >
            <Download size={14} aria-hidden="true" />
            Download PDF
          </a>
          <div className="my-1.5 h-px bg-[#ECECEF]" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              setConfirming(true);
            }}
            className="focus-ring flex h-8 w-full items-center gap-2.5 rounded-md px-2.5 text-[13px] text-[#DC2626] transition hover:bg-[#FEF2F2]"
          >
            <Trash2 size={14} aria-hidden="true" />
            Delete
          </button>
        </div>
      )}

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-letter-title"
            className="w-full max-w-[420px] rounded-xl border border-[#E4E4E7] bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
          >
            <h2 id="delete-letter-title" className="text-base font-semibold">
              Delete this cover letter?
            </h2>
            <p className="mt-2 text-sm leading-[21px] text-[#52525B]">
              {title} will be removed permanently. The credit it used is not refunded.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={() => setConfirming(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} loading={deleting}>
                Delete letter
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
