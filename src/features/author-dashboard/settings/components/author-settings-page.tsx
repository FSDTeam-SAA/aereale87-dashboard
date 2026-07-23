"use client";

import { FormEvent, useRef, useState } from "react";
import { Camera, ChevronDown, Eye, EyeOff, Loader2, MapPin, Mail, User, Lock, Check } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProfileData = {
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  location: string | null;
};

type Props = {
  accessToken: string;
  email: string;
  name: string;
  isFoundingAuthor: boolean;
  initialProfile: ProfileData;
};

// ─── Shared Input Component ───────────────────────────────────────────────────

function SettingsInput({
  label,
  id,
  icon: Icon,
  type = "text",
  ...props
}: {
  label: string;
  id: string;
  icon?: React.ElementType;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <div className="relative flex items-center">
        {Icon && (
          <span className="pointer-events-none absolute left-3 text-neutral-400">
            <Icon className="size-4" />
          </span>
        )}
        <input
          id={id}
          type={isPassword ? (show ? "text" : "password") : type}
          {...props}
          className={cn(
            "h-11 w-full rounded-lg border border-stone-300 bg-stone-50 text-sm text-neutral-800 outline-none transition focus:border-[#cfaf45] focus:ring-2 focus:ring-[#cfaf45]/20",
            Icon ? "pl-9 pr-4" : "px-4",
            isPassword && "pr-10",
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 text-neutral-400 hover:text-neutral-600"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Founding Author Badge ────────────────────────────────────────────────────

function FoundingBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
      <span className="size-1.5 rounded-full bg-amber-500" />
      Founding Author
    </span>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden rounded-xl border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-100 bg-stone-50/50 px-6 py-4">
        <h2 className="text-base font-semibold text-zinc-800">{title}</h2>
      </div>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
}

// ─── Avatar Upload Section ────────────────────────────────────────────────────

function AvatarSection({
  avatarUrl,
  name,
  isFoundingAuthor,
  accessToken,
  onAvatarChange,
}: {
  avatarUrl: string | null;
  name: string;
  isFoundingAuthor: boolean;
  accessToken: string;
  onAvatarChange: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please select an image file.");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5 MB.");

    setUploading(true);
    const form = new FormData();
    form.set("avatar", file);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/avatar`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form,
      });
      const payload = (await res.json()) as { avatarUrl?: string; message?: string };
      if (!res.ok) return toast.error(payload.message || "Avatar upload failed.");
      onAvatarChange(payload.avatarUrl!);
      toast.success("Profile picture updated.");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="size-24 rounded-full object-cover ring-2 ring-stone-200"
          />
        ) : (
          <div className="flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-[#cfaf45]/30 to-teal-700/30 text-2xl font-bold text-teal-800">
            {initials || <User className="size-8" />}
          </div>
        )}
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-[#cfaf45] shadow-md transition hover:bg-[#b79731] disabled:opacity-60"
          title="Upload profile picture"
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin text-white" />
          ) : (
            <Camera className="size-4 text-white" />
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-lg font-semibold text-neutral-900">{name || "Your Name"}</p>
        {isFoundingAuthor && <FoundingBadge />}
        <p className="text-xs text-neutral-400">
          JPG, PNG or WebP · Max 5 MB
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AuthorSettingsPage({ accessToken, email, name, isFoundingAuthor, initialProfile }: Props) {
  const [profile, setProfile] = useState({
    firstName: initialProfile.firstName ?? '',
    lastName: initialProfile.lastName ?? '',
    location: initialProfile.location ?? '',
    avatarUrl: initialProfile.avatarUrl ?? null,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  // ── Profile Update ──────────────────────────────────────────────────────

  async function handleProfileSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = {
      firstName: profile.firstName.trim() || undefined,
      lastName: profile.lastName.trim() || undefined,
      location: profile.location.trim() || undefined,
    };

    setSavingProfile(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });
      const payload = (await res.json()) as { message?: string };
      if (!res.ok) return toast.error(payload.message || "Failed to update profile.");

      // Update local state with the submitted values so the UI reflects the save
      setProfile(prev => ({
        ...prev,
        firstName: body.firstName || prev.firstName,
        lastName: body.lastName || prev.lastName,
        location: body.location || prev.location,
      }));

      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  }

  // ── Password Change ─────────────────────────────────────────────────────

  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const oldPassword = String(fd.get("oldPassword") || "");
    const newPassword = String(fd.get("newPassword") || "");
    const confirmPassword = String(fd.get("confirmPassword") || "");

    if (newPassword !== confirmPassword) return toast.error("New passwords do not match.");
    if (newPassword.length < 8) return toast.error("Password must be at least 8 characters.");

    setSavingPassword(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const payload = (await res.json()) as { message?: string };
      if (!res.ok) return toast.error(payload.message || "Password change failed.");
      toast.success("Password changed successfully.");
      (e.target as HTMLFormElement).reset();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSavingPassword(false);
    }
  }

  // ── Email Change ────────────────────────────────────────────────────────

  async function handleEmailSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newEmail = String(fd.get("newEmail") || "").trim();
    const password = String(fd.get("emailPassword") || "");

    if (!newEmail.includes("@")) return toast.error("Enter a valid email address.");

    setSavingEmail(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/email`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ newEmail, password }),
      });
      const payload = (await res.json()) as { message?: string };
      if (!res.ok) return toast.error(payload.message || "Email update failed.");
      toast.success("Email updated. Please verify your new email address.");
      (e.target as HTMLFormElement).reset();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSavingEmail(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Profile Section ── */}
      <Section title="Profile Information">
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <AvatarSection
            avatarUrl={profile.avatarUrl}
            name={name}
            isFoundingAuthor={isFoundingAuthor}
            accessToken={accessToken}
            onAvatarChange={(url) => setProfile(prev => ({...prev, avatarUrl: url}))}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsInput
              label="First Name"
              id="firstName"
              name="firstName"
              icon={User}
              value={profile.firstName}
              onChange={(e) => setProfile(prev => ({...prev, firstName: e.target.value}))}
              placeholder="First name"
            />
            <SettingsInput
              label="Last Name"
              id="lastName"
              name="lastName"
              value={profile.lastName}
              onChange={(e) => setProfile(prev => ({...prev, lastName: e.target.value}))}
              placeholder="Last name"
            />
          </div>

          <SettingsInput
            label="Location"
            id="location"
            name="location"
            icon={MapPin}
            value={profile.location}
            onChange={(e) => setProfile(prev => ({...prev, location: e.target.value}))}
            placeholder="City, Country (e.g. New York, USA)"
          />

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center gap-2 rounded-lg bg-[#cfaf45] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b79731] disabled:opacity-60"
            >
              {savingProfile ? (
                <><Loader2 className="size-4 animate-spin" /> Saving…</>
              ) : (
                <><Check className="size-4" /> Save Profile</>
              )}
            </button>
          </div>
        </form>
      </Section>

      {/* ── Email Change Section ── */}
      <Section title="Change Email Address">
        <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 border border-amber-200">
          <strong>Current email:</strong> {email}
          <span className="ml-2 text-amber-600">· You&apos;ll need to verify your new email after changing.</span>
        </div>
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <SettingsInput
            label="New Email Address"
            id="newEmail"
            name="newEmail"
            type="email"
            icon={Mail}
            placeholder="newemail@example.com"
            required
          />
          <SettingsInput
            label="Confirm with Password"
            id="emailPassword"
            name="emailPassword"
            type="password"
            icon={Lock}
            placeholder="Enter your current password"
            required
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingEmail}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:opacity-60"
            >
              {savingEmail ? (
                <><Loader2 className="size-4 animate-spin" /> Updating…</>
              ) : (
                <><Check className="size-4" /> Update Email</>
              )}
            </button>
          </div>
        </form>
      </Section>

      {/* ── Password Change Section ── */}
      <Section title="Change Password">
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <SettingsInput
            label="Current Password"
            id="oldPassword"
            name="oldPassword"
            type="password"
            icon={Lock}
            placeholder="Enter current password"
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsInput
              label="New Password"
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="At least 8 characters"
              required
            />
            <SettingsInput
              label="Confirm New Password"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repeat new password"
              required
            />
          </div>
          <p className="text-xs text-neutral-400">
            Forgot your password?{" "}
            <a href="/forgot-password" className="text-[#cfaf45] hover:underline">
              Reset it here
            </a>
          </p>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-60"
            >
              {savingPassword ? (
                <><Loader2 className="size-4 animate-spin" /> Saving…</>
              ) : (
                <><Lock className="size-4" /> Change Password</>
              )}
            </button>
          </div>
        </form>
      </Section>

      {/* Hidden — preserved for type compat only */}
      <div className="hidden">
        <ChevronDown />
      </div>
    </div>
  );
}
