import { Mail } from "lucide-react";

import { AuthButton } from "./auth-actions";
import { AuthField } from "./auth-field";
import { AuthShell } from "./auth-shell";

export function ForgotPasswordForm() {
  return (
    <AuthShell className="max-w-[340px] px-5 py-5">
      <div className="space-y-1">
        <h1 className="text-[16px] font-semibold text-[#263f37]">Forgot Password</h1>
        <p className="text-[10px] leading-4 text-[#8c8780]">
          Please enter the email address linked to your account. We&apos;ll send
          a one-time password (OTP) to your email for verification.
        </p>
      </div>

      <form className="mt-5 space-y-4">
        <AuthField
          label="Email Address"
          placeholder="hello@example.com"
          icon={<Mail className="size-3.5" />}
        />
        <AuthButton href="/verify-otp">Send OTP</AuthButton>
      </form>
    </AuthShell>
  );
}
