"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useState } from "react";

import { fieldError, postJson, type ApiResult } from "@/app/shared/api";
import { useToast } from "@/app/shared/toast";
import { Button, TextInput } from "@/app/shared/ui";

export default function AdjustCredits({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setResult(null);

    const data = new FormData(event.currentTarget);
    const response = await postJson("/api/admin/credits", {
      userId,
      delta: Number(data.get("delta")),
      description: String(data.get("description") ?? ""),
    });

    setPending(false);
    setResult(response);

    if (response.ok) {
      toast(`Balance for ${userName} is now ${response.credits}.`);
      setOpen(false);
      router.refresh();
    }
  }

  if (!open) {
    return (
      <Button size="sm" icon={Plus} onClick={() => setOpen(true)}>
        Adjust
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-[420px] rounded-xl border border-[#E4E4E7] bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
      >
        <h2 className="text-base font-semibold">Adjust credits</h2>
        <p className="mt-1.5 text-sm leading-[21px] text-[#52525B]">
          For {userName}. Use a negative number to remove credits.
        </p>

        {result && !result.ok && !result.fieldErrors && (
          <p role="alert" className="mt-4 rounded-lg border border-[#FBD5D5] bg-[#FEF2F2] px-3.5 py-2.5 text-[13px] text-[#B91C1C]">
            {result.error}
          </p>
        )}

        <div className="mt-5 space-y-4">
          <TextInput
            id={`delta-${userId}`}
            name="delta"
            type="number"
            label="Credits"
            placeholder="10"
            required
            error={fieldError(result, "delta")}
          />
          <TextInput
            id={`description-${userId}`}
            name="description"
            label="Reason"
            placeholder="Goodwill credit after a failed generation"
            required
            error={fieldError(result, "description")}
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={pending}>
            Apply adjustment
          </Button>
        </div>
      </form>
    </div>
  );
}
