import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AuthFieldProps = {
  label: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  type?: string;
  placeholder?: string;
  className?: string;
};

export function AuthField({
  label,
  icon,
  trailing,
  type = "text",
  placeholder,
  className,
}: AuthFieldProps) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="block text-[11px] font-medium text-[#263f37]">{label}</span>
      <span className="flex h-10 items-center border border-[#e7dfd2] bg-[#fbf9f4] px-3 text-[#8a867d]">
        {icon ? <span className="mr-2 inline-flex size-4 shrink-0 items-center justify-center">{icon}</span> : null}
        <input
          type={type}
          placeholder={placeholder}
          className="h-full flex-1 bg-transparent text-[12px] text-[#263f37] outline-none placeholder:text-[#a9a39a]"
        />
        {trailing ? <span className="ml-2 inline-flex items-center">{trailing}</span> : null}
      </span>
    </label>
  );
}
