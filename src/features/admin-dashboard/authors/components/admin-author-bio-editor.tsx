"use client";

import { useState } from "react";
import { Edit3, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateAuthorProfile } from "../api/authors.api";
import { cn } from "@/lib/utils";

interface Props {
  authorId: string;
  initialBio: string | null;
  accessToken: string;
}

export function AdminAuthorBioEditor({ authorId, initialBio, accessToken }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(initialBio ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (bio.length > 1000) {
      toast.error("Biography cannot exceed 1000 characters.");
      return;
    }

    setSaving(true);
    try {
      await updateAuthorProfile(authorId, { bio: bio.trim() }, accessToken);
      toast.success("Author biography updated successfully.");
      setIsEditing(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update author biography.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setBio(initialBio ?? "");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-3 rounded-lg border border-[#cfaf45]/40 bg-[#cfaf45]/5 p-3.5">
        <div className="flex items-center justify-between">
          <label htmlFor="admin-bio-input" className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Edit Biography
          </label>
          <span
            className={cn(
              "text-xs font-medium tabular-nums",
              bio.length >= 950
                ? "text-red-500 font-semibold"
                : bio.length >= 800
                ? "text-amber-600"
                : "text-slate-400"
            )}
          >
            {bio.length} / 1000
          </span>
        </div>
        <textarea
          id="admin-bio-input"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="Enter author biography, background, and notable achievements..."
          className="w-full rounded-md border border-slate-300 bg-white p-2.5 text-sm text-slate-900 outline-none transition focus:border-[#cfaf45] focus:ring-1 focus:ring-[#cfaf45]"
        />
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200/60 disabled:opacity-50"
          >
            <X className="size-3.5" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#cfaf45] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#b79731] disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Check className="size-3.5" />
                Save Bio
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <div className="flex items-center justify-between pb-1">
        <p className="text-xs uppercase tracking-wider text-slate-500">Bio</p>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#997b1e] hover:text-[#7f6414]"
        >
          <Edit3 className="size-3.5" />
          <span>Edit Bio</span>
        </button>
      </div>
      <p className="mt-1 whitespace-pre-line text-sm text-slate-800 leading-relaxed">
        {bio || <span className="italic text-slate-400">No biography provided yet. Click &quot;Edit Bio&quot; to add one.</span>}
      </p>
    </div>
  );
}