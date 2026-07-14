import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function AuthButton({
  children,
  href,
  className,
}: {
  children: ReactNode;
  href?: string;
  className?: string;
}) {
  const styles = cn(
    "flex h-10 w-full items-center justify-center bg-[#d3af39] text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#be9a27]",
    className
  );

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return <button className={styles}>{children}</button>;
}
