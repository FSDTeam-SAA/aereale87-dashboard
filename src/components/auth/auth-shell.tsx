import type { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type AuthShellProps = {
  children: ReactNode;
  className?: string;
};

export function AuthShell({ children, className }: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f4ed] px-4 py-12">
      <div
        className={cn(
          "w-full max-w-[360px] border border-[#ece4d6] bg-white px-6 py-7 shadow-[0_12px_40px_-28px_rgba(58,44,10,0.28)]",
          className
        )}
      >
        {children}
        <div className="mt-6 flex justify-center gap-3 text-[11px] text-[#9f9a90]">
          <Link href="/" className="transition-colors hover:text-[#24463d]">
            Sign In
          </Link>
          <Link href="/forgot-password" className="transition-colors hover:text-[#24463d]">
            Forgot
          </Link>
          <Link href="/verify-otp" className="transition-colors hover:text-[#24463d]">
            OTP
          </Link>
          <Link href="/new-password" className="transition-colors hover:text-[#24463d]">
            Reset
          </Link>
        </div>
      </div>
    </main>
  );
}
