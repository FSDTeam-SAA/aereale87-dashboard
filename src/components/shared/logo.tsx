import { cn } from "@/lib/utils";

type LogoProps = {
  inverted?: boolean;
};

export function Logo({ inverted = false }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-bold text-white">
        A
      </div>
      <div className="space-y-0.5">
        <p
          className={cn(
            "text-base font-semibold tracking-tight",
            inverted ? "text-white" : "text-slate-950"
          )}
        >
          Aereale87
        </p>
        <p
          className={cn(
            "text-xs uppercase tracking-[0.2em]",
            inverted ? "text-slate-400" : "text-slate-500"
          )}
        >
          Dashboard Suite
        </p>
      </div>
    </div>
  );
}
