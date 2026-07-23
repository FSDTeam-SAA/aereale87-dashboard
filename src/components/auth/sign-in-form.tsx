"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Mail } from "lucide-react";

import { AuthBrand } from "./auth-brand";
import { AuthField } from "./auth-field";
import { AuthShell } from "./auth-shell";
import { PasswordField } from "./password-field";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    const result = await signIn("credentials", {
      email: String(form.get("email") || "").trim().toLowerCase(),
      password: String(form.get("password") || ""),
      redirect: false,
    });
    setPending(false);
    if (!result?.ok) {
      toast.error(result?.error || "Unable to sign in.");
      return;
    }
    const callbackUrl = searchParams.get("callbackUrl");
    const session = await fetch("/api/auth/session").then((response) => response.json());
    const destination = callbackUrl || (session.user?.role === "AUTHOR" ? "/author-dashboard" : "/admin-dashboard");
    router.push(destination);
    router.refresh();
  }

  return (
    <AuthShell>
      <AuthBrand />
      <div className="space-y-3 text-center">
        <h1 className="text-[35px] font-semibold leading-none tracking-tight text-[#24463d] md:text-[38px]">
          Welcome Back
        </h1>
        <p className="mx-auto max-w-[240px] text-[13px] leading-5 text-[#84807a]">
          Welcome back. Sign in to manage authors, publications, and orders.
        </p>
      </div>

      <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
        <AuthField
          label="Email Address"
          name="email"
          placeholder="you@example.com"
          icon={<Mail className="size-3.5" />}
          required
        />
        <PasswordField label="Password" name="password" placeholder="Enter your password" />

        <div className="flex items-center justify-between text-[11px] text-[#8b877f]">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" className="size-3 border border-[#ddd3c0] accent-[#c8a52d]" />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-[#cfac36] transition-colors hover:text-[#b48f16]">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={pending} className="mt-2 flex h-10 w-full items-center justify-center bg-[#d3af39] text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#be9a27] disabled:opacity-60">
          {pending ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </AuthShell>
  );
}
