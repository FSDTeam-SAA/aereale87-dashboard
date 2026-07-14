"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs() {
  const pathname = usePathname();

  const segments = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);

    return parts.map((segment, index) => {
      const href = `/${parts.slice(0, index + 1).join("/")}`;
      const label = segment
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

      return { href, label };
    });
  }, [pathname]);

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;

        return (
          <div key={segment.href} className="flex items-center gap-2">
            {index > 0 ? <ChevronRight className="size-4 text-slate-300" /> : null}
            {isLast ? (
              <span className="font-medium text-slate-900">{segment.label}</span>
            ) : (
              <Link href={segment.href} className="transition-colors hover:text-slate-900">
                {segment.label}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
