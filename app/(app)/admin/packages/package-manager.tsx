"use client";

import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { fieldError, postJson, type ApiResult } from "@/app/shared/api";
import { useToast } from "@/app/shared/toast";
import { Badge, Button, TextInput } from "@/app/shared/ui";
import { formatMoney } from "@/lib/format";

export type ManagedPackage = {
  id: string;
  slug: string;
  name: string;
  credits: number;
  priceCents: number;
  currency: string;
  description: string;
  active: boolean;
  sortOrder: number;
  sold: number;
};

type Draft = Omit<ManagedPackage, "id" | "sold" | "currency">;

const BLANK: Draft = {
  slug: "",
  name: "",
  credits: 10,
  priceCents: 500,
  description: "",
  active: true,
  sortOrder: 0,
};

export default function PackageManager({ packages }: { packages: ManagedPackage[] }) {
  const router = useRouter();
  const toast = useToast();
  const [editing, setEditing] = useState<ManagedPackage | "new" | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggleActive(entry: ManagedPackage) {
    setBusyId(entry.id);

    const response = await fetch(`/api/admin/packages/${entry.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ active: !entry.active }),
    });

    setBusyId(null);
    if (!response.ok) {
      toast("Could not update that package.", "error");
      return;
    }

    toast(entry.active ? `${entry.name} is no longer on sale.` : `${entry.name} is on sale.`);
    router.refresh();
  }

  async function remove(entry: ManagedPackage) {
    setBusyId(entry.id);

    const response = await fetch(`/api/admin/packages/${entry.id}`, { method: "DELETE" });
    const data = await response.json().catch(() => null);

    setBusyId(null);
    if (!response.ok) {
      toast(data?.error ?? "Could not remove that package.", "error");
      return;
    }

    toast(
      data?.retired
        ? `${entry.name} has been sold before, so it was retired instead of deleted.`
        : `${entry.name} deleted.`,
    );
    router.refresh();
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button variant="primary" icon={Plus} onClick={() => setEditing("new")}>
          New package
        </Button>
      </div>

      <ul className="divide-y divide-[#ECECEF] overflow-hidden rounded-[10px] border border-[#E4E4E7] bg-white">
        {packages.map((entry) => (
          <li key={entry.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                {entry.name}
                {entry.active ? (
                  <Badge tone="success">On sale</Badge>
                ) : (
                  <Badge tone="neutral">Hidden</Badge>
                )}
              </p>
              <p className="mt-0.5 truncate text-[13px] text-[#71717A]">
                {entry.description} · {entry.slug}
              </p>
            </div>

            <span className="text-[13px] text-[#71717A]">
              {entry.sold} {entry.sold === 1 ? "sale" : "sales"}
            </span>
            <span className="w-[72px] text-right text-[13px] text-[#52525B]">
              {entry.credits} cr
            </span>
            <span className="w-[72px] text-right text-sm font-medium tabular-nums">
              {formatMoney(entry.priceCents, entry.currency)}
            </span>

            <div className="flex items-center gap-1.5">
              <Button size="sm" onClick={() => toggleActive(entry)} disabled={busyId === entry.id}>
                {entry.active ? "Hide" : "Publish"}
              </Button>
              <Button size="sm" icon={Pencil} onClick={() => setEditing(entry)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="danger"
                icon={Trash2}
                aria-label={`Remove ${entry.name}`}
                onClick={() => remove(entry)}
                disabled={busyId === entry.id}
              />
            </div>
          </li>
        ))}
      </ul>

      {editing && (
        <PackageDialog
          entry={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(message) => {
            setEditing(null);
            toast(message);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function PackageDialog({
  entry,
  onClose,
  onSaved,
}: {
  entry: ManagedPackage | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);

  const initial: Draft = entry
    ? {
        slug: entry.slug,
        name: entry.name,
        credits: entry.credits,
        priceCents: entry.priceCents,
        description: entry.description,
        active: entry.active,
        sortOrder: entry.sortOrder,
      }
    : BLANK;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setResult(null);

    const data = new FormData(event.currentTarget);
    const body = {
      name: String(data.get("name") ?? ""),
      slug: String(data.get("slug") ?? ""),
      description: String(data.get("description") ?? ""),
      credits: Number(data.get("credits")),
      priceCents: Math.round(Number(data.get("price")) * 100),
      sortOrder: Number(data.get("sortOrder")),
      active: data.get("active") === "on",
    };

    const response = entry
      ? await patch(`/api/admin/packages/${entry.id}`, body)
      : await postJson("/api/admin/packages", body);

    setPending(false);
    setResult(response);

    if (response.ok) onSaved(entry ? `${body.name} updated.` : `${body.name} created.`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/20 px-4 py-8">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-[560px] rounded-xl border border-[#E4E4E7] bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
      >
        <h2 className="text-base font-semibold">
          {entry ? `Edit ${entry.name}` : "New credit package"}
        </h2>

        {result && !result.ok && !result.fieldErrors && (
          <p role="alert" className="mt-4 rounded-lg border border-[#FBD5D5] bg-[#FEF2F2] px-3.5 py-2.5 text-[13px] text-[#B91C1C]">
            {result.error}
          </p>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <TextInput
            id="pkg-name"
            name="name"
            label="Name"
            defaultValue={initial.name}
            placeholder="Standard"
            required
            error={fieldError(result, "name")}
          />
          <TextInput
            id="pkg-slug"
            name="slug"
            label="Slug"
            defaultValue={initial.slug}
            placeholder="standard"
            required
            hint="Lowercase letters, numbers and hyphens."
            error={fieldError(result, "slug")}
          />
          <TextInput
            id="pkg-credits"
            name="credits"
            type="number"
            min={1}
            label="Credits"
            defaultValue={initial.credits}
            required
            error={fieldError(result, "credits")}
          />
          <TextInput
            id="pkg-price"
            name="price"
            type="number"
            min={0}
            step="0.01"
            label="Price (USD)"
            defaultValue={(initial.priceCents / 100).toFixed(2)}
            required
            error={fieldError(result, "priceCents")}
          />
        </div>

        <div className="mt-4">
          <TextInput
            id="pkg-description"
            name="description"
            label="Description"
            defaultValue={initial.description}
            placeholder="For an active job search."
            required
            error={fieldError(result, "description")}
          />
        </div>

        <div className="mt-4 flex items-end gap-4">
          <div className="w-[140px]">
            <TextInput
              id="pkg-sort"
              name="sortOrder"
              type="number"
              min={0}
              label="Sort order"
              defaultValue={initial.sortOrder}
              required
              error={fieldError(result, "sortOrder")}
            />
          </div>
          <label className="flex h-10 items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="active"
              defaultChecked={initial.active}
              className="focus-ring h-4 w-4 rounded border-[#D4D4D8] accent-[#6D5DFB]"
            />
            Show on the credits page
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={pending}>
            {entry ? "Save changes" : "Create package"}
          </Button>
        </div>
      </form>
    </div>
  );
}

async function patch(url: string, body: unknown): Promise<ApiResult> {
  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json().catch(() => null)) as ApiResult | null;
    return data ?? { ok: false, error: `Unexpected response (${response.status}).` };
  } catch {
    return { ok: false, error: "Network error. Check your connection and try again." };
  }
}
