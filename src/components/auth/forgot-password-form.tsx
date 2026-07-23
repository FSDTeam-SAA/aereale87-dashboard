"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { toast } from "sonner";

import { publicAuthApi } from "@/lib/public-auth-api";
import { AuthField } from "./auth-field";
import { AuthShell } from "./auth-shell";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") || "").trim().toLowerCase();
    setPending(true);
    try {
      await publicAuthApi.forgotPassword(email);
      toast.success("If the account exists, a reset OTP has been sent.");
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send OTP.");
    } finally {
      setPending(false);
    }
  }

  return <AuthShell className="max-w-[340px] px-5 py-5">
    <div className="space-y-1"><h1 className="text-[16px] font-semibold text-[#263f37]">Forgot Password</h1><p className="text-[10px] leading-4 text-[#8c8780]">Enter the email linked to your admin or author account. We&apos;ll send a password-reset OTP.</p></div>
    <form className="mt-5 space-y-4" onSubmit={submit}>
      <AuthField label="Email Address" name="email" type="email" required placeholder="hello@example.com" icon={<Mail className="size-3.5" />} />
      <button type="submit" disabled={pending} className="flex h-10 w-full items-center justify-center bg-[#d3af39] text-[11px] font-bold uppercase tracking-[0.16em] text-white hover:bg-[#be9a27] disabled:opacity-50">{pending ? "Sending..." : "Send OTP"}</button>
    </form>
  </AuthShell>;
}
