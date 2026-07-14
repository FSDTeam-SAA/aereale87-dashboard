import Link from "next/link";

import { AuthButton } from "./auth-actions";
import { AuthShell } from "./auth-shell";

const otpDigits = ["4", "2", "6", "", "", ""];

export function VerifyOtpForm() {
  return (
    <AuthShell className="max-w-[340px] px-5 py-5">
      <div className="space-y-1">
        <h1 className="text-[16px] font-semibold text-[#263f37]">Enter OTP</h1>
        <p className="text-[10px] leading-4 text-[#8c8780]">
          An OTP has been sent to your email address please verify it below
        </p>
      </div>

      <div className="mt-5 space-y-4">
        <div className="grid grid-cols-6 gap-2">
          {otpDigits.map((digit, index) => (
            <div
              key={`${digit}-${index}`}
              className="flex h-9 items-center justify-center border border-[#e8dfd3] bg-[#fbf9f4] text-sm font-semibold text-[#3b4b46]"
            >
              {digit}
            </div>
          ))}
        </div>

        <p className="text-center text-[10px] text-[#8c8780]">
          Didn&apos;t Receive OTP?{" "}
          <Link href="/forgot-password" className="font-medium text-[#cfac36] hover:text-[#b48f16]">
            Resend OTP
          </Link>
        </p>

        <AuthButton href="/new-password">Verify</AuthButton>
      </div>
    </AuthShell>
  );
}
