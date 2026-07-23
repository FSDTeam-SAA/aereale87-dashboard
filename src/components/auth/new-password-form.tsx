"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { publicAuthApi } from "@/lib/public-auth-api";
import { AuthShell } from "./auth-shell";
import { PasswordField } from "./password-field";

export function NewPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    if (password !== form.get("confirmPassword")) return toast.error("Passwords do not match.");
    const email = params.get("email");
    const otp = params.get("otp");
    if (!email || !otp) return router.push("/forgot-password");
    setPending(true);
    try {
      await publicAuthApi.resetPassword(email, otp, password);
      toast.success("Password updated. You can now sign in.");
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reset password.");
    } finally { setPending(false); }
  }

  return <AuthShell className="max-w-[340px] px-5 py-5">
    <div className="space-y-1"><h1 className="text-[16px] font-semibold text-[#263f37]">New Password</h1><p className="text-[10px] leading-4 text-[#8c8780]">Create a new password with at least eight characters.</p></div>
    <form className="mt-5 space-y-3" onSubmit={submit}><PasswordField label="Create a password" name="password" placeholder="Create a password" /><PasswordField label="Confirm Password" name="confirmPassword" placeholder="Confirm your password" /><button type="submit" disabled={pending} className="flex h-10 w-full items-center justify-center bg-[#d3af39] text-[11px] font-bold uppercase tracking-[0.16em] text-white hover:bg-[#be9a27] disabled:opacity-50">{pending ? "Updating..." : "Continue"}</button></form>
  </AuthShell>;
}
