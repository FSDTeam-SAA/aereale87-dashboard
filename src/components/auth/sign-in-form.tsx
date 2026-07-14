import Link from "next/link";
import { Mail } from "lucide-react";

import { AuthButton } from "./auth-actions";
import { AuthBrand } from "./auth-brand";
import { AuthField } from "./auth-field";
import { AuthShell } from "./auth-shell";
import { PasswordField } from "./password-field";

export function SignInForm() {
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

      <form className="mt-6 space-y-3">
        <AuthField
          label="Email Address"
          placeholder="you@example.com"
          icon={<Mail className="size-3.5" />}
        />
        <PasswordField label="Password" placeholder="Enter your password" />

        <div className="flex items-center justify-between text-[11px] text-[#8b877f]">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" className="size-3 border border-[#ddd3c0] accent-[#c8a52d]" />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-[#cfac36] transition-colors hover:text-[#b48f16]">
            Forgot password?
          </Link>
        </div>

        <AuthButton href="/author-dashboard" className="mt-2">
          Sign In
        </AuthButton>
      </form>
    </AuthShell>
  );
}
