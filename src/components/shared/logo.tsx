import { cn } from "@/lib/utils";

type LogoProps = {
  inverted?: boolean;
};

export function Logo({ inverted = false }: LogoProps) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div className="flex size-[86px] items-center justify-center rounded-[26px] border border-[#b28e18] bg-[radial-gradient(circle_at_50%_35%,#f8e988_0%,#d0aa21_48%,#705109_100%)] text-[28px] font-black text-[#233010] shadow-[0_18px_30px_-20px_rgba(0,0,0,0.9)]">
        WE
      </div>
      <div className="space-y-0.5">
        <p
          className={cn(
            "text-[17px] font-semibold leading-none tracking-tight",
            inverted ? "text-[#1f2c16]" : "text-[#1f281f]"
          )}
        >
          Wonder Emporium
        </p>
        <p
          className={cn(
            "text-[11px] leading-none",
            inverted ? "text-[#1f2c16]" : "text-[#586557]"
          )}
        >
          Book & Publishing
        </p>
      </div>
    </div>
  );
}
