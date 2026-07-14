export function Loading() {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-white/70">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span className="size-3 animate-pulse rounded-full bg-emerald-600" />
        Loading dashboard data...
      </div>
    </div>
  );
}
